"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

interface ArchivedArticle {
  id: string;
  title: string;
  slug: string;
  author: { name: string; email: string };
  category?: { name: string };
  createdAt: string;
}

export default function ArchivePage() {
  const [articles, setArticles] = useState<ArchivedArticle[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    try {
      const response = await fetch('/api/admin/archive');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch archived articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this article to published?')) return;
    try {
      await fetch(`/api/admin/archive/${id}/restore`, { method: 'POST' });
      fetchArchived();
      alert('Article restored successfully');
    } catch (error) {
      alert('Failed to restore article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this article? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/archive/${id}`, { method: 'DELETE' });
      fetchArchived();
      alert('Article deleted permanently');
    } catch (error) {
      alert('Failed to delete article');
    }
  };

  const handleMassDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Permanently delete ${selected.length} article(s)? This cannot be undone.`)) return;
    try {
      await fetch('/api/admin/archive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      setSelected([]);
      fetchArchived();
      alert('Articles deleted permanently');
    } catch (error) {
      alert('Failed to delete articles');
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
            <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600 mt-2">View, restore, or permanently delete archived articles</p>
          </div>

          {selected.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg flex justify-between items-center">
              <span>{selected.length} article(s) selected</span>
              <button
                onClick={handleMassDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected(articles.map(a => a.id));
                          } else {
                            setSelected([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Headline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(article.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelected([...selected, article.id]);
                            } else {
                              setSelected(selected.filter(id => id !== article.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{article.author.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{article.category?.name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleRestore(article.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No archived articles</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
