import { team } from '@/content/team'
import { brand } from '@/shared/brand'
import { Rise } from '@/shared/ui/Rise'
import { Window } from '@/shared/ui/Window'

/** About us, written as the README of the studio, with the two founders as its authors. */
export function Readme() {
  return (
    <Rise>
      <Window title="README.md">
        <div className="readme">
          <p>
            <span className="md-h"># </span>
            {brand.name} is a web and app studio in {brand.location.split(',')[0]}. One of us builds
            the websites, the other builds the apps, and you talk to the people who write the code.
          </p>
          <div className="authors">
            {brand.founders.map((f) => (
              <div key={f.id} className="author">
                <div className="av" aria-hidden="true">
                  {f.initial}
                </div>
                <div>
                  <h3>{f.name}</h3>
                  <p>{team[f.id].story}</p>
                  <a href={f.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p>
            <span className="md-h">## </span>
            <span className="spark">✦</span>We build AI features too. RagLabs, our platform for
            manufacturers, answers shop-floor questions from a company’s own documents, with voice
            in English, Hindi and Gujarati.
          </p>
        </div>
      </Window>
    </Rise>
  )
}
