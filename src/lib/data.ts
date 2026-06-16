import { prisma } from '@/lib/prisma';

export type PostFlag = "MAIN_STORY" | "EDITORS_PICK" | "FEATURED" | "TRENDING" | "POPULAR" | "BREAKING_NEWS";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  flags: PostFlag[];
  excerpt?: string;
}

// Helper function to check flags
export function hasFlag(item: any, flag: PostFlag): boolean {
  return item.flags?.includes(flag) || false;
}

// Get all published posts
export async function getAllNews() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return posts.map((post: any) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    excerpt: post.excerpt || '',
    imageUrl: post.images[0]?.url,
  }));
}

// Get post by slug
export async function getNewsBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      images: true,
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    excerpt: post.excerpt || '',
    imageUrl: post.images[0]?.url,
    allImages: post.images,
  };
}

// Helper functions for different sections
export async function getMainStory() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      flags: {
        has: 'MAIN_STORY'
      }
    },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const post = posts[0];
  return post ? {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    imageUrl: post.images[0]?.url,
  } : null;
}

export async function getEditorsPicks() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      flags: {
        has: 'EDITORS_PICK'
      }
    },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    imageUrl: post.images[0]?.url,
  }));
}

export async function getFeaturedStories() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      flags: {
        has: 'FEATURED'
      }
    },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    imageUrl: post.images[0]?.url,
  }));
}

export async function getTrendingStories() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      flags: {
        has: 'TRENDING'
      }
    },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    imageUrl: post.images[0]?.url,
  }));
}

export async function getPopularStories() {
  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      flags: {
        has: 'POPULAR'
      }
    },
    include: {
      author: true,
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category?.name || 'Uncategorized',
    author: post.author?.name || 'Unknown',
    date: post.createdAt?.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }) || '',
    flags: post.flags as PostFlag[] || [],
    imageUrl: post.images[0]?.url,
  }));
}

// Get categories with published articles
export async function getActiveCategories() {
  const categories = await prisma.category.findMany({
    where: {
      posts: {
        some: {
          status: 'PUBLISHED'
        }
      }
    },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED'
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    postCount: cat._count.posts
  }));
}

// Get posts by category
export async function getPostsByCategory(categorySlug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          author: true,
          images: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!category) return null;

  return {
    category: {
      name: category.name,
      slug: category.slug
    },
    posts: category.posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      category: category.name,
      author: post.author?.name || 'Unknown',
      date: post.createdAt?.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) || '',
      flags: post.flags as PostFlag[] || [],
      excerpt: post.excerpt || '',
      imageUrl: post.images[0]?.url
    }))
  };
}