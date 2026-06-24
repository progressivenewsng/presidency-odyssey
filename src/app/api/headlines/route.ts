import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ headlines: posts });
  } catch (error) {
    console.error('Headlines error:', error);
    return NextResponse.json({ error: 'Failed to fetch headlines' }, { status: 500 });
  }
}
