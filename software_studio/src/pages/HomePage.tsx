import { MessageWindow } from '@/features/contact'
import { Desktop } from '@/features/desktop'
import { Dock } from '@/features/dock'
import { ClosedLaptop, LaptopStage } from '@/features/laptop'
import { Planner, plannerIsLive } from '@/features/planner'
import { Steps } from '@/features/process'
import { Browser, Overlays, Simulator } from '@/features/projects'
import { Readme } from '@/features/team'
import { SECTIONS } from '@/shared/lib/sections'
import { Section } from '@/shared/ui/Section'

/**
 * The whole site is one laptop. It starts up, the visitor scrolls into its screen, and every
 * section after that is a software window on its desktop.
 */
export default function HomePage() {
  return (
    <>
      <LaptopStage>
        <Desktop />
      </LaptopStage>
      <main className="inside">
        <Section
          id={SECTIONS.web}
          label="browser"
          note="websites by Vanashri"
          title="Websites that explain, enrol and sell."
        >
          <Browser />
        </Section>
        <Section
          id={SECTIONS.apps}
          label="simulator"
          note="apps by Dhruv"
          title="Apps people open every day."
        >
          <Simulator />
        </Section>
        <Section
          id={SECTIONS.planner}
          label={plannerIsLive() ? 'ai planner' : 'planner'}
          note="not sure what you need?"
          title="Describe it. Get a first plan."
          lead="Tell the planner what you want in plain words. It works out whether you need a website or an app, which screens it would have, and what we would ask you."
        >
          <Planner />
        </Section>
        <Section
          id={SECTIONS.process}
          label="terminal"
          note="how we work"
          title="Four steps from idea to live."
        >
          <Steps />
        </Section>
        <Section
          id={SECTIONS.about}
          label="readme"
          note="about us"
          title="Two developers, one studio."
        >
          <Readme />
        </Section>
        <Section
          id={SECTIONS.contact}
          label="new message"
          note="contact"
          title="Let’s build yours."
        >
          <MessageWindow />
        </Section>
        <ClosedLaptop />
      </main>
      <Dock />
      <Overlays />
    </>
  )
}
