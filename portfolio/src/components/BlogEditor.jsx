import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, Upload, Bold, Italic, Strikethrough, Code, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Heading3, Quote, Minus, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import BlogPreview from './BlogPreview'
import { API_URL } from '../config/api'

export default function BlogEditor({ onSave }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSave = () => {
    const post = {
      id: Date.now(),
      title,
      content,
      image, // Just use the uploaded image, empty if none
      excerpt: content.substring(0, 150),
      date: new Date().toLocaleDateString(),
    }
    onSave(post)
    setTitle('')
    setContent('')
    setImage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newContent = content.substring(0, start) + '    ' + content.substring(end)
      setContent(newContent)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      }, 0)
    }
  }

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    // Check if clipboard contains an image
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        try {
          // Create FormData to send to backend
          const formData = new FormData()
          formData.append('image', file)

          // Upload to backend
          const response = await fetch(`${API_URL}/api/upload-image`, {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          const data = await response.json()

          // Insert markdown with the file path
          const imageName = data.filename.replace(/\.[^/.]+$/, '') // Remove extension for alt text
          const markdownImage = `![${imageName}](${data.url})\n`

          // Insert at cursor position
          const textarea = document.getElementById('content-textarea')
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newContent = content.substring(0, start) + markdownImage + content.substring(end)
          setContent(newContent)

          // Update cursor position after the inserted image
          setTimeout(() => {
            textarea.focus()
            const newPosition = start + markdownImage.length
            textarea.selectionStart = newPosition
            textarea.selectionEnd = newPosition
          }, 0)

          console.log('Image uploaded successfully:', data.filename)
        } catch (error) {
          console.error('Failed to upload image:', error)
          alert('Failed to upload image. Make sure the backend server is running on port 3001.')
        }

        break // Only handle the first image
      }
    }
  }

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('content-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + prefix.length
      textarea.selectionEnd = end + prefix.length
    }, 0)
  }

  const insertAlignment = (alignment) => {
    const textarea = document.getElementById('content-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    // If no text is selected, find the current line
    let textToAlign = selectedText
    let actualStart = start
    let actualEnd = end

    if (!selectedText) {
      // Find the start and end of the current line
      actualStart = content.lastIndexOf('\n', start - 1) + 1
      actualEnd = content.indexOf('\n', start)
      if (actualEnd === -1) actualEnd = content.length
      textToAlign = content.substring(actualStart, actualEnd)
    }

    // Add markdown="1" to allow markdown processing inside HTML
    const alignedText = `<div class="text-${alignment}" markdown="1">\n\n${textToAlign}\n\n</div>`
    const newContent = content.substring(0, actualStart) + alignedText + content.substring(actualEnd)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      const newPosition = actualStart + alignedText.length
      textarea.selectionStart = newPosition
      textarea.selectionEnd = newPosition
    }, 0)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-4 mb-6 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-6 py-3 bg-[#b48ca0] hover:bg-[#a07c90] rounded-lg transition"
        >
          <Eye size={20} />
          {showPreview ? 'Edit' : 'Preview'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#d4b4c4] hover:bg-[#b48ca0] text-gray-900 rounded-lg transition"
        >
          <Save size={20} />
          Save Post
        </motion.button>
      </div>

      {showPreview ? (
        <BlogPreview title={title} content={content} image={image} />
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#3a2a34]/60 border border-[#b48ca0]/30 rounded-lg text-white focus:outline-none focus:border-[#b48ca0]"
              placeholder="Enter post title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Cover Image</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-6 py-3 bg-[#3a2a34]/60 border border-[#b48ca0]/30 rounded-lg cursor-pointer hover:bg-[#4a3a44]/80 transition">
                <Upload size={20} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {image && <span className="text-green-400 text-sm">✓ Image uploaded</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Content</label>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-[#3a2a34]/60 border border-[#b48ca0]/30 rounded-lg">
              <button
                onClick={() => insertFormatting('# ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Heading 1"
              >
                <Heading1 size={18} />
              </button>
              <button
                onClick={() => insertFormatting('## ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Heading 2"
              >
                <Heading2 size={18} />
              </button>
              <button
                onClick={() => insertFormatting('### ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Heading 3"
              >
                <Heading3 size={18} />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertAlignment('left')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                onClick={() => insertAlignment('center')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                onClick={() => insertAlignment('right')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              <button
                onClick={() => insertAlignment('justify')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                onClick={() => insertFormatting('~~', '~~')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Strikethrough"
              >
                <Strikethrough size={18} />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertFormatting('`', '`')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Inline Code"
              >
                <Code size={18} />
              </button>
              <button
                onClick={() => {
                  const lang = prompt('Enter language (e.g., javascript, python, html):', 'javascript')
                  if (lang !== null) {
                    insertFormatting(`\`\`\`${lang}\n`, '\n\`\`\`')
                  }
                }}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Code Block"
              >
                <Code size={18} className="border border-current rounded px-1" />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertFormatting('- ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Bullet List"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => insertFormatting('1. ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Numbered List"
              >
                <ListOrdered size={18} />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertFormatting('> ', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Blockquote"
              >
                <Quote size={18} />
              </button>
              <button
                onClick={() => insertFormatting('\n---\n', '')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Horizontal Rule"
              >
                <Minus size={18} />
              </button>
              <div className="w-px bg-[#b48ca0]/30 mx-1"></div>
              <button
                onClick={() => insertFormatting('[', '](url)')}
                className="p-2 hover:bg-[#b48ca0]/30 rounded transition"
                title="Link"
              >
                <LinkIcon size={18} />
              </button>
            </div>

            <textarea
              id="content-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              rows={20}
              className="w-full px-4 py-3 bg-[#3a2a34]/60 border border-[#b48ca0]/30 rounded-lg text-white focus:outline-none focus:border-[#b48ca0] font-mono"
              placeholder="Write your post content (supports markdown)..."
            />
          </div>
        </div>
      )}
    </div>
  )
}