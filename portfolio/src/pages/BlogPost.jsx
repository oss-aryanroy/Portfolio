import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { API_URL } from '../config/api'

export default function BlogPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = !!sessionStorage.getItem('auth_token')

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`)

      if (response.ok) {
        const foundPost = await response.json()
        setPost(foundPost)

        // Configure marked with syntax highlighting
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: false,
          mangle: false,
          sanitize: false,
          pedantic: false,
          highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return hljs.highlight(code, { language: lang }).value
              } catch (err) {
                console.error('Highlight error:', err)
              }
            }
            return hljs.highlightAuto(code).value
          }
        })
        setHtml(marked.parse(foundPost.content))
      } else if (response.status === 404) {
        setError('Post not found')
      } else {
        setError('Failed to load post')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setIsDeleting(true)
    const token = sessionStorage.getItem('auth_token')

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        navigate('/blog')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (err) {
      alert('Failed to connect to server')
    } finally {
      setIsDeleting(false)
    }
  }

  // Apply syntax highlighting to any code blocks that weren't caught
  useEffect(() => {
    if (html) {
      document.querySelectorAll('.blog-content pre code').forEach((block) => {
        hljs.highlightElement(block)
      })
    }
  }, [html])

  if (isLoading) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#b48ca0]" size={48} />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-xl">{error || 'Post not found'}</p>
      </div>
    )
  }

  return (
    <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-[#d4b4c4] hover:text-[#b48ca0] transition"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </motion.button>

        {isAdmin && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded-lg text-red-400 transition disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Trash2 size={18} />
            )}
            Delete
          </motion.button>
        )}
      </div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#3a2a34]/60 to-[#4a3a44]/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-[#b48ca0]/30 shadow-xl shadow-[#b48ca0]/10"
      >
        {post.image && post.image !== '' && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text leading-tight">
          {post.title}
        </h1>

        <p className="text-gray-400 text-sm mb-8">{post.date}</p>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </motion.article>
    </div>
  )
}