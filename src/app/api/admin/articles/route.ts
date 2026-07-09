import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function normalizeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || 'article';
}

async function generateUniqueSlug(title: string) {
  const baseSlug = normalizeSlug(title);

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });

    if (!existing) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const publishedPage = parseInt(searchParams.get('publishedPage') || '1');
    const scheduledPage = parseInt(searchParams.get('scheduledPage') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (date) {
      where.createdAt = {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      };
    }

    const publishedSkip = (publishedPage - 1) * limit;
    const scheduledSkip = (scheduledPage - 1) * limit;

    const [published, scheduled, publishedTotal, scheduledTotal] = await Promise.all([
      prisma.post.findMany({
        where: {
          ...where,
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() }
        },
        include: {
          author: { select: { name: true, email: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: publishedSkip,
        take: limit
      }),
      prisma.post.findMany({
        where: {
          ...where,
          status: 'PUBLISHED',
          publishedAt: { gt: new Date() }
        },
        include: {
          author: { select: { name: true, email: true } },
          category: { select: { name: true } }
        },
        orderBy: { publishedAt: 'asc' },
        skip: scheduledSkip,
        take: limit
      }),
      prisma.post.count({
        where: {
          ...where,
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() }
        }
      }),
      prisma.post.count({
        where: {
          ...where,
          status: 'PUBLISHED',
          publishedAt: { gt: new Date() }
        }
      })
    ]);

    return NextResponse.json({ 
      published, 
      scheduled,
      pagination: {
        published: {
          page: publishedPage,
          limit,
          total: publishedTotal,
          totalPages: Math.ceil(publishedTotal / limit)
        },
        scheduled: {
          page: scheduledPage,
          limit,
          total: scheduledTotal,
          totalPages: Math.ceil(scheduledTotal / limit)
        }
      }
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.content || !data.categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = await generateUniqueSlug(data.title);

    // Handle tags
    const tagConnects = data.tags?.map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName, slug: normalizeSlug(tagName) }
    })) || [];

    const createArticle = async (articleSlug: string) => {
      return prisma.post.create({
        data: {
          title: data.title,
          slug: articleSlug,
          content: data.content,
          excerpt: data.excerpt,
          categoryId: data.categoryId,
          authorId: session.user?.id || '',
          flags: data.flags || [],
          status: 'PUBLISHED',
          publishedAt: data.scheduledFor ? new Date(data.scheduledFor) : new Date(),
          tags: {
            connectOrCreate: tagConnects
          },
          images: {
            create: data.images?.map((img: any) => ({
              url: img.url,
              altText: img.altText,
              position: img.position
            })) || []
          }
        },
        include: {
          tags: true,
          images: true,
          category: true
        }
      });
    };

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { slug: true }
    });

    try {
      const article = await createArticle(slug);
      revalidatePath('/');
      if (category?.slug) {
        revalidatePath(`/${category.slug}`);
      }
      revalidatePath(`/${article.slug}`);
      return NextResponse.json({ success: true, article });
    } catch (error: any) {
      console.error('Create article error:', error);

      if (error?.code === 'P2002') {
        const retryArticle = await createArticle(`${slug}-${Date.now()}`);
        revalidatePath('/');
        if (category?.slug) {
          revalidatePath(`/${category.slug}`);
        }
        revalidatePath(`/${retryArticle.slug}`);
        return NextResponse.json({ success: true, article: retryArticle });
      }

      throw error;
    }

  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}