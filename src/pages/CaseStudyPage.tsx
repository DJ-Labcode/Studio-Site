import { useParams } from 'react-router'
import { projectBySlug } from '@/content/projects'
import { ButtonLink } from '@/shared/ui/Button'
import NotFoundPage from './NotFoundPage'

export default function CaseStudyPage() {
  const { slug = '' } = useParams()
  const p = projectBySlug(slug)
  if (!p) return <NotFoundPage />
  return (
    <article className="mx-auto grid max-w-3xl gap-6 px-5 py-24">
      <p className="font-mono text-xs tracking-widest uppercase" style={{ color: p.hue }}>
        {p.kind}
      </p>
      <h1 className="text-6xl leading-none sm:text-8xl">{p.name}</h1>
      <p className="text-muted text-lg">{p.summary}</p>
      <p className="font-medium">{p.result}</p>
      <ul className="flex flex-wrap gap-2">
        {p.stack.map((t) => (
          <li
            key={t}
            className="border-line text-muted rounded border px-2.5 py-1.5 font-mono text-xs"
          >
            {t}
          </li>
        ))}
      </ul>
      <div>
        <ButtonLink to="/" variant="ghost">
          ← Back home
        </ButtonLink>
      </div>
    </article>
  )
}
