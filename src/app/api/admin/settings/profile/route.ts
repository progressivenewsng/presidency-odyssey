import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.user?.id || '' },
      data: { name }
    });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}