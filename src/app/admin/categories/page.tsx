"use client";

import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (response.ok) {
        setNewCategoryName('');
        fetchCategories();
        alert('Category added successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleEditCategory = async (id: string, name: string) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditName('');
        fetchCategories();
        alert('Category updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update category');
      }
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string, hasPosts: boolean) => {
    if (hasPosts) {
      alert('Cannot delete category with published articles');
      return;
    }
    
    if (!confirm('Delete this category?')) return;
    
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchCategories();
        alert('Category deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
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
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Manage news categories</p>
          </div>

          {/* Add Category Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => {
                    const hasPosts = (category._count?.posts || 0) > 0;
                    return (
                      <tr key={category.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {editingId === category.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded"
                              autoFocus
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                        <td className="px-6 py-4 text-gray-500">{category._count?.posts || 0}</td>
                        <td className="px-6 py-4">
                          {editingId === category.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCategory(category.id, editName)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <button
                                onClick={() => startEdit(category)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id, hasPosts)}
                                disabled={hasPosts}
                                className={hasPosts 
                                  ? "text-gray-400 cursor-not-allowed" 
                                  : "text-red-600 hover:text-red-700"
                                }
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}