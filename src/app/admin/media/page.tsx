"use client";

import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import { useState, useEffect } from "react";

interface MediaImage {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });

  const fetchImages = async (search = "", currentPage = 1) => {
    try {
      const url = search 
        ? `/api/admin/media?search=${encodeURIComponent(search)}&page=${currentPage}&limit=8`
        : `/api/admin/media?page=${currentPage}&limit=8`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch images:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages("", 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchImages(searchQuery, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setImageNames(files.map(file => file.name.split('.')[0]));
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...imageNames];
    newNames[index] = name;
    setImageNames(newNames);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    if (imageNames.some(name => !name.trim())) {
      alert('Please provide a name for all images');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
        formData.append('names', imageNames[index]);
      });

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSelectedFiles([]);
        setImageNames([]);
        alert('Images uploaded successfully!');
        fetchImages(searchQuery, page);
      } else {
        const error = await response.json();
        alert(`Failed to upload images: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to upload images');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const response = await fetch(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter(img => img.publicId !== publicId));
        alert('Image deleted successfully!');
        fetchImages(searchQuery, page);
      } else {
        const error = await response.json();
        alert(`Failed to delete image: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete image');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 ">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-2">Upload and manage your images</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Upload New Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="text-gray-500">
                  <p className="text-base sm:text-lg">Click to upload or drag and drop</p>
                  <p className="text-xs sm:text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center">
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{file.name}</span>
                      <input
                        type="text"
                        placeholder="Enter image name"
                        value={imageNames[index] || ''}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm w-full sm:w-auto"
                        required
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search images by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Images Grid */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Loading images...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {images.map((image) => (
                  <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{image.filename}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between mt-2">
                        <button
                          onClick={() => handleDelete(image.publicId)}
                          className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 bg-white rounded-lg shadow p-4">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                      fetchImages(searchQuery, newPage);
                    }}
                    disabled={page === 1}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = Math.min(pagination.totalPages, page + 1);
                      setPage(newPage);
                      fetchImages(searchQuery, newPage);
                    }}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No images uploaded yet</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}