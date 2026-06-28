import Link from "next/link";
import { getPostsByCategory } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams
}: PageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 9);

  const categoryData = await getPostsByCategory(slug, currentPage, 9);

  if (!categoryData) {
    notFound();
  }

  const { category, posts, pagination } = categoryData;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Category Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-1 w-12 bg-red-700"></div>
          <h1 className="text-4xl font-serif font-black text-gray-900">
            {category.name}
          </h1>
        </div>
        <p className="text-gray-600">{pagination.total} articles in this category</p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-full h-48 bg-slate-100 rounded-md mb-4 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow duration-300">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 group-hover:scale-105 transition-transform duration-500 absolute inset-0"></div>
              )}
            </div>
            <span className="text-red-700 text-[10px] font-bold tracking-widest uppercase mb-2">
              {post.category}
            </span>
            <h4 className="text-lg font-serif font-bold leading-snug text-gray-900 group-hover:text-red-700 transition-colors line-clamp-3">
              {post.title}
            </h4>
            <p className="text-xs text-gray-500 mt-3 font-sans tracking-wide">
              {post.author} • {post.date}
            </p>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-12">
          {currentPage > 1 && (
            <Link
              href={`/category/${slug}?page=${currentPage - 1}`}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              Previous
            </Link>
          )}

          <span className="text-gray-700">
            Page {currentPage} of {pagination.totalPages}
          </span>

          {currentPage < pagination.totalPages && (
            <Link
              href={`/category/${slug}?page=${currentPage + 1}`}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}