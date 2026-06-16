import Link from "next/link";
import { getPostsByCategory } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const categoryData = await getPostsByCategory(slug);

  if (!categoryData) {
    notFound();
  }

  const { category, posts } = categoryData;

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
        <p className="text-gray-600">{posts.length} articles in this category</p>
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
    </div>
  );
}