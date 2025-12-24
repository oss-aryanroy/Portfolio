import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString()
    }
}, {
    timestamps: true
})

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
