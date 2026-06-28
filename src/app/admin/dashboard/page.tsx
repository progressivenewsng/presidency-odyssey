import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import { prisma, withRetry } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch stats directly from database with retry logic
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
    withRetry(() => prisma.post.count()),
    withRetry(() => prisma.post.count({ where: { status: 'PUBLISHED' } })),
    withRetry(() => prisma.post.count({ where: { status: 'ARCHIVED' } })),
    withRetry(() => prisma.category.count()),
    withRetry(() => prisma.tag.count()),
    withRetry(() => prisma.media.count()),
    withRetry(() => prisma.user.count()),
    withRetry(() =>
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
      })
    ),
    withRetry(() =>
      prisma.category.findMany({
        select: {
          name: true,
          _count: {
            select: { posts: true }
          }
        }
      })
    )
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
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 ">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your news site</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Total Articles</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats?.totalArticles || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Published</h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{stats?.publishedCount || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Archived</h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{stats?.archivedCount || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Categories</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">{stats?.categoriesCount || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Tags</h3>
              <p className="text-2xl sm:text-3xl font-bold text-pink-600 mt-2">{stats?.tagsCount || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Media</h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-2">{stats?.mediaCount || 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Staff Members</h3>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600 mt-2">{stats?.staffCount || 0}</p>
            </div>
          </div>

          {/* Articles by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Articles by Category</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {stats?.articlesByCategory?.map((category: any) => (
                    <div key={category.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-gray-700 text-sm">{category.name}</span>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex-1 sm:w-32 bg-gray-200 rounded-full h-2">
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