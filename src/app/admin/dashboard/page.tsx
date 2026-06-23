import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch stats directly from database
  const [
    totalArticles,
    publishedCount,
    archivedCount,
    categoriesCount,
    tagsCount,
    mediaCount,
    staffCount,
    recentArticles,
    articlesByCategory
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'ARCHIVED' } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.media.count(),
    prisma.user.count(),
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        category: {
          select: { name: true }
        }
      }
    }),
    prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { posts: true }
        }
      }
    })
  ]);

  const stats = {
    totalArticles,
    publishedCount,
    archivedCount,
    categoriesCount,
    tagsCount,
    mediaCount,
    staffCount,
    recentArticles,
    articlesByCategory
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <AdminSidebar />
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your news site</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6  ">
              <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalArticles || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6  ">
              <h3 className="text-gray-500 text-sm font-medium">Published</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.publishedCount || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6  ">
              <h3 className="text-gray-500 text-sm font-medium">Archived</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats?.archivedCount || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6  ">
              <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.categoriesCount || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 ">
              <h3 className="text-gray-500 text-sm font-medium">Tags</h3>
              <p className="text-3xl font-bold text-pink-600 mt-2">{stats?.tagsCount || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 ">
              <h3 className="text-gray-500 text-sm font-medium">Media</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.mediaCount || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 ">
              <h3 className="text-gray-500 text-sm font-medium">Staff Members</h3>
              <p className="text-3xl font-bold text-teal-600 mt-2">{stats?.staffCount || 0}</p>
            </div>
          </div>

          {/* Articles by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Articles by Category</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.articlesByCategory?.map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-gray-700">{category.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${stats.totalArticles > 0 ? (category._count.posts / stats.totalArticles) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {category._count.posts}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!stats?.articlesByCategory || stats.articlesByCategory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No category data available</p>
                  ) : null}
                </div>
              </div>
            </div>

           
          </div>
        </main>
      </div>
    </div>
  );
}