import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const posts = await withRetry(() =>
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          createdAt: true,
          flags: true,
          author: {
            select: {
              name: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          images: {
            select: {
              url: true
            },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    );

    const results = posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category?.name || 'Uncategorized',
      author: post.author?.name || 'Unknown',
      date: post.createdAt?.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) || '',
      flags: post.flags || [],
      excerpt: post.excerpt || '',
      imageUrl: post.images[0]?.url,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
