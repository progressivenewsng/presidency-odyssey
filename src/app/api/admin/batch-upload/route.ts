import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { Document, Paragraph, HeadingLevel, TextRun, Packer } from 'docx';

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

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sendEvent = (data: any) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          };

          // Get categories and create map
          const categories = await prisma.category.findMany();
          const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

          const uploadedArticles: Array<{ headline: string; slug: string; state: string }> = [];
          const ignoredEntries: Array<{ reason: string; headline: string; state: string }> = [];
          const usedImagesByState = new Map<string, Set<string>>();

          // Process each row
          for (let i = 0; i < data.length; i++) {
            const row = data[i] as Record<string, unknown>;
            const headline = row['headline']?.toString();
            const content = row['content']?.toString();
            const category = row['category']?.toString();
            const state = row['state']?.toString();
            const tags = row['tags']?.toString();
            const flags = row['flags']?.toString();
            const scheduledFor = row['scheduledFor']?.toString();

            if (!headline || !content || !category) {
              ignoredEntries.push({ reason: 'Missing required fields', headline: headline || 'Unknown', state: state || 'Unknown' });
              sendEvent({ processed: i + 1, total: data.length, current: headline || 'Unknown' });
              continue;
            }

            if (!categoryMap.has(category.toLowerCase())) {
              ignoredEntries.push({ reason: 'Category not found', headline, state: state || 'Unknown'});
              sendEvent({ processed: i + 1, total: data.length, current: headline });
              continue;
            }

            // Generate slug
            const baseSlug = headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            let slug = baseSlug;
            let slugAttempt = 1;
            const maxSlugAttempts = 10;

            let existingPost = await prisma.post.findUnique({ where: { slug } });
            while (slugAttempt <= maxSlugAttempts && existingPost) {
              slug = `${baseSlug}-${slugAttempt}`;
              existingPost = await prisma.post.findUnique({ where: { slug } });
              slugAttempt++;
            }

            if (existingPost) {
              ignoredEntries.push({ reason: 'Slug conflict', headline, state: state || 'Unknown' });
              sendEvent({ processed: i + 1, total: data.length, current: headline });
              continue;
            }

            // Process tags
            const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
            const tagIds: string[] = [];
            for (const tagName of tagsArray) {
              const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
              let tag = await prisma.tag.findUnique({ where: { name: tagName } });
              if (!tag) {
                try {
                  tag = await prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
                } catch (e: any) {
                  if (e.code === 'P2002') {
                    tag = await prisma.tag.findUnique({ where: { name: tagName } });
                  }
                }
              }
              if (tag) tagIds.push(tag.id);
            }

            // Find images for state
            const searchState = state === 'president' ? 'president' : state;
            const allImages = await prisma.media.findMany({
              where: { filename: { startsWith: searchState } },
              select: { id: true, url: true, filename: true }
            });

            const stateImages = allImages.filter(img => {
              const filename = img.filename.toLowerCase();
              const pattern = new RegExp(`^${searchState}[0-9]+$`);
              return pattern.test(filename);
            });

            if (!usedImagesByState.has(state || "president")) {
              usedImagesByState.set(state || "president", new Set());
            }

            const usedInThisBatch = usedImagesByState.get(state || "president")!;
            let selectedImage = null;
            
            if (stateImages.length > 0) {
              const availableImages = stateImages.filter(img => !usedInThisBatch.has(img.id));
              if (availableImages.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableImages.length);
                selectedImage = availableImages[randomIndex];
                usedInThisBatch.add(selectedImage.id);
              } else {
                usedInThisBatch.clear();
                const randomIndex = Math.floor(Math.random() * stateImages.length);
                selectedImage = stateImages[randomIndex];
                usedInThisBatch.add(selectedImage.id);
              }
            }

            // Create article
            const flagsArray = flags ? flags.split(',').map((f: string) => f.trim()) : [];
            
            try {
              const article = await prisma.post.create({
                data: {
                  title: headline,
                  slug,
                  content,
                  categoryId: categoryMap.get(category.toLowerCase())!,
                  authorId: session.user?.id || '',
                  flags: flagsArray as any,
                  status: 'PUBLISHED',
                  publishedAt: scheduledFor ? new Date(scheduledFor) : new Date(),
                  tags: { connect: tagIds.map(id => ({ id })) },
                  images: selectedImage ? {
                    create: { url: selectedImage.url, altText: headline, position: 0 }
                  } : undefined
                }
              });
              uploadedArticles.push({ headline, slug: article.slug, state: state || 'president' });
            } catch (error: any) {
              ignoredEntries.push({ reason: `Database error: ${error.message}`, headline, state: state || 'Unknown' });
            }

            // Send progress update
            sendEvent({ processed: i + 1, total: data.length, current: headline });
          }

          // Generate DOCX report
          const doc = await generateDocxReport(uploadedArticles, ignoredEntries);
          const buffer = await Packer.toBuffer(doc);

          // Send completion event with the report as base64
          const base64 = buffer.toString('base64');
          sendEvent({ 
            complete: true, 
            totalRows: data.length, 
            uploaded: uploadedArticles.length, 
            ignored: ignoredEntries.length,
            report: base64 
          });

          controller.close();
        } catch (error) {
          console.error('Batch upload error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to process batch upload' })}\n\n`));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
  const groupedByState = articles.reduce((acc, article) => {
    const state = (article.state || 'UNKNOWN').toLowerCase();
    if (!acc[state]) acc[state] = [];
    acc[state].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  const ignoredByState = ignoredEntries.reduce((acc, entry) => {
    const state = (entry.state || 'UNKNOWN').toLowerCase();
    if (!acc[state]) acc[state] = [];
    acc[state].push(entry);
    return acc;
  }, {} as Record<string, typeof ignoredEntries>);

  const children = [];
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

      if (hasArticles) {
        for (const article of groupedByState[specialSection]) {
          children.push(
            new Paragraph({
              text: article.headline,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: `https://presidency-odyssey-k51t.vercel.app/${article.slug}`,
              spacing: { after: 300 }
            })
          );
        }
      }

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
      
      delete groupedByState[specialSection];
      delete ignoredByState[specialSection];
    }
  }

  const sortedStates = Object.keys(groupedByState).sort();

  for (const state of sortedStates) {
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

      if (hasArticles) {
        for (const article of groupedByState[state]) {
          children.push(
            new Paragraph({
              text: article.headline,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: `https://presidency-odyssey-k51t.vercel.app/${article.slug}`,
              spacing: { after: 300 }
            })
          );
        }
      }

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

  return new Document({
    sections: [{ properties: {}, children }]
  });
}
