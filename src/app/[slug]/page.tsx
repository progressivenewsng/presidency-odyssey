import Link from "next/link";
import Image from "next/image";
import { getPostsByCategory, getNewsBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/layout/ReadingProgress";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function DynamicPage({ 
  params,
  searchParams 
}: PageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  const categories = ["politics", "economy", "sports"];
  const currentPage = parseInt(page, 10);

  // 1. Check if the URL is a category page (e.g., /politics)
  if (categories.includes(slug.toLowerCase())) {
    const categoryData = await getPostsByCategory(slug.toLowerCase(), currentPage, 10);
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center space-x-3 mb-10">
          <div className="h-1 w-10 bg-red-700"></div>
          <h2 className="text-2xl font-serif font-black uppercase tracking-widest text-gray-900">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categoryData?.posts.map((item: any) => (
            <Link href={`/${item.slug}`} key={item.id} className="group cursor-pointer">
              <div className="w-full h-64 bg-slate-100 rounded-md mb-6 overflow-hidden relative shadow-sm">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 group-hover:scale-105 transition-transform duration-500 absolute inset-0"></div>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold leading-tight text-gray-900 group-hover:text-red-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 mt-4 font-sans tracking-wide">
                {item.author} • {item.date}
              </p>
            </Link>
          ))}
        </div>
        {categoryData?.posts.length === 0 && (
          <p className="text-gray-500 italic">No articles found in this category.</p>
        )}
        
        {/* Pagination */}
        {categoryData?.pagination && categoryData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            {currentPage > 1 && (
              <Link 
                href={`/${slug}?page=${currentPage - 1}`}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Previous
              </Link>
            )}
            
            <span className="text-gray-700">
              Page {currentPage} of {categoryData.pagination.totalPages}
            </span>
            
            {currentPage < categoryData.pagination.totalPages && (
              <Link 
                href={`/${slug}?page=${currentPage + 1}`}
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

  // 2. Otherwise, check if it's an article slug (e.g., /nigeria-and-poland-...)
  const article = await getNewsBySlug(slug);
  if (!article) return notFound();

  return (
    <>
      <ReadingProgress />
      <article className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-4xl">
        {/* Hero Image */}
        {article.imageUrl && (
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-125 mb-6 md:mb-10 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        <header className="mb-8 md:mb-10">
          <span className="text-red-700 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 md:mb-4 block">
            {article.category}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-gray-900 mb-4 md:mb-6">
            {article.title}
          </h1>
          <div className="flex items-center space-x-2 md:space-x-4 text-xs sm:text-sm text-gray-500 font-sans border-b border-gray-100 pb-4 md:pb-6">
            <span className="font-bold text-gray-900">By {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
        </header>

        <div className="text-base sm:text-lg font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </article>
    </>
  );
}