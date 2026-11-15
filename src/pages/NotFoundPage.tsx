import { ButtonLink } from '@/shared/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="mx-auto grid min-h-[60svh] max-w-xl content-center gap-6 px-5 text-center">
      <p className="text-ember font-mono text-sm">404</p>
      <h1 className="text-5xl">This page was never forged.</h1>
      <div>
        <ButtonLink to="/">Back home</ButtonLink>
      </div>
    </section>
  )
}
