# Portfolio

A personal portfolio website with an integrated blog platform. Built with React and Node.js.

## Structure

```
Portfolio/
├── portfolio/          # Frontend (React + Vite)
└── portfolio-backend/  # Backend (Express + MongoDB)
```

## Tech Stack

**Frontend**
- React 18 with Vite
- Framer Motion for animations
- TailwindCSS for styling
- Markdown support with syntax highlighting

**Backend**
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image hosting

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/oss-aryanroy/portfolio.git
cd portfolio

# Install frontend dependencies
cd portfolio
npm install

# Install backend dependencies
cd ../portfolio-backend
npm install
```

### Configuration

Create a `.env` file in the `portfolio-backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running Locally

```bash
# Start backend (from portfolio-backend/)
npm start

# Start frontend (from portfolio/)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:3001`

## Features

- Modern, responsive design
- Blog with markdown support
- Admin panel for content management
- Dark theme with custom color palette
- Smooth animations and transitions

## License

MIT
