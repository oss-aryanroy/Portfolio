# Portfolio Backend - Cloudinary Image Upload Server

Simple Express server to handle image uploads for the portfolio blog using Cloudinary cloud storage.

## Features

- Upload images via API to Cloudinary
- Images stored on Cloudinary CDN (not local disk)
- Returns Cloudinary HTTPS URLs
- Supports: PNG, JPEG, GIF, WebP, BMP, SVG
- 10MB file size limit
- CORS enabled for local development
- Images organized in `portfolio-blog` folder on Cloudinary

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Server

```bash
npm start
```

The server will run on **http://localhost:3001**

## API Endpoints

### POST `/api/upload-image`

Upload an image file to Cloudinary.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `image` field

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/dm3baqdex/image/upload/v1234567890/portfolio-blog/blog-image-1735068649123.png",
  "publicId": "portfolio-blog/blog-image-1735068649123",
  "filename": "portfolio-blog/blog-image-1735068649123.png"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Cloudinary image upload server is running",
  "cloudinary": {
    "configured": true,
    "cloudName": "dm3baqdex"
  }
}
```

## Usage with Frontend

The frontend blog editor automatically uploads images when you paste them (Ctrl+V):

1. Start this backend server: `npm start`
2. Start the frontend: `cd ../portfolio && npm run dev`
3. Open the blog editor
4. Paste an image (Ctrl+V)
5. Image is uploaded to Cloudinary
6. Markdown syntax is inserted with Cloudinary URL

## Benefits of Cloudinary

✅ **Cloud Storage** - No local disk space used  
✅ **CDN Delivery** - Fast image loading worldwide  
✅ **Automatic Optimization** - Images optimized for web  
✅ **Scalable** - 25GB free storage  
✅ **Reliable** - Professional image hosting  
✅ **Transformations** - Can resize/crop images on-the-fly  

## Directory Structure

```
portfolio-backend/
├── server.js          # Express server with Cloudinary
├── package.json       # Dependencies
├── .env              # Cloudinary credentials (not committed)
└── README.md         # This file
```

Images are stored on Cloudinary at:
`https://res.cloudinary.com/dm3baqdex/image/upload/portfolio-blog/`

