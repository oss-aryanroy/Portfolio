import { motion } from 'framer-motion'
import { marked } from 'marked'
import { useEffect, useState, useRef } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export default function BlogPreview({ title, content, image }) {
  const [html, setHtml] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    if (content) {
      // Configure marked with syntax highlighting and custom renderer
      const renderer = new marked.Renderer()

      // Wrap tables in a scrollable container for mobile
      renderer.table = (header, body) => {
        return `<div class="table-wrapper"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`
      }

      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
        sanitize: false,
        pedantic: false,
        renderer: renderer,
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
      setHtml(marked.parse(content))
    }
  }, [content])

  // Apply syntax highlighting after DOM is ready
  useEffect(() => {
    if (html && contentRef.current) {
      // Use setTimeout to ensure DOM is fully updated after React render
      const timeoutId = setTimeout(() => {
        const container = contentRef.current
        if (!container) return

        // Apply syntax highlighting
        container.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block)
        })
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [html])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-[#3a2a34]/60 to-[#4a3a44]/60 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-[#b48ca0]/30 shadow-xl shadow-[#b48ca0]/10"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-6 gradient-text">{title || 'Untitled Post'}</h1>

      <div
        ref={contentRef}
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!content && (
        <p className="text-gray-500 italic">No content yet. Start writing in the editor.</p>
      )}
    </motion.div>
  )
}