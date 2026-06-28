"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'EDITOR' });
  const [editingPassword, setEditingPassword] = useState<{ id: string; password: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/staff/check-role');
        if (response.ok) {
          const data = await response.json();
          if (data.role !== 'ADMIN') {
            router.push('/admin/dashboard');
            return;
          }
          setIsAdmin(true);
          setCurrentUserId(data.userId); // Add userId to the API response
        } else {
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Failed to check role:', error);
        router.push('/admin/dashboard');
      }
    };

    checkAdminAccess();
  }, [router]);

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.password) return;

    try {
      const hashedPassword = await bcrypt.hash(newStaff.password, 10);
      
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStaff, password: hashedPassword }),
      });

      if (response.ok) {
        setNewStaff({ name: '', email: '', password: '', role: 'EDITOR' });
        fetchStaff();
        alert('Staff member added successfully!');
      }
    } catch (error) {
      alert('Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStaff();
        alert('Staff member deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete staff member');
      }
    } catch (error) {
      alert('Failed to delete staff member');
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        fetchStaff();
        alert('Role updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleUpdatePassword = async (id: string, newPassword: string) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: hashedPassword }),
      });

      if (response.ok) {
        setEditingPassword(null);
        alert('Password updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update password');
      }
    } catch (error) {
      alert('Failed to update password');
    }
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Checking permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 ">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-2">Manage staff members (Admin only)</p>
          </div>

          {/* Add Staff Form */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New Staff Member</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Staff Member
              </button>
            </form>
          </div>

          {/* Staff List */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staff.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 sm:px-6 py-4 text-gray-500 hidden sm:table-cell">{member.email}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="px-2 py-1 border rounded text-xs sm:text-sm"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {editingPassword?.id === member.id ? (
                            <div className="flex gap-2">
                              <input
                                type="password"
                                placeholder="New password"
                                value={editingPassword?.password || ''}
                                onChange={(e) => setEditingPassword({ id: member.id, password: e.target.value })}
                                className="px-2 py-1 border rounded text-xs sm:text-sm"
                              />
                              <button
                                onClick={() => handleUpdatePassword(member.id, editingPassword?.password || '')}
                                className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPassword(null)}
                                className="text-gray-600 hover:text-gray-700 text-xs sm:text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingPassword({ id: member.id, password: '' })}
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                            >
                              Change Password
                            </button>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            disabled={member.id === currentUserId}
                            className={member.id === currentUserId
                              ? "text-gray-400 cursor-not-allowed text-xs sm:text-sm"
                              : "text-red-600 hover:text-red-700 text-xs sm:text-sm"
                            }
                          >
                            {member.id === currentUserId ? 'Cannot delete yourself' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && staff.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No staff members found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}