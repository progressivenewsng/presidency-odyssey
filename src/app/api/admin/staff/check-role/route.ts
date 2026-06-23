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

    const user = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: { role: true, id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ role: user.role, userId: user.id });

  } catch (error) {
    console.error('Check role error:', error);
    return NextResponse.json({ error: 'Failed to check role' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (role) {
      updateData.role = role;
    }
    
    if (password) {
      updateData.password = password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}