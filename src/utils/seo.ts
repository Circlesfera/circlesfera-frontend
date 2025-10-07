import type { Metadata } from 'next';

/**
 * Generar metadata para páginas
 */
export const generateMetadata = (options: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
}): Metadata => {
  const {
    title,
    description,
    image = '/icons/icon-512x512.svg',
    url = 'https://circlesfera.com',
    keywords = [],
    type = 'website',
    author,
    publishedTime
  } = options;

  const fullTitle = `${title} | CircleSfera`;
  const baseUrl = 'https://circlesfera.com';
  const fullUrl = `${baseUrl}${url}`;

  return {
    title: fullTitle,
    description,
    keywords: ['CircleSfera', 'red social', 'videos', 'reels', ...keywords],
    authors: author ? [{ name: author }] : [{ name: 'CircleSfera' }],

    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'CircleSfera',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'es_ES',
      type,
      ...(publishedTime && { publishedTime })
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@circlesfera'
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    alternates: {
      canonical: fullUrl
    }
  };
};

/**
 * Generar structured data (JSON-LD) para un perfil
 */
export const generateProfileStructuredData = (profile: {
  username: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName || profile.username,
    alternateName: profile.username,
    description: profile.bio,
    image: profile.avatar,
    url: `https://circlesfera.com/${profile.username}`,
    ...(profile.website && { sameAs: [profile.website] }),
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: profile.followersCount || 0
      }
    ]
  };
};

/**
 * Generar structured data para un post
 */
export const generatePostStructuredData = (post: {
  id: string;
  caption: string;
  user: {
    username: string;
    fullName?: string;
    avatar?: string;
  };
  image?: string;
  video?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
}) => {
  const baseData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': post.video ? 'VideoObject' : 'ImageObject',
    headline: post.caption,
    author: {
      '@type': 'Person',
      name: post.user.fullName || post.user.username,
      url: `https://circlesfera.com/${post.user.username}`,
      ...(post.user.avatar && { image: post.user.avatar })
    },
    datePublished: post.createdAt,
    url: `https://circlesfera.com/post/${post.id}`,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likesCount || 0
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.commentsCount || 0
      }
    ]
  };

  if (post.video) {
    baseData.contentUrl = post.video;
    baseData.uploadDate = post.createdAt;
  } else if (post.image) {
    baseData.contentUrl = post.image;
  }

  return baseData;
};

/**
 * Generar structured data para un reel
 */
export const generateReelStructuredData = (reel: {
  id: string;
  caption: string;
  user: {
    username: string;
    fullName?: string;
  };
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  createdAt: string;
  likesCount?: number;
  viewsCount?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: reel.caption || 'Reel de CircleSfera',
    description: reel.caption,
    thumbnailUrl: reel.thumbnail,
    uploadDate: reel.createdAt,
    duration: `PT${reel.duration}S`,
    contentUrl: reel.videoUrl,
    embedUrl: `https://circlesfera.com/reels/${reel.id}`,
    author: {
      '@type': 'Person',
      name: reel.user.fullName || reel.user.username,
      url: `https://circlesfera.com/${reel.user.username}`
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WatchAction',
        userInteractionCount: reel.viewsCount || 0
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: reel.likesCount || 0
      }
    ]
  };
};

/**
 * Generar breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (
  breadcrumbs: Array<{ name: string; url: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://circlesfera.com${crumb.url}`
    }))
  };
};

/**
 * Generar structured data para la organización
 */
export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CircleSfera',
    alternateName: 'CircleSfera Social Network',
    url: 'https://circlesfera.com',
    logo: 'https://circlesfera.com/icons/icon-512x512.svg',
    description: 'Red social moderna para compartir momentos, videos cortos y conectar con amigos',
    sameAs: [
      'https://twitter.com/circlesfera',
      'https://facebook.com/circlesfera',
      'https://instagram.com/circlesfera'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@circlesfera.com',
      availableLanguage: ['Spanish', 'English']
    }
  };
};

/**
 * Generar structured data para el sitio web
 */
export const generateWebSiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CircleSfera',
    url: 'https://circlesfera.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://circlesfera.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

