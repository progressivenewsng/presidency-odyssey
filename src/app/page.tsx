import Link from "next/link";
import { getMainStory, getEditorsPicks, getFeaturedStories, getTrendingStories, getPopularStories } from "@/lib/data";
import Image from "next/image";
import NewsCarousel from "@/components/NewsCarousel";

export default async function Home() {
  console.log('Page loaded, fetching real data...');

  const mainStory = await getMainStory();
  const editorsPicks = await getEditorsPicks();
  const featuredStories = await getFeaturedStories();
  const trendingStories = await getTrendingStories();
  const popularStories = await getPopularStories();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Story (Left/Center) */}
        <div className="lg:col-span-2">
          {mainStory && (
            <Link href={`/${mainStory.slug}`} className="group block h-full">
              <div className="relative w-full h-112.5 lg:h-150 bg-slate-200 overflow-hidden shadow-md rounded-lg">
                {mainStory.imageUrl ? (
                  <Image
                    src={mainStory.imageUrl}
                    alt={mainStory.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 bg-slate-300 image-reveal"></div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/70 to-transparent p-8">
                  <span className="bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-4 inline-block">
                    {mainStory.category}
                  </span>
                  <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight group-hover:text-red-400 transition-colors duration-300 drop-shadow-md">
                    {mainStory.title}
                  </h2>
                  <div className="mt-4 text-gray-300 text-xs sm:text-sm flex items-center space-x-4 font-sans tracking-wide">
                    <span className="font-semibold text-white">By {mainStory.author}</span>
                    <span>•</span>
                    <span>{mainStory.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Editor's Picks (Right Sidebar Carousel) */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-1 w-6 bg-red-700"></div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              Editor's Picks
            </h3>
          </div>

          <NewsCarousel direction="vertical" heightClass="h-[450px] lg:h-[500px]">
            {editorsPicks.map((item) => (
              <Link
                href={`/${item.slug}`}
                key={item.id}
                className="flex gap-4 group cursor-pointer border border-white p-4 bg-white rounded-lg hover:shadow-md hover:border-red-100 transition-all duration-300 w-full"
              >
                <div className="w-20 h-20 shrink-0 bg-slate-200 rounded-md overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-red-700 text-[10px] uppercase font-bold tracking-widest block mb-1">{item.category}</span>
                  <h4 className="text-sm font-bold font-serif leading-snug group-hover:text-red-700 transition-colors line-clamp-3 text-gray-900">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </NewsCarousel>
        </div>
      </div>

      <div className="my-20"></div>

      {/* Featured Stories Section */}
      <div className="mb-16">
        <div className="flex items-center space-x-3 mb-10">
          <div className="h-1 w-8 bg-red-700"></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
            Featured Stories
          </h3>
        </div>

        <NewsCarousel>
          {featuredStories.map((item) => (
            <Link
              href={`/${item.slug}`}
              key={item.id}
              className="flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300 w-64 sm:w-72"
            >
              <div className="w-full h-48 bg-slate-100 rounded-md mb-4 overflow-hidden relative shadow-xs group-hover:shadow-md transition-shadow duration-300">
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
              <span className="text-red-700 text-[10px] font-bold tracking-widest uppercase mb-2">{item.category}</span>
              <h4 className="text-base font-serif font-bold leading-snug text-gray-900 group-hover:text-red-700 transition-colors line-clamp-3">
                {item.title}
              </h4>
              <p className="text-[10px] text-gray-500 mt-3 font-sans tracking-wide">{item.author} • {item.date}</p>
            </Link>
          ))}
        </NewsCarousel>
      </div>

      <div className="my-20"></div>

      {/* Trending & Popular Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        {/* Trending Story (Left - takes 2 cols) */}
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-10">
            <div className="h-1 w-8 bg-red-700"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              Trending Now
            </h3>
          </div>
          <NewsCarousel>
            {trendingStories.map((item) => (
              <Link
                href={`/${item.slug}`}
                key={item.id}
                className="group cursor-pointer hover:-translate-y-1 transition-transform duration-300 w-72 sm:w-80"
              >
                <div className="w-full h-48 bg-slate-100 rounded-md mb-4 overflow-hidden relative shadow-xs group-hover:shadow-md transition-shadow duration-300">
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
                <span className="text-red-700 text-[10px] font-bold tracking-widest uppercase mb-2 block">{item.category}</span>
                <h4 className="text-base font-serif font-bold leading-snug text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-[10px] text-gray-500 mt-3 font-sans tracking-wide">{item.date}</p>
              </Link>
            ))}
          </NewsCarousel>
        </div>

        {/* Popular Stories (Right Sidebar) */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-1 w-6 bg-red-700"></div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">
              Most Popular
            </h3>
          </div>
          <NewsCarousel direction="vertical" heightClass="h-[250px]">
            {popularStories.map((item, index) => (
              <Link
                href={`/${item.slug}`}
                key={item.id}
                className="flex gap-4 group cursor-pointer relative p-4 border border-white bg-white rounded-lg hover:shadow-md hover:border-red-100 transition-all duration-300 w-full"
              >
                <span className="text-4xl font-serif font-black text-gray-100 absolute left-2 top-0 z-0">
                  {index + 1}
                </span>
                <div className="w-20 h-20 shrink-0 bg-slate-200 rounded-md z-10 overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
                  )}
                </div>
                <div className="z-10 pt-1 flex-1">
                  <h4 className="text-sm font-bold font-serif leading-snug text-gray-900 group-hover:text-red-700 transition-colors line-clamp-3">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-bold tracking-widest text-red-700 uppercase mt-2">{item.category}</p>
                </div>
              </Link>
            ))}
          </NewsCarousel>
        </div>
      </div>
    </div>
  );
}