import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all stats in parallel
    const [
      totalArticles,
      publishedCount,
      archivedCount,
      categoriesCount,
      tagsCount,
      mediaCount,
      staffCount,
      recentArticles,
      articlesByCategory
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'ARCHIVED' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          category: {
            select: { name: true }
          }
        }
      }),
      prisma.category.findMany({
        select: {
          name: true,
          _count: {
            select: { posts: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      totalArticles,
      publishedCount,
      archivedCount,
      categoriesCount,
      tagsCount,
      mediaCount,
      staffCount,
      recentArticles,
      articlesByCategory
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}