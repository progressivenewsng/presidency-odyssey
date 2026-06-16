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

  const fetchArticles = async () => {
    try {
      const url = searchQuery || dateFilter
        ? `/api/admin/articles?search=${encodeURIComponent(searchQuery)}&date=${dateFilter}`
        : '/api/admin/articles';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPublishedArticles(data.published || []);
        setScheduledArticles(data.scheduled || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
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
      fetchArticles();
      alert('Articles archived successfully');
    } catch (error) {
      alert('Failed to archive articles');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (error) {
      alert('Failed to delete article');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this article?')) return;
    try {
      await fetch(`/api/admin/articles/${id}/archive`, { method: 'POST' });
      fetchArticles();
    } catch (error) {
      alert('Failed to archive article');
    }
  };

  const displayedArticles = activeTab === 'published' ? publishedArticles : scheduledArticles;

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
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-2">Manage your news articles</p>
          </div>

          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4">
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Publish New
            </a>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'published'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Published ({publishedArticles.length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'scheduled'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Scheduled ({scheduledArticles.length})
            </button>
          </div>

          {/* Mass Actions for Published */}
          {activeTab === 'published' && selectedPublished.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg flex justify-between items-center">
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
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {activeTab === 'published' && (
                      <th className="px-6 py-3 text-left">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Headline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedArticles.map((article) => (
                    <tr key={article.id}>
                      {activeTab === 'published' && (
                        <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{article.author.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{article.category?.name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activeTab === 'published' 
                          ? format(new Date(article.createdAt), 'MMM d, yyyy')
                          : format(new Date(article.publishedAt!), 'MMM d, yyyy HH:mm')
                        }
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
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
          )}

          {!loading && displayedArticles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No articles found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}