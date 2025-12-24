import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import BlogList from '../components/BlogList'

const API_URL = 'http://localhost:3001'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`)

      if (response.ok) {
        const data = await response.json()
        // Transform MongoDB _id to id for compatibility
        const transformedPosts = data.map(post => ({
          ...post,
          id: post._id
        }))
        setPosts(transformedPosts)
      } else {
        setError('Failed to fetch posts')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
          Blog
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Thoughts, stories and ideas on development, technology, and more.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#b48ca0]" size={48} />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <p className="text-red-400 text-xl mb-2">{error}</p>
          <p className="text-gray-500">Please try again later.</p>
        </motion.div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <p className="text-gray-400 text-xl mb-2">No posts yet.</p>
          <p className="text-gray-500">Check back soon for new content!</p>
        </motion.div>
      ) : (
        <BlogList posts={posts} />
      )}
    </div>
  )
}