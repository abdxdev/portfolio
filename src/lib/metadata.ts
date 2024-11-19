import { Metadata } from 'next'

// TODO: Update metadata

export function constructMetadata({
  title = 'Abdul Rahman', // TODO: Add a custom title
  description = "I am a software developer and designer with expertise in building efficient, user-friendly applications across different platforms. With a focus on problem-solving and creative design, I enjoy crafting innovative solutions that make a difference.", // TODO: Add a custom description
  image = '/thumbnail.svg', // TODO: Add a custom image
  icons = '/avatar-white.svg', // TODO: Add a custom icon
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
