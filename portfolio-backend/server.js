import express from 'express'
import multer from 'multer'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'
import Blog from './models/Blog.js'
import { authenticateToken } from './middleware/auth.js'

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

const app = express()
const PORT = 3001

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'portfolio-blog'
})
    .then(() => console.log('✅ MongoDB connected successfully to database: portfolio-blog'))
    .catch(err => console.error('❌ MongoDB connection error:', err))

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure CORS
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true)

        const allowedOrigins = [
            'https://aryandoes.tech',
            'https://www.aryandoes.tech',
            'http://aryandoes.tech',
            'http://www.aryandoes.tech',
            'http://localhost:5173',
            'http://localhost:4173'
        ]

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))

// Configure multer for image uploads
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg/
        const mimetype = allowedTypes.test(file.mimetype)
        if (mimetype) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed!'))
        }
    }
})

// ============================================
// AUTH ENDPOINTS
// ============================================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body

    if (!password) {
        return res.status(400).json({ error: 'Password is required' })
    }

    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        res.json({ success: true, token })
    } else {
        res.status(401).json({ error: 'Invalid password' })
    }
})

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user })
})

// ============================================
// BLOG ENDPOINTS
// ============================================

// GET all posts (public)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Blog.find().sort({ createdAt: -1 })
        res.json(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Failed to fetch posts' })
    }
})

// GET single post (public)
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        res.json(post)
    } catch (error) {
        console.error('Error fetching post:', error)
        res.status(500).json({ error: 'Failed to fetch post' })
    }
})

// CREATE post (protected)
app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, content, image } = req.body

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' })
        }

        const post = new Blog({
            title,
            content,
            image: image || '',
            date: new Date().toLocaleDateString()
        })

        await post.save()
        console.log(`📝 New post created: ${title}`)
        res.status(201).json(post)
    } catch (error) {
        console.error('Error creating post:', error)
        res.status(500).json({ error: 'Failed to create post' })
    }
})

// UPDATE post (protected)
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, image } = req.body

        const post = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, content, image },
            { new: true, runValidators: true }
        )

        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        console.log(`✏️ Post updated: ${title}`)
        res.json(post)
    } catch (error) {
        console.error('Error updating post:', error)
        res.status(500).json({ error: 'Failed to update post' })
    }
})

// DELETE post (protected)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Blog.findByIdAndDelete(req.params.id)

        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        console.log(`🗑️ Post deleted: ${post.title}`)
        res.json({ success: true, message: 'Post deleted successfully' })
    } catch (error) {
        console.error('Error deleting post:', error)
        res.status(500).json({ error: 'Failed to delete post' })
    }
})

// ============================================
// IMAGE UPLOAD ENDPOINT
// ============================================

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'portfolio-blog',
                    resource_type: 'auto',
                    public_id: `blog-image-${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(req.file.buffer)
        })

        const result = await uploadPromise
        console.log(`🖼️ Image uploaded to Cloudinary: ${result.public_id}`)

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            filename: `${result.public_id}.${result.format}`
        })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({
            error: 'Failed to upload image',
            details: error.message
        })
    }
})

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Portfolio API server is running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        cloudinary: {
            configured: !!process.env.CLOUDINARY_CLOUD_NAME,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        }
    })
})

// ============================================
// MUSIC STREAMING ENDPOINTS
// ============================================

// Serve music cover images
app.use('/api/music/covers', express.static(path.join(__dirname, 'music', 'covers')))

// Load tracks from JSON file (reloads on each request for live updates)
function loadMusicTracks() {
    const tracksPath = path.join(__dirname, 'music', 'tracks.json')
    try {
        const data = fs.readFileSync(tracksPath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Failed to load tracks.json:', error.message)
        return []
    }
}

// GET track list with pagination
app.get('/api/music/tracks', (req, res) => {
    const musicTracks = loadMusicTracks()
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedTracks = musicTracks.slice(startIndex, endIndex)
    const tracks = paginatedTracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: `/api/music/covers/${track.cover}`,
        src: `/api/music/stream/${track.id}`
    }))

    res.json({
        tracks,
        pagination: {
            page,
            limit,
            total: musicTracks.length,
            totalPages: Math.ceil(musicTracks.length / limit),
            hasMore: endIndex < musicTracks.length
        }
    })
})

// Stream music with range request support and quality selection
app.get('/api/music/stream/:id', (req, res) => {
    const musicTracks = loadMusicTracks()
    const track = musicTracks.find(t => t.id === parseInt(req.params.id))
    const quality = req.query.quality || 'flac' // 'flac' or 'ogg'

    if (!track) {
        return res.status(404).json({ error: 'Track not found' })
    }

    // Get filename based on quality - support both old and new format
    let filename
    if (track.files) {
        filename = track.files[quality] || track.files.flac || track.files.ogg
    } else {
        filename = track.filename // Fallback for old format
    }

    if (!filename) {
        return res.status(404).json({ error: 'Quality not available' })
    }

    // Files are stored in quality subfolders (flac/ or ogg/) or root
    let filePath = path.join(__dirname, 'music', quality, filename)

    // Fallback to root music folder if not in subfolder
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'music', filename)
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`🎵 Music file not found: ${filePath}`)
        return res.status(404).json({ error: 'Music file not found' })
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    // Determine content type
    const ext = path.extname(filename).toLowerCase()
    const contentTypes = {
        '.flac': 'audio/flac',
        '.ogg': 'audio/ogg',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
    }
    const contentType = contentTypes[ext] || 'audio/mpeg'

    if (range) {
        // Parse range header
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end - start) + 1

        const file = fs.createReadStream(filePath, { start, end })
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType
        }

        res.writeHead(206, headers)
        file.pipe(res)
    } else {
        // No range requested, send entire file
        const headers = {
            'Content-Length': fileSize,
            'Content-Type': contentType
        }
        res.writeHead(200, headers)
        fs.createReadStream(filePath).pipe(res)
    }
})

// Start server
app.listen(PORT, "127.0.0.1", () => {
    console.log(`\n🚀 Portfolio API server running on http://localhost:${PORT}`)
    console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'NOT CONFIGURED'}`)
    console.log(`🔐 Auth: JWT-based authentication enabled\n`)
})
