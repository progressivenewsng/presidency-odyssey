"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
  author: { name: string; email: string };
  category?: { name: string };
  createdAt: string;
  flags: string[];
}

export default function ArticlesPage() {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [scheduledArticles, setScheduledArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPublished, setSelectedPublished] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'published' | 'scheduled'>('published');
  const [publishedPage, setPublishedPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [pagination, setPagination] = useState({
    published: { page: 1, limit: 10, total: 0, totalPages: 0 },
    scheduled: { page: 1, limit: 10, total: 0, totalPages: 0 }
  });

  const fetchArticles = async (publishedPageParam = 1, scheduledPageParam = 1) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (dateFilter) params.append('date', dateFilter);
      params.append('publishedPage', publishedPageParam.toString());
      params.append('scheduledPage', scheduledPageParam.toString());
      params.append('limit', '10');
      
      const url = `/api/admin/articles?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPublishedArticles(data.published || []);
        setScheduledArticles(data.scheduled || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPublishedPage(1);
      setScheduledPage(1);
      fetchArticles(1, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, dateFilter]);

  const handleMassArchive = async () => {
    if (selectedPublished.length === 0) {
      alert('Please select articles to archive');
      return;
    }
    if (!confirm(`Archive ${selectedPublished.length} article(s)?`)) return;

    try {
      await fetch('/api/admin/articles/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPublished }),
      });
      setSelectedPublished([]);
      fetchArticles(publishedPage, scheduledPage);
      alert('Articles archived successfully');
    } catch (error) {
      alert('Failed to archive articles');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      fetchArticles(publishedPage, scheduledPage);
    } catch (error) {
      alert('Failed to delete article');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this article?')) return;
    try {
      await fetch(`/api/admin/articles/${id}/archive`, { method: 'POST' });
      fetchArticles(publishedPage, scheduledPage);
    } catch (error) {
      alert('Failed to archive article');
    }
  };

  const displayedArticles = activeTab === 'published' ? publishedArticles : scheduledArticles;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 ">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-2">Manage your news articles</p>
          </div>

          {/* Actions */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <a
              href="/admin/articles/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
            >
              Publish New
            </a>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 sm:space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${
                activeTab === 'published'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Published ({pagination.published.total})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${
                activeTab === 'scheduled'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Scheduled ({pagination.scheduled.total})
            </button>
          </div>

          {/* Mass Actions for Published */}
          {activeTab === 'published' && selectedPublished.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span>{selectedPublished.length} article(s) selected</span>
              <button
                onClick={handleMassArchive}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Archive Selected
              </button>
            </div>
          )}

          {/* Articles Table */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        {activeTab === 'published' && (
                          <th className="px-4 sm:px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPublished(displayedArticles.map(a => a.id));
                                } else {
                                  setSelectedPublished([]);
                                }
                              }}
                            />
                          </th>
                        )}
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Headline
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Author
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                          Category
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedArticles.map((article) => (
                        <tr key={article.id}>
                          {activeTab === 'published' && (
                            <td className="px-4 sm:px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPublished.includes(article.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPublished([...selectedPublished, article.id]);
                                  } else {
                                    setSelectedPublished(selectedPublished.filter(id => id !== article.id));
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{article.title}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{article.author.name}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{article.category?.name || 'Uncategorized'}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                            {activeTab === 'published'
                              ? format(new Date(article.createdAt), 'MMM d, yyyy')
                              : format(new Date(article.publishedAt!), 'MMM d, yyyy HH:mm')
                            }
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm space-x-2">
                            <a
                              href={`/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              View
                            </a>
                            <a
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-green-600 hover:text-green-700"
                            >
                              Edit
                            </a>
                            {activeTab === 'published' ? (
                              <button
                                onClick={() => handleArchive(article.id)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                Archive
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const currentPagination = activeTab === 'published' ? pagination.published : pagination.scheduled;
                const currentPage = activeTab === 'published' ? publishedPage : scheduledPage;
                if (currentPagination.totalPages <= 1) return null;

                return (
                  <div className="flex items-center justify-center gap-2 mt-6 bg-white rounded-lg shadow p-4">
                    <button
                      onClick={() => {
                        if (activeTab === 'published') {
                          const newPage = Math.max(1, publishedPage - 1);
                          setPublishedPage(newPage);
                          fetchArticles(newPage, scheduledPage);
                        } else {
                          const newPage = Math.max(1, scheduledPage - 1);
                          setScheduledPage(newPage);
                          fetchArticles(publishedPage, newPage);
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {currentPagination.totalPages}
                    </span>
                    <button
                      onClick={() => {
                        if (activeTab === 'published') {
                          const newPage = Math.min(currentPagination.totalPages, publishedPage + 1);
                          setPublishedPage(newPage);
                          fetchArticles(newPage, scheduledPage);
                        } else {
                          const newPage = Math.min(currentPagination.totalPages, scheduledPage + 1);
                          setScheduledPage(newPage);
                          fetchArticles(publishedPage, newPage);
                        }
                      }}
                      disabled={currentPage === currentPagination.totalPages}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                );
              })()}
            </>
          )}

          {!loading && displayedArticles.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500">No articles found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}