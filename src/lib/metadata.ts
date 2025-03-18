import { Metadata } from 'next'

export function constructMetadata({
  title = 'Abdul Rahman - Portfolio',
  description = "I'm a software developer and designer who lives by two mottos: “Work smarter, not harder” and “If it's not broken, add more features.”",
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
    // twitter: {
    //   card: 'summary_large_image',
    //   title,
    //   description,
    //   images: [image],
    //   creator: '@chrislonzo'
    // },
    icons,
    metadataBase: new URL('https://abd-dev.studio/'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
