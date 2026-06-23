"use client";

import { useState, useEffect } from "react";

export default function AdminSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await fetch('/api/admin/staff/check-role');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.role === 'ADMIN');
        }
      } catch (error) {
        console.error('Failed to check role:', error);
      }
    };

    checkAdminRole();
  }, []);

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li><a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</a></li>
          <li><a href="/admin/articles" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Articles</a></li>
          <li><a href="/admin/batch-upload" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Batch Upload</a></li>
          <li><a href="/admin/media" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Media Library</a></li>
          <li><a href="/admin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Settings</a></li>
          <li><a href="/admin/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Categories</a></li>
          <li><a href="/admin/archive" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Archive</a></li>
          {isAdmin && (
            <li><a href="/admin/staff" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Staff Management</a></li>
          )}
        </ul>
      </nav>
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
        </form>
      </div>
    </aside>
  );
}
