import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Create a batch job
    const job = await prisma.batchJob.create({
      data: {
        userId: session.user?.id || '',
        fileName: file.name,
        totalRows: data.length,
        status: 'PENDING',
        uploadedArticles: data as any, // Store the file data for processing
        currentMessage: 'Job created, waiting to start processing...'
      }
    });

    // Return job ID to redirect to progress page
    return NextResponse.json({ 
      jobId: job.id,
      redirectUrl: `/admin/batch-upload/progress/${job.id}`
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ error: 'Failed to create batch job' }, { status: 500 });
  }
}
