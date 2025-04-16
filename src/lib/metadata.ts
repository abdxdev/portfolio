import { Metadata } from 'next'

export function constructMetadata({
  title = 'Abdul Rahman | Software Developer & Designer Portfolio',
  description = "Software developer and designer specializing in Python, C/C++, Django, Flask, and UI/UX design. Creator of VS Code extensions and innovative software solutions.",
  image = '/thumbnail-abd.png',
  icons = '/favicon.png', 
  noIndex = false,
  keywords = 'Python developer, C/C++ developer, Django, Flask, UI/UX design, VS Code extensions, software development, graphics design, abdxdev'
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  keywords?: string
} = {}): Metadata {
  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Abdul Rahman', url: 'https://github.com/abdxdev' }],
    creator: 'Abdul Rahman',
    publisher: 'abdxdev',
    openGraph: {
      title,
      description,
      images: [{
        url: image,
        width: 420,
        height: 420,
        alt: 'Abdul Rahman - Software Developer & Designer'
      }],
      type: 'website',
      locale: 'en_US',
      siteName: 'Abdul Rahman - Developer Portfolio',
      url: 'https://abd-dev.studio'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{
        url: image,
        alt: 'Abdul Rahman - Software Developer & Designer'
      }],
      creator: '@abdxdev'
    },
    icons,
    metadataBase: new URL('https://abd-dev.studio'),
    alternates: {
      canonical: 'https://abd-dev.studio',
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    }),
    robots: !noIndex ? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    } : undefined
  }
}
