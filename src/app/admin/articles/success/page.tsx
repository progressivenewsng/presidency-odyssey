"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ArticleSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    const articleData = searchParams.get('article');
    const scheduled = searchParams.get('scheduled');
    
    if (articleData) {
      setArticle(JSON.parse(articleData));
    }
    setIsScheduled(scheduled === 'true');
  }, [searchParams]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const articleLink = `http://localhost:3000/${article.slug}`;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isScheduled ? 'Article Scheduled!' : 'Article Published!'}
          </h1>
          <p className="text-gray-600">
            {isScheduled 
              ? 'Your article has been scheduled and will go live at the specified time.'
              : 'Your article is now live and visible to readers.'}
          </p>
        </div>

        {/* Article Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              {isScheduled ? 'Scheduled Article' : 'Published Article'}
            </span>
          </div>
          
          {/* Bold Headline */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h2>

          {/* Article Link */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
              Article Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={articleLink}
                readOnly
                className="flex-1 bg-transparent text-gray-900 font-mono text-sm focus:outline-none"
              />
              <button
                onClick={() => navigator.clipboard.writeText(articleLink)}
                className="px-4 py-2 bg-red-700 text-white text-sm font-semibold rounded-lg hover:bg-red-800 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {isScheduled && article.scheduledFor && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-yellow-800">Scheduled for:</span>
                  <span className="text-sm text-yellow-700 ml-2">{new Date(article.scheduledFor).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/admin/articles/new')}
            className="flex-1 px-6 py-4 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-all hover:scale-105 shadow-lg"
          >
            Publish Another Article
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex-1 px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all hover:scale-105 border border-gray-200 shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}