import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const date = searchParams.get('date');

    const where: any = {
      authorId: session.user?.id,
    };

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

    const [published, scheduled] = await Promise.all([
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
        orderBy: { createdAt: 'desc' }
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
        orderBy: { publishedAt: 'asc' }
      })
    ]);

    return NextResponse.json({ published, scheduled });

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

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Handle tags
    const tagConnects = data.tags?.map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') }
    })) || [];

    const article = await prisma.post.create({
      data: {
        title: data.title,
        slug,
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

    return NextResponse.json({ success: true, article });

  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}