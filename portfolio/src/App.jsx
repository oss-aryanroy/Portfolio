import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Admin from './pages/Admin'
import EditPost from './pages/EditPost'
import MusicPlayer from './components/MusicPlayer'
import { MusicProvider } from './context/MusicContext'

function App() {
  return (
    <MusicProvider>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/edit/:id" element={<EditPost />} />
        </Routes>
        <MusicPlayer />
      </div>
    </MusicProvider>
  )
}

export default App