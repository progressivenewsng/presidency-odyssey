import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Archive all articles (admin can archive any, editors only their own)
    const whereClause = session.user?.role === 'ADMIN' 
      ? { id: { in: ids } }
      : { id: { in: ids }, authorId: session.user?.id };

    await prisma.post.updateMany({
      where: whereClause,
      data: { status: 'ARCHIVED' }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mass archive error:', error);
    return NextResponse.json({ error: 'Failed to archive articles' }, { status: 500 });
  }
}