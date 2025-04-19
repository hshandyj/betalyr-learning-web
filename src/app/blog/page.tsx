"use client"

import { useRef } from 'react'
import { BlogList } from '@/components/Blog/BlogList'

export default function BlogPage() {
  const blogListRef = useRef<{ fetchPosts: (page: number) => Promise<void> }>(null)

  
  return (
    <main className="container py-8">
      <BlogList ref={blogListRef} />
    </main>
  )
}