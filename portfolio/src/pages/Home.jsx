import Hero from '../components/Hero'
import Projects from '../components/Projects'
import Socials from '../components/Socials'
import BackgroundOrbs from '../components/BackgroundOrbs'

export default function Home() {
  return (
    <div>
      <BackgroundOrbs />
      <Hero />
      <Projects />
      <Socials />
      <footer className="py-12 text-center text-gray-500 text-sm border-t border-[#b48ca0]/10">
        <p>© 2025 Aryan Roy. All rights reserved.</p>
      </footer>
    </div>
  )
}