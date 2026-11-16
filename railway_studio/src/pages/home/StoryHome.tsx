import { ContactSection } from '@/features/contact'
import { Hero } from '@/features/hero'
import { ProjectLine } from '@/features/projects'
import { Railway, StationMap } from '@/features/railway'
import { AboutUs } from '@/features/team'

/**
 * The story home: a station. Two railway lines leave from the logo, one for websites and one
 * for apps, pass each project, meet at About and end at the contact ticket.
 */
export default function StoryHome() {
  return (
    <div className="relative overflow-hidden">
      <Railway />
      <div className="relative">
        <Hero />
        <ProjectLine world="web" />
        <ProjectLine world="app" />
        <AboutUs />
        <ContactSection />
      </div>
      <StationMap />
    </div>
  )
}
