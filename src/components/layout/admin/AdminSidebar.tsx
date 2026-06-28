"use client";

import { useState, useEffect } from "react";

export default function AdminSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <a
                href="/admin/dashboard"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/admin/articles"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Articles
              </a>
            </li>
            <li>
              <a
                href="/admin/batch-upload"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Batch Upload
              </a>
            </li>
            <li>
              <a
                href="/admin/media"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Media Library
              </a>
            </li>
            <li>
              <a
                href="/admin/settings"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="/admin/categories"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Categories
              </a>
            </li>
            <li>
              <a
                href="/admin/archive"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Archive
              </a>
            </li>
            {isAdmin && (
              <li>
                <a
                  href="/admin/staff"
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Staff Management
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Sign Out</button>
          </form>
        </div>
      </aside>
    </>
  );
}
