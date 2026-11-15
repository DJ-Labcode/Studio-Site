import { ContactSection } from '@/features/contact'
import { Hero } from '@/features/hero'
import { WorkShowcase } from '@/features/projects'
import { WhatWeDo } from '@/features/services'
import { AboutUs } from '@/features/team'

/** One continuous story: who we are, what we do, the two of us, the work, and how to reach us. */
export default function StoryHome() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <AboutUs />
      <WorkShowcase />
      <ContactSection />
    </>
  )
}
