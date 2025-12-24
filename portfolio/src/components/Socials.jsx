import { motion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'

const socials = [
  { name: 'GitHub', icon: Github, link: 'https://github.com/yourusername', color: '#d4b4c4' },
  { name: 'LinkedIn', icon: Linkedin, link: 'https://linkedin.com/in/yourusername', color: '#b48ca0' },
]

export default function Socials() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto text-center mb-12">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-5xl font-bold mb-16 gradient-text"
      >
        Connect With Me
      </motion.h2>
      
      <div className="flex justify-center gap-8">
        {socials.map((social, i) => (
          <motion.a
            key={i}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
            whileHover={{ 
              scale: 1.3, 
              rotate: 360,
              boxShadow: '0 0 60px rgba(180, 140, 160, 0.6), 0 0 100px rgba(212, 180, 196, 0.4)'
            }}
            className="bg-gradient-to-br from-[#3a2a34]/70 to-[#4a3a44]/70 p-8 rounded-2xl border-2 border-[#b48ca0]/40 transition-all cursor-pointer shadow-xl shadow-[#b48ca0]/20"
          >
            <social.icon size={48} style={{ color: social.color }} />
          </motion.a>
        ))}
      </div>
    </section>
  )
}