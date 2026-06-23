import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Get all existing categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    // Process each row
    const results = [];
    const usedImagesByState = new Map<string, Set<string>>();
    const uploadedArticles: Array<{ headline: string; slug: string; state: string }> = [];
    const ignoredEntries: Array<{ reason: string; headline: string; state: string }> = [];

    console.log('Starting batch upload processing...');

    for (const row of data as any[]) {
      const state = row['state']?.toString().toLowerCase();
      const headline = row['headline']?.toString();
      const content = row['content']?.toString();
      const category = row['category']?.toString();
      const flags = row['article flag']?.toString();
      const tags = row['tags']?.toString();
      const scheduledFor = row['schedule publish']?.toString();

      // Skip if category doesn't exist
      if (!category || !categoryMap.has(category.toLowerCase())) {
        console.log(`Ignoring entry: "${headline}" - Invalid category: ${category}`);
        ignoredEntries.push({
          reason: 'Invalid category',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
        });
        results.push({
          success: false,
          reason: 'Invalid category',
          headline: headline || 'Unknown'
        });
        continue;
      }

      // Skip if missing required fields
      if (!headline || !content) {
        console.log(`Ignoring entry: "${headline}" - Missing required fields`);
        ignoredEntries.push({
          reason: 'Missing required fields',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
        });
        results.push({
          success: false,
          reason: 'Missing required fields',
          headline: headline || 'Unknown'
        });
        continue;
      }

      // Generate slug from headline
      const baseSlug = headline
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Parse flags and tags
      const flagsArray = flags ? flags.split(',').map((f: string) => f.trim()) : [];
      const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

      // --- FIX: Pre-create or fetch all tags BEFORE attempting post creation ---
      // This eliminates tag slug collisions from inside the post create transaction.
      const tagIds: string[] = [];
      for (const tagName of tagsArray) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          try {
            tag = await prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
          } catch (e: any) {
            // Another process created it between our check and create — fetch it
            if (e.code === 'P2002') {
              tag = await prisma.tag.findUnique({ where: { name: tagName } });
            } else {
              throw e;
            }
          }
        }
        if (tag) tagIds.push(tag.id);
      }

      // Find images for this state (handle president as special case)
      const searchState = state === 'president' ? 'president' : state;
      
      // Use exact matching to avoid "niger" matching "nigeria" images
      // Get all images and filter in JavaScript for more precise matching
      const allImages = await prisma.media.findMany({
        where: {
          filename: {
            startsWith: searchState
          }
        },
        select: { id: true, url: true, filename: true }
      });

      // Filter for exact state name followed by numbers only
      const stateImages = allImages.filter(img => {
        const filename = img.filename.toLowerCase();
        // Match exactly state name followed by digits, not longer words
        const pattern = new RegExp(`^${searchState}[0-9]+$`);
        return pattern.test(filename);
      });

      // Initialize used images for this state if not exists
      if (!usedImagesByState.has(state)) {
        usedImagesByState.set(state, new Set());
      }

      const usedInThisBatch = usedImagesByState.get(state)!;
      
      let selectedImage = null;
      
      if (stateImages.length === 0) {
        // No images available for this state - skip this entry
        console.log(`Ignoring entry: "${headline}" - No images found for state: ${searchState}`);
        ignoredEntries.push({
          reason: 'No images found for this state',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
        });
        results.push({
          success: false,
          reason: 'No images found for this state',
          headline: headline || 'Unknown'
        });
        continue;
      } else if (stateImages.length > 0) {
        const availableImages = stateImages.filter(img => !usedInThisBatch.has(img.id));
        
        if (availableImages.length > 0) {
          // Pick random image from available
          const randomIndex = Math.floor(Math.random() * availableImages.length);
          selectedImage = availableImages[randomIndex];
          usedInThisBatch.add(selectedImage.id);
        } else {
          // All images used in this batch, reset and reuse
          usedInThisBatch.clear();
          const randomIndex = Math.floor(Math.random() * stateImages.length);
          selectedImage = stateImages[randomIndex];
          usedInThisBatch.add(selectedImage.id);
        }
      }

      // --- FIX: Retry loop only catches Post.slug collisions now ---
      let article: any = null;
      let slug = baseSlug;
      let slugAttempt = 1;
      const maxSlugAttempts = 50;

      while (slugAttempt <= maxSlugAttempts && !article) {
        try {
          article = await prisma.post.create({
            data: {
              title: headline,
              slug,
              content,
              categoryId: categoryMap.get(category.toLowerCase())!,
              authorId: session.user?.id || '',
              flags: flagsArray,
              status: 'PUBLISHED',
              publishedAt: scheduledFor ? new Date(scheduledFor) : new Date(),
              // FIX: Use connect with pre-resolved IDs instead of connectOrCreate
              tags: {
                connect: tagIds.map(id => ({ id }))
              },
              images: selectedImage ? {
                create: {
                  url: selectedImage.url,
                  altText: headline,
                  position: 0
                }
              } : undefined
            }
          });
        } catch (error: any) {
          if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
            // Now this ONLY fires for Post.slug conflicts, as tag slugs are pre-resolved
            console.log(`Post slug conflict: "${slug}", trying attempt ${slugAttempt + 1}`);
            slugAttempt++;
            slug = `${baseSlug}-${slugAttempt}`;
          } else {
            console.error(`DB error for "${headline}":`, error.code, error.message);
            ignoredEntries.push({ reason: `Database error: ${error.message}`, headline, state: row['state']?.toString() });
            results.push({ success: false, reason: 'Database error', headline });
            break;
          }
        }
      } // end while

      if (article) {
        results.push({ success: true, headline, slug: article.slug, state: row['state']?.toString() });
        uploadedArticles.push({ headline, slug: article.slug, state: row['state']?.toString() });
      } else if (slugAttempt > maxSlugAttempts) {
        console.log(`Max slug retries exceeded for "${headline}"`);
        ignoredEntries.push({ reason: 'Max slug retries exceeded', headline, state: row['state']?.toString() });
        results.push({ success: false, reason: 'Max slug retries exceeded', headline });
      }
    } // end for

    console.log(`Processing complete. Uploaded: ${uploadedArticles.length}, Ignored: ${ignoredEntries.length}`);
    
    // Generate DOCX report sorted by state with ignored entries
    const doc = await generateDocxReport(uploadedArticles, ignoredEntries);
    const buffer = await Packer.toBuffer(doc);
    
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(buffer);

    // Return the DOCX file
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="batch-upload-report.docx"'
      }
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ error: 'Failed to process batch upload' }, { status: 500 });
  }
}

