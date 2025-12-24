import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const projects = [
  {
    title: 'VIT-AP Faculty Ranker',
    description: 'A platform to rank and review faculty members at VIT-AP University',
    tags: ['React', 'Web Dev', 'MongoDB'],
    link: '#',
    website: 'https://vitap-faculty-ranker.online',
  },
  {
    title: 'ThatCountingBot',
    description: 'An automated counting bot with advanced features',
    tags: ['Discord API', 'Bot Development', 'Automation', 'Python'],
    link: '#',
  },
  {
    title: 'Spotifyseek',
    description: 'Download your spotify playlist as Hi-Res FLAC audio files using the Soulseek P2P network.',
    tags: ['Web Development', 'Spotify API', 'Automation'], 
    link: '#'
  }
]

export default function Projects() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-5xl font-bold text-center mb-16 gradient-text"
      >
        Featured Projects
      </motion.h2>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 0 60px rgba(180, 140, 160, 0.6), 0 0 100px rgba(212, 180, 196, 0.3)',
              y: -10
            }}
            className={`bg-gradient-to-br from-[#3a2a34]/60 to-[#4a3a44]/60 backdrop-blur-sm p-8 rounded-2xl border border-[#b48ca0]/30 transition-all shadow-xl shadow-[#b48ca0]/10 ${
              projects.length % 2 !== 0 && i === projects.length - 1 ? 'md:col-span-2 md:max-w-2xl md:mx-auto' : ''
            }`}
          >
            <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#b48ca0] to-[#d4b4c4]">{project.title}</h3>
            <p className="text-gray-300 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, j) => (
                <span
                  key={j}
                  className="px-3 py-1 bg-gradient-to-r from-[#b48ca0]/20 to-[#d4b4c4]/20 text-[#d4b4c4] rounded-full text-sm border border-[#b48ca0]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.link}
              className="inline-flex items-center gap-2 text-[#d4b4c4] hover:text-[#b48ca0] transition font-semibold"
            >
              View Project <ExternalLink size={16} />
            </a>
            {project.website && (
              <>
                <span className="text-gray-500 mx-3">•</span>
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#d4b4c4] hover:text-[#b48ca0] transition font-semibold"
                >
                  Visit Website <ExternalLink size={16} />
                </a>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}