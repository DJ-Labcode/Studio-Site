import { useEffect, useState, type FormEvent } from 'react'
import { RAIL_SECTIONS } from '@/shared/lib/rail'
import { scrollToId } from '@/shared/lib/scrollTo'
import { useVisit } from '@/shared/state/visit'
import { briefFromIdea, needFromIdea } from './idea'

const HINTS = [
  'a booking app for my clinic',
  'a website for my coaching class',
  'an online store for my shop',
  'an app for my students',
]

/**
 * The home screen's one input: the visitor finishes the sentence "I want to build ...".
 * Their words are carried to the contact ticket, which is where Go takes them.
 */
export function IdeaBox({ id }: { id: string }) {
  const [hint, setHint] = useState(0)
  useEffect(() => {
    const turn = window.setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2600)
    return () => window.clearInterval(turn)
  }, [])

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const idea = String(new FormData(e.currentTarget).get('idea') ?? '').trim()
    if (idea) {
      const visit = useVisit.getState()
      visit.setBrief(briefFromIdea(idea))
      const need = needFromIdea(idea)
      if (need) visit.choose(need)
    }
    scrollToId(RAIL_SECTIONS.contact)
  }

  return (
    <form onSubmit={submit} className="max-w-[30rem]">
      <div className="border-ink bg-surface focus-within:border-ember flex items-stretch gap-2 rounded-[18px] border-2 p-2 transition focus-within:shadow-[0_16px_30px_-18px_rgb(255_90_31/0.7)]">
        <input
          id={id}
          name="idea"
          autoComplete="off"
          placeholder={HINTS[hint]}
          className="text-ink placeholder:text-muted/70 min-w-0 flex-1 bg-transparent px-2.5 py-3 text-lg font-medium focus:outline-none"
        />
        <button
          type="submit"
          className="bg-ember hover:bg-ember-deep flex-none cursor-pointer rounded-xl px-5 leading-none font-semibold text-white transition"
        >
          Go <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}
