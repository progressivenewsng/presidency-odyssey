import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const CHUNK_SIZE = 50; // Process 50 rows at a time

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  try {
    // Get the job
    const job = await prisma.batchJob.findUnique({
      where: { id: jobId },
      include: { user: true }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return NextResponse.json({ job });
    }

    // Update job status to PROCESSING
    await prisma.batchJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' }
    });

    // Get all existing categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

    // Parse Excel file from stored data (we'll need to store the file data)
    // For now, we'll assume the file data is passed or stored
    // In a real implementation, you'd store the file in cloud storage
    
    // For this implementation, we'll process in chunks
    // The actual file data should be stored with the job or passed separately
    // For simplicity, we'll assume the batch upload endpoint stores the data
    
    // Get the job data (file should be stored as base64 or similar)
    // This is a simplified version - in production, use cloud storage
    
    // Process rows in chunks
    let processedCount = job.processedRows;
    const uploadedArticles: Array<{ headline: string; slug: string; state: string }> = [];
    const ignoredEntries: Array<{ reason: string; headline: string; state: string }> = [];
    const usedImagesByState = new Map<string, Set<string>>();

    // Get the file data from the job (assuming it's stored)
    // In a real implementation, you'd fetch from cloud storage
    const fileData = job.uploadedArticles as any; // This would be the file data
    
    if (!fileData || !Array.isArray(fileData)) {
      // If no file data stored, we need to handle this differently
      // For now, we'll mark as failed
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: 'File data not found',
          completedAt: new Date()
        }
      });
      return NextResponse.json({ error: 'File data not found' }, { status: 400 });
    }

    const data = fileData;
    const totalRows = data.length;

    // Process next chunk
    const endIndex = Math.min(processedCount + CHUNK_SIZE, totalRows);
    
    for (let i = processedCount; i < endIndex; i++) {
      const row = data[i];
      const state = row['state']?.toString().toLowerCase();
      const headline = row['headline']?.toString();
      const content = row['content']?.toString();
      const category = row['category']?.toString();
      const flags = row['article flag']?.toString();
      const tags = row['tags']?.toString();
      const scheduledFor = row['schedule publish']?.toString();

      // Update progress
      const progress = ((i + 1) / totalRows) * 100;
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          processedRows: i + 1,
          currentRow: i + 1,
          currentMessage: `Processing row ${i + 1} of ${totalRows}: ${headline?.substring(0, 50)}...`,
          progress
        }
      });

      // Skip if category doesn't exist
      if (!category || !categoryMap.has(category.toLowerCase())) {
        ignoredEntries.push({
          reason: 'Invalid category',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
        });
        continue;
      }

      // Skip if missing required fields
      if (!headline || !content) {
        ignoredEntries.push({
          reason: 'Missing required fields',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
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

      // Pre-create or fetch all tags
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
            } else {
              throw e;
            }
          }
        }
        if (tag) tagIds.push(tag.id);
      }

      // Find images for this state
      const searchState = state === 'president' ? 'president' : state;
      const allImages = await prisma.media.findMany({
        where: {
          filename: {
            startsWith: searchState
          }
        },
        select: { id: true, url: true, filename: true }
      });

      const stateImages = allImages.filter(img => {
        const filename = img.filename.toLowerCase();
        const pattern = new RegExp(`^${searchState}[0-9]+$`);
        return pattern.test(filename);
      });

      if (!usedImagesByState.has(state)) {
        usedImagesByState.set(state, new Set());
      }

      const usedInThisBatch = usedImagesByState.get(state)!;
      let selectedImage = null;
      
      if (stateImages.length === 0) {
        ignoredEntries.push({
          reason: 'No images found for this state',
          headline: headline || 'Unknown',
          state: row['state']?.toString()
        });
        continue;
      } else if (stateImages.length > 0) {
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

      // Create article with slug retry
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
              authorId: job.userId,
              flags: flagsArray,
              status: 'PUBLISHED',
              publishedAt: scheduledFor ? new Date(scheduledFor) : new Date(),
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
            slugAttempt++;
            slug = `${baseSlug}-${slugAttempt}`;
          } else {
            ignoredEntries.push({ reason: `Database error: ${error.message}`, headline, state: row['state']?.toString() });
            break;
          }
        }
      }

      if (article) {
        uploadedArticles.push({ headline, slug: article.slug, state: row['state']?.toString() });
      }
    }

    // Update job with progress
    const currentProgress = (endIndex / totalRows) * 100;
    const isComplete = endIndex >= totalRows;
    
    const updateData: any = {
      processedRows: endIndex,
      successfulRows: uploadedArticles.length,
      failedRows: ignoredEntries.length,
      progress: currentProgress,
      uploadedArticles: JSON.stringify(uploadedArticles),
      ignoredEntries: JSON.stringify(ignoredEntries)
    };

    if (isComplete) {
      // Generate DOCX report
      const doc = await generateDocxReport(uploadedArticles, ignoredEntries);
      const buffer = await Packer.toBuffer(doc);
      
      // Store report (in production, upload to cloud storage)
      const reportUrl = `/api/admin/batch-upload/report/${jobId}`;
      
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
      updateData.reportUrl = reportUrl;
      updateData.currentMessage = 'Batch upload completed successfully';
    } else {
      updateData.currentMessage = `Processed ${endIndex} of ${totalRows} rows...`;
    }

    await prisma.batchJob.update({
      where: { id: jobId },
      data: updateData
    });

    return NextResponse.json({ 
      job: { ...job, ...updateData },
      isComplete,
      processed: endIndex,
      total: totalRows
    });

  } catch (error) {
    console.error('Job processing error:', error);
    await prisma.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    });
    return NextResponse.json({ error: 'Failed to process job' }, { status: 500 });
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
