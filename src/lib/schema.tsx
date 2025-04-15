import React from 'react';

export function PersonSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Abdul Rahman',
          alternateName: 'abdxdev',
          url: 'https://abd-dev.studio',
          jobTitle: 'Software Developer & UI/UX Designer',
          sameAs: [
            'https://github.com/abdxdev',
            'https://linkedin.com/in/abdxdev',
            'https://x.com/abdxdev',
            'https://anilist.co/user/abdxdev'
          ],
          knowsAbout: [
            'Python Development',
            'C/C++ Development',
            'JavaScript Programming',
            'Django Framework',
            'Flask Development',
            'UI/UX Design',
            'VS Code Extension Development',
            'Adobe Creative Suite',
            'Figma Design',
            'Software Architecture',
            'Database Management',
            'API Integration'
          ],
          worksFor: {
            '@type': 'Organization',
            name: 'Self-employed'
          }
        })
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://abd-dev.studio',
          name: 'Abdul Rahman - Software Developer Portfolio',
          description: "Portfolio of Abdul Rahman (abd), a software developer and UI/UX designer specializing in Python, C/C++, Django, and innovative software solutions",
          author: {
            '@type': 'Person',
            name: 'Abdul Rahman',
            alternateName: 'abdxdev'
          },
          keywords: 'Python developer, C/C++ developer, Django, Flask, UI/UX design, VS Code extensions, software development, graphics design',
          additionalType: 'http://www.productontology.org/id/Software'
        })
      }}
    />
  );
}

export function ProjectsSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'SoftwareApplication',
              position: 1,
              name: '10x Pretender',
              description: 'A VS Code extension that makes you look like a coding genius by simulating realistic typing from your clipboard or AI-generated code.',
              url: 'https://github.com/abdxdev/10x-Pretender',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Windows, macOS, Linux'
            },
            {
              '@type': 'SoftwareApplication',
              position: 2,
              name: 'AI LaTeX Helper',
              description: 'A VS Code extension that turns plain English descriptions of math into LaTeX equations using Google Generative AI.',
              url: 'https://github.com/abdxdev/AI-LaTeX-Helper',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Windows, macOS, Linux'
            },
            {
              '@type': 'SoftwareApplication',
              position: 3,
              name: 'Terminal-Based Rich Text Editor',
              description: 'A high-performance terminal-based rich text editor designed for speed and functionality with autosuggestions, undo/redo, and customizable shortcuts.',
              url: 'https://github.com/abdxdev/Terminal-Based-Rich-Text-Editor',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Windows, Linux'
            }
          ]
        })
      }}
    />
  );
}