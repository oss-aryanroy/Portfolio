import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Helper to extract text from markdown content for excerpt
function getExcerpt(content, maxLength = 150) {
  if (!content) return ''
  // Remove markdown syntax and get plain text
  const plainText = content
    .replace(/#{1,6}\s/g, '')           // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1')    // Remove bold
    .replace(/\*(.*?)\*/g, '$1')        // Remove italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')  // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.*?\)/g, '')    // Remove images
    .replace(/\n+/g, ' ')               // Replace newlines with space
    .trim()

  if (plainText.length <= maxLength) return plainText
  return plainText.slice(0, maxLength).trim() + '...'
}

// Helper to estimate read time
function getReadTime(content) {
  if (!content) return '1 min read'
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}

export default function BlogList({ posts }) {
  const navigate = useNavigate()

  return (
    <div className="blog-list-container">
      {posts.map((post, i) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          onClick={() => navigate(`/blog/${post.id}`)}
          className="blog-list-item"
        >
          {/* Content Section */}
          <div className="blog-list-content">
            {/* Title */}
            <h2 className="blog-list-title">{post.title}</h2>

            {/* Excerpt */}
            <p className="blog-list-excerpt">
              {getExcerpt(post.content)}
            </p>

            {/* Meta Row */}
            <div className="blog-list-meta">
              <div className="meta-left">
                <span className="meta-date">
                  <Calendar size={14} />
                  {post.date}
                </span>
                <span className="meta-read-time">
                  <Clock size={14} />
                  {getReadTime(post.content)}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          {post.image && post.image !== '' && (
            <div className="blog-list-thumbnail">
              <img
                src={post.image}
                alt={post.title}
              />
            </div>
          )}
        </motion.article>
      ))}

      <style>{`
        .blog-list-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .blog-list-item {
          display: flex;
          gap: 1.5rem;
          padding: 2rem 0;
          border-bottom: 1px solid rgba(180, 140, 160, 0.15);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .blog-list-item:hover {
          background: rgba(180, 140, 160, 0.03);
          margin: 0 -1rem;
          padding: 2rem 1rem;
          border-radius: 12px;
        }

        .blog-list-item:first-child {
          padding-top: 1rem;
        }

        .blog-list-item:first-child:hover {
          margin-top: -1rem;
          padding-top: 2rem;
        }

        .blog-list-item:last-child {
          border-bottom: none;
        }

        .blog-list-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 0;
        }

        .blog-list-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f0f0f0;
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s ease;
        }

        .blog-list-item:hover .blog-list-title {
          color: #d4b4c4;
        }

        .blog-list-excerpt {
          font-size: 1rem;
          color: #a0a0a0;
          line-height: 1.6;
          margin: 0.25rem 0 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-list-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .meta-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .meta-date,
        .meta-read-time {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #707070;
        }

        .meta-date svg,
        .meta-read-time svg {
          color: #b48ca0;
        }

        .blog-list-thumbnail {
          flex-shrink: 0;
          width: 160px;
          height: 107px;
          border-radius: 8px;
          overflow: hidden;
        }

        .blog-list-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-list-item:hover .blog-list-thumbnail img {
          transform: scale(1.05);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .blog-list-item {
            flex-direction: column-reverse;
            gap: 1rem;
          }

          .blog-list-thumbnail {
            width: 100%;
            height: 180px;
          }

          .blog-list-title {
            font-size: 1.25rem;
          }

          .blog-list-excerpt {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}