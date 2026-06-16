import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Find scheduled articles that should now be published
    const scheduledArticles = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() }
      },
      include: { author: true, category: true, images: true, tags: true }
    });

    // Publish them
    for (const article of scheduledArticles) {
      await prisma.post.update({
        where: { id: article.id },
        data: { publishedAt: new Date() }
      });
    }

    return NextResponse.json({ 
      success: true, 
      published: scheduledArticles.length 
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Failed to publish scheduled articles' }, { status: 500 });
  }
}