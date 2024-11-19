import { Metadata } from 'next'

export function constructMetadata({
  title = 'Abdul Rahman',
  description = "I am a software developer and designer with expertise in building efficient, user-friendly applications across different platforms. With a focus on problem-solving and creative design, I enjoy crafting innovative solutions that make a difference.",
  image = '/thumbnail.svg', 
  icons = '/avatar-white.svg', 
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@chrislonzo'
    },
    icons,
    metadataBase: new URL('https://www.chrislonzo.com'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
