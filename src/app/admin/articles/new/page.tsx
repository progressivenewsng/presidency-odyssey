"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mediaImages, setMediaImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    flags: [] as string[],
    tags: [] as string[],
    scheduledFor: '',
  });

  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchMediaImages();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched:', data); // Debug log
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchMediaImages = async (search = "") => {
    try {
      const url = search 
        ? `/api/admin/media?search=${encodeURIComponent(search)}`
        : '/api/admin/media';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMediaImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showMediaLibrary) {
        fetchMediaImages(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showMediaLibrary]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: selectedImages.map(img => ({
            url: img.url,
            altText: img.filename,
            position: img.position || 0
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to success page with article data
        router.push(
          `/admin/articles/success?article=${encodeURIComponent(JSON.stringify(data.article || formData))}&scheduled=${!!formData.scheduledFor}`
        );
      } else {
        alert(formData.scheduledFor ? 'Failed to schedule article' : 'Failed to create article');
      }
    } catch (error) {
      console.error(error);
      alert(formData.scheduledFor ? 'Failed to schedule article' : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.includes(flag)
        ? prev.flags.filter(f => f !== flag)
        : [...prev.flags, flag]
    }));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = (e.currentTarget as HTMLInputElement).value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleMediaSelection = (image: any) => {
    if (!selectedImages.find(img => img.id === image.id)) {
      setSelectedImages([...selectedImages, { ...image, position: selectedImages.length }]);
    }
    setShowMediaLibrary(false);
  };

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages(selectedImages.filter(img => img.id !== imageId));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleDirectUpload = async () => {
    if (uploadFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => formData.append('files', file));

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newImages = result.images.map((img: any, index: number) => ({
          ...img,
          position: selectedImages.length + index
        }));
        setSelectedImages([...selectedImages, ...newImages]);
        setUploadFiles([]);
        alert('Images uploaded successfully!');
      }
    } catch (error) {
      alert('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li><a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</a></li>
              <li><a href="/admin/articles" className="block px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Articles</a></li>
              <li><a href="/admin/media" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Media Library</a></li>
              <li><a href="/admin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Settings</a></li>
              <li><a href="/admin/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Categories</a></li>
              <li><a href="/admin/archive" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Archive</a></li>
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
            <p className="text-gray-600 mt-2">Fill in the details to publish a new article</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No categories found. <a href="/admin/categories" className="text-indigo-600 hover:underline">Create categories first</a>
                </p>
              )}
            </div>

            {/* Image Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Select from Media Library
                  </button>
                  <div className="flex-1">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {uploadFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDirectUpload}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>

                {/* Media Library Modal */}
                {showMediaLibrary && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                      <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold">Select from Media Library</h2>
                        <button
                          type="button"
                          onClick={() => setShowMediaLibrary(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-6">
                        <input
                          type="text"
                          placeholder="Search images by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                        />
                        <div className="grid grid-cols-3 gap-4 max-h-100 overflow-y-auto">
                          {mediaImages.map((image) => (
                            <div
                              key={image.id}
                              onClick={() => handleMediaSelection(image)}
                              className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                                selectedImages.find(img => img.id === image.id)
                                  ? 'border-indigo-600'
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image.url}
                                alt={image.filename}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-2 bg-gray-50">
                                <p className="text-xs text-gray-700 truncate">{image.filename}</p>
                              </div>
                            </div>
                          ))}
                          {mediaImages.length === 0 && (
                            <p className="col-span-3 text-center text-gray-500">No images found</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Images */}
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedImages.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-24 h-24 object-cover rounded border-2 border-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(img.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Flags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Flags</label>
              <div className="flex flex-wrap gap-2">
                {['MAIN_STORY', 'EDITORS_PICK', 'FEATURED', 'TRENDING', 'POPULAR', 'BREAKING_NEWS'].map((flag) => (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      formData.flags.includes(flag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {flag.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  onKeyDown={addTag}
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                />
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Publication (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to publish immediately. When you select a date/time, the article will be automatically published at that time.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : (formData.scheduledFor ? 'Schedule Article' : 'Publish Article')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/articles')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}