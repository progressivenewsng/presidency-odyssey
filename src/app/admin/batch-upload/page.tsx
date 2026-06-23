"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

export default function BatchUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
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

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // Cap at 99% until upload is complete
            let progress = Math.round((event.loaded / event.total) * 100);
            if (progress === 100 && event.loaded < event.total) {
              progress = 99;
            }
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          setUploadProgress(100);
          if (xhr.status === 200) {
            // Handle DOCX download
            const blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'batch-upload-report.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess(true);
            resolve();
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              setError(data.error || 'Upload failed');
            } catch {
              setError('Upload failed');
            }
            reject();
          }
        });

        xhr.addEventListener('error', () => {
          setError('Failed to upload file');
          reject();
        });

        xhr.responseType = 'blob';
        xhr.open('POST', '/api/admin/batch-upload');
        xhr.send(formData);
      });
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

              {success && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Upload complete! DOCX report has been downloaded.</p>
                </div>
              )}

              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-700">Uploading... {uploadProgress}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Please do not close or refresh this page</p>
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
