import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
 
    const { id } = await params;
    const body = await request.json();
    const { role, password } = body;
 
    if (!role && !password) {
      return NextResponse.json({ error: 'Missing role or password' }, { status: 400 });
    }
 
    const updateData: any = {};
    
    if (role) {
      updateData.role = role;
    }
    
    if (password) {
      updateData.password = password;
    }
 
    const staff = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
 
    return NextResponse.json({ success: true, staff });
 
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}
 
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
 
    const { id } = await params;
 
    // Prevent deleting yourself
    if (id === session.user?.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }
 
    await prisma.user.delete({
      where: { id }
    });
 
    return NextResponse.json({ success: true });
 
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}