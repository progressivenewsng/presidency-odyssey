import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function GET() {
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
}