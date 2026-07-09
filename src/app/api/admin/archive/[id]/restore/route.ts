import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(
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
      select: { slug: true, category: { select: { slug: true } } }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Restore the article
    await prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED'
      }
    });

    revalidatePath('/');
    if (article.category?.slug) {
      revalidatePath(`/${article.category.slug}`);
    }
    revalidatePath(`/${article.slug}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore article' }, { status: 500 });
  }
}