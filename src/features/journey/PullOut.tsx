import { brand } from '@/shared/brand'
import { segment } from '@/shared/lib/math'
import { ButtonLink } from '@/shared/ui/Button'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'
import { ActionBar } from './ActionBar'
import { ForgedScreen } from './BlueScreen'
import { PULL_FRAMES } from './footage'

/**
 * The way back out: starts on the HTML "Forged" screen, which matches the first frame,
 * then scrolling pulls the camera back to the desk while the logo leaves the screen.
 */
export function PullOut() {
  return (
    <ScrollSequence urls={PULL_FRAMES} heightVh={420} id="forged" className="bg-screen">
      {(p) => (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: 1 - segment(p, 0, 0.05) }}
          >
            <ForgedScreen />
          </div>
          <ActionBar style={{ opacity: segment(p, 0.86, 0.97) }}>
            <p className="text-[0.95rem] font-medium">
              <b>Forged by {brand.name}.</b> Your idea could be next.
            </p>
            <ButtonLink to="/#contact">Forge my idea →</ButtonLink>
          </ActionBar>
        </>
      )}
    </ScrollSequence>
  )
}