async function generateDocxReport(
  articles: Array<{ headline: string; slug: string; state: string }>,
  ignoredEntries: Array<{ reason: string; headline: string; state: string }>
) {
  console.log(`Generating DOCX report with ${articles.length} articles and ${ignoredEntries.length} ignored entries`);
  
  // Group by state (case-insensitive)
  const groupedByState = articles.reduce((acc, article) => {
    const state = (article.state || 'UNKNOWN').toLowerCase();
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  // Group ignored entries by state (case-insensitive)
  const ignoredByState = ignoredEntries.reduce((acc, entry) => {
    const state = (entry.state || 'UNKNOWN').toLowerCase();
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(entry);
    return acc;
  }, {} as Record<string, typeof ignoredEntries>);

  console.log('Grouped articles by state:', Object.keys(groupedByState));
  console.log('Grouped ignored entries by state:', Object.keys(ignoredByState));

  const children = [];

  // Special sections first - PRESIDENT and NIGERIA
  const specialSections = ['president', 'nigeria'];
  
  for (const specialSection of specialSections) {
    const hasArticles = groupedByState[specialSection] && groupedByState[specialSection].length > 0;
    const hasIgnored = ignoredByState[specialSection] && ignoredByState[specialSection].length > 0;

    if (hasArticles || hasIgnored) {
      children.push(
        new Paragraph({
          text: `${specialSection.toUpperCase()}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      // Add successfully uploaded articles first
      if (hasArticles) {
        for (const article of groupedByState[specialSection]) {
          children.push(
            new Paragraph({
              text: article.headline,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: `localhost:3000/${article.slug}`,
              spacing: { after: 300 }
            })
          );
        }
      }

      // Add ignored entries after regular ones
      if (hasIgnored) {
        children.push(
          new Paragraph({
            text: `Ignored Entries (${ignoredByState[specialSection].length})`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        for (const entry of ignoredByState[specialSection]) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${entry.headline} - ${entry.reason}`,
                  italics: true
                })
              ],
              spacing: { before: 100, after: 100 }
            })
          );
        }
      }
      
      // Remove from groupedByState so it doesn't appear again
      delete groupedByState[specialSection];
      delete ignoredByState[specialSection];
    }
  }

  // Sort remaining states alphabetically
  const sortedStates = Object.keys(groupedByState).sort();

  for (const state of sortedStates) {
    // Capitalize state name for display
    const displayName = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    const hasArticles = groupedByState[state] && groupedByState[state].length > 0;
    const hasIgnored = ignoredByState[state] && ignoredByState[state].length > 0;

    if (hasArticles || hasIgnored) {
      children.push(
        new Paragraph({
          text: `${displayName.toUpperCase()} STATE`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      // Add successfully uploaded articles first
      if (hasArticles) {
        for (const article of groupedByState[state]) {
          children.push(
            new Paragraph({
              text: article.headline,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: `localhost:3000/${article.slug}`,
              spacing: { after: 300 }
            })
          );
        }
      }

      // Add ignored entries after regular ones
      if (hasIgnored) {
        children.push(
          new Paragraph({
            text: `Ignored Entries (${ignoredByState[state].length})`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        for (const entry of ignoredByState[state]) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${entry.headline} - ${entry.reason}`,
                  italics: true
                })
              ],
              spacing: { before: 100, after: 100 }
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  return doc;
}
