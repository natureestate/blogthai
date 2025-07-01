export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Export utilities
export * from './sanity'
export * from './image'
export * from './readingTime'
export * from './search'
export * from './tableOfContents'
export * from './relatedPosts'
export * from './preview'
export * from './scheduler'
