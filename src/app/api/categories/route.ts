import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await withRetry(() => 
      prisma.category.findMany({
        where: {
          posts: {
            some: {
              status: 'PUBLISHED'
            }
          }
        },
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    );

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        postCount: cat._count.posts
      }))
    });
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}