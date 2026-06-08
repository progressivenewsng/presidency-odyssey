import Link from "next/link";
import { getAllNews, getNewsBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/layout/ReadingProgress";

export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const categories = ["politics", "economy", "sports"];

  // 1. Check if the URL is a category page (e.g., /politics)
  if (categories.includes(slug.toLowerCase())) {
    const allNews = await getAllNews();
    const filteredNews = allNews.filter(
      (n) => n.category.toLowerCase() === slug.toLowerCase()
    );
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
          {filteredNews.map((item) => (
            <Link href={`/${item.slug}`} key={item.id} className="group cursor-pointer">
              <div className="w-full h-64 bg-slate-100 rounded-md mb-6 overflow-hidden relative shadow-sm">
                <div className="w-full h-full bg-slate-200 group-hover:scale-105 transition-transform duration-500 absolute inset-0"></div>
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
        {filteredNews.length === 0 && (
          <p className="text-gray-500 italic">No articles found in this category.</p>
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
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-10">
          <span className="text-red-700 text-xs font-bold tracking-widest uppercase mb-4 block">
            {article.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900 mb-6">
            {article.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 font-sans border-b border-gray-100 pb-6">
            <span className="font-bold text-gray-900">By {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
        </header>
        
        <div className="text-lg font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </article>
    </>
  );
}
