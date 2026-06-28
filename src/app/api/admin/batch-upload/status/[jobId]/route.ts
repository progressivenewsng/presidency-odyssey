import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  try {
    console.log(`[BatchJob Status] Fetching status for job ${jobId}`);
    
    const job = await prisma.batchJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      console.error(`[BatchJob Status] Job ${jobId} not found`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log(`[BatchJob Status] Job ${jobId} status: ${job.status}, processedRows: ${job.processedRows}`);
    
    return NextResponse.json({ job });
  } catch (error) {
    console.error(`[BatchJob Status] Error fetching job ${jobId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
  }
}
