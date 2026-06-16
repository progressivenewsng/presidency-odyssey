import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        images: true,
        tags: true
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing article to preserve slug if not provided
    const existingArticle = await prisma.post.findUnique({
      where: { id },
      select: { slug: true }
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Generate slug from title if needed, otherwise keep existing
    const slug = body.slug || existingArticle.slug;

    // Update article
    const article = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        slug: slug,
        content: body.content,
        categoryId: body.categoryId,
        flags: body.flags,
        tags: {
          deleteMany: {},
          create: body.tags.map((tag: string) => ({ 
            name: tag,
            slug: tag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
          }))
        }
      }
    });

    // Update images - delete existing and create new
    await prisma.postImage.deleteMany({ where: { postId: id } });
    for (const img of body.images) {
      await prisma.postImage.create({
        data: {
          postId: id,
          url: img.url,
          altText: img.altText,
          position: img.position
        }
      });
    }

    return NextResponse.json({ article });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}