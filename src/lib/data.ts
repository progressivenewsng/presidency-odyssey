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

// Mock data for fallback when database is unavailable
const mockMainStory = {
  id: 'mock-1',
  slug: 'breaking-nigeria-economic-reforms',
  title: 'Nigeria Announces Comprehensive Economic Reform Package',
  category: 'Politics',
  author: 'Folorunso S. Aluko',
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  flags: ['MAIN_STORY'] as PostFlag[],
  imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop'
};

const mockEditorsPicks = [
  { id: 'mock-2', slug: 'policy-analysis', title: 'Deep Analysis of New Policy Framework', category: 'Politics', author: 'Sarah Johnson', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['EDITORS_PICK'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop' },
  { id: 'mock-3', slug: 'infrastructure-development', title: 'Major Infrastructure Projects Launched', category: 'Economy', author: 'Michael Chen', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['EDITORS_PICK'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop' },
];

const mockFeaturedStories = [
  { id: 'mock-4', slug: 'education-sector', title: 'Education Sector Reforms Announced', category: 'Education', author: 'Amara Okafor', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['FEATURED'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop' },
  { id: 'mock-5', slug: 'healthcare-initiative', title: 'New Healthcare Initiative Unveiled', category: 'Health', author: 'David Thompson', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['FEATURED'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop' },
];

const mockTrendingStories = [
  { id: 'mock-6', slug: 'tech-innovation', title: 'Technology Innovation in Nigeria', category: 'Technology', author: 'Sarah Johnson', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['TRENDING'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop' },
  { id: 'mock-7', slug: 'agriculture-growth', title: 'Agriculture Sector Shows Growth', category: 'Economy', author: 'Michael Chen', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['TRENDING'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop' },
];

const mockPopularStories = [
  { id: 'mock-8', slug: 'youth-empowerment', title: 'Youth Empowerment Programs Expanded', category: 'Politics', author: 'Amara Okafor', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['POPULAR'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&h=300&fit=crop' },
  { id: 'mock-9', slug: 'digital-transformation', title: 'Digital Transformation Accelerates', category: 'Technology', author: 'David Thompson', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), flags: ['POPULAR'] as PostFlag[], imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop' },
];

// Helper function to check flags
export function hasFlag(item: any, flag: PostFlag): boolean {
  return item.flags?.includes(flag) || false;
}

// Safe database query that surfaces failures instead of hiding them behind mock content.
async function safeQuery<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query failed:', error);

    if (Array.isArray(fallback)) {
      return [] as T;
    }

    return null as T;
  }
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
  return safeQuery(async () => {
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
  }, mockMainStory);
}

export async function getEditorsPicks() {
  return safeQuery(async () => {
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
  }, mockEditorsPicks);
}

export async function getFeaturedStories() {
  return safeQuery(async () => {
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
  }, mockFeaturedStories);
}

export async function getTrendingStories() {
  return safeQuery(async () => {
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
  }, mockTrendingStories);
}

export async function getPopularStories() {
  return safeQuery(async () => {
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
  }, mockPopularStories);
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