import { describe, expect, it } from 'vitest'
import { briefFromIdea, needFromIdea } from './idea'

describe('needFromIdea', () => {
  it('reads an app, a website, or both from the words', () => {
    expect(needFromIdea('a booking app for my clinic')).toBe('app')
    expect(needFromIdea('a website for my coaching class')).toBe('website')
    expect(needFromIdea('an online store for my shop')).toBe('website')
    expect(needFromIdea('a website and an app for my gym')).toBe('both')
  })

  it('does not guess when the words do not say', () => {
    expect(needFromIdea('something for my students')).toBeNull()
    expect(needFromIdea('a happy customer')).toBeNull()
  })
})

describe('briefFromIdea', () => {
  it('finishes the sentence from the home screen', () => {
    expect(briefFromIdea('  a booking app ')).toBe('I want to build a booking app')
  })
})
