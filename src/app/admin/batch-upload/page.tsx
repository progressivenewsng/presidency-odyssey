"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

export default function BatchUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    totalRows: number;
    uploaded: number;
    ignored: number;
    articles: Array<{ headline: string; slug: string; state: string }>;
    ignoredEntries: Array<{ reason: string; headline: string; state: string }>;
  } | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentItem, setCurrentItem] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadResult(null);
    setProcessedCount(0);
    setTotalCount(0);
    setCurrentItem(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/batch-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                setError(data.error);
                break;
              }

              if (data.complete) {
                // Download the DOCX report
                const binaryString = atob(data.report);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `batch-upload-report-${Date.now()}.docx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setUploadResult({
                  totalRows: data.totalRows,
                  uploaded: data.uploaded,
                  ignored: data.ignored,
                  articles: [],
                  ignoredEntries: []
                });
                setUploadProgress(100);
                break;
              }

              if (data.processed && data.total) {
                setProcessedCount(data.processed);
                setTotalCount(data.total);
                setCurrentItem(data.current);
                const progress = Math.round((data.processed / data.total) * 100);
                setUploadProgress(progress);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <AdminSidebar />
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Batch Upload Articles</h1>
            <p className="text-gray-600 mt-2">Upload multiple articles from Excel/CSV file and get a DOCX report</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upload File</h2>
              <button
                onClick={async () => {
                  const response = await fetch('/api/admin/batch-upload/template');
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'batch-upload-template.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download Template
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>

              {file && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Selected: {file.name}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-700">
                      {totalCount > 0 ? `Processing ${processedCount} of ${totalCount}` : 'Processing...'} {uploadProgress}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  {currentItem && (
                    <p className="text-xs text-gray-500 mt-2 truncate">Currently: {currentItem}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Please do not close or refresh this page</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {uploading ? `Processing... ${uploadProgress}%` : 'Upload Articles'}
              </button>
            </form>
          </div>

          {/* Results */}
          {uploadResult && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Complete</h2>
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <p className="text-green-700">✓ Batch upload completed successfully. Your DOCX report has been downloaded.</p>
              </div>
              <button
                onClick={() => setUploadResult(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Upload Another File
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Required columns:</strong> state, headline, content, category, article flag</p>
              <p><strong>Optional columns:</strong> tags, schedule publish</p>
              <p><strong>Multiple values:</strong> Separate flags and tags with commas</p>
              <p><strong>Category validation:</strong> Entries with non-existent categories will be skipped</p>
              <p><strong>Image naming convention:</strong> Name state images as "statename1, statename2, etc." (e.g., lagos1, lagos2, kaduna1)</p>
              <p><strong>Image assignment:</strong> Images are automatically assigned based on state name pattern</p>
              <p><strong>Missing images:</strong> Entries without matching state images will be skipped with an error</p>
              <p><strong>Image reuse:</strong> Images will be reused if more articles than images exist for a state</p>
              <p><strong>DOCX report:</strong> A sorted report by state will be automatically downloaded after upload</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
