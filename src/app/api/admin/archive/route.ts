import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.post.findMany({
      where: {
        status: 'ARCHIVED',
        authorId: session.user?.id
      },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Admins can see all archived articles
    if (session.user?.role === 'ADMIN') {
      const allArchived = await prisma.post.findMany({
        where: { status: 'ARCHIVED' },
        include: {
          author: { select: { name: true, email: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ articles: allArchived });
    }

    return NextResponse.json({ articles });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch archived articles' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await prisma.post.deleteMany({
      where: {
        id: { in: ids },
        status: 'ARCHIVED'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete articles' }, { status: 500 });
  }
}
