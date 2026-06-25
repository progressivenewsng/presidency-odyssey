import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  try {
    const job = await prisma.batchJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Job not completed yet' }, { status: 400 });
    }

    if (!job.uploadedArticles || !job.ignoredEntries) {
      return NextResponse.json({ error: 'No data available for report' }, { status: 400 });
    }

    const uploadedArticles = JSON.parse(job.uploadedArticles as string);
    const ignoredEntries = JSON.parse(job.ignoredEntries as string);

    // Generate DOCX report
    const doc = await generateDocxReport(uploadedArticles, ignoredEntries);
    const buffer = await Packer.toBuffer(doc);
    
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="batch-upload-report-${job.fileName}.docx"`
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
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
