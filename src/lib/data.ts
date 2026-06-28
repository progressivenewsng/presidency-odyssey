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
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
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
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
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
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
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
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
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
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
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
export async function getPostsByCategory(categorySlug: string, page: number = 1, limit: number = 20) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  if (!category) return null;

  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      categoryId: category.id
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      createdAt: true,
      flags: true,
      author: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const total = await prisma.post.count({
    where: { 
      status: 'PUBLISHED',
      categoryId: category.id
    }
  });

  return {
    category: {
      name: category.name,
      slug: category.slug
    },
    posts: posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
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
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}