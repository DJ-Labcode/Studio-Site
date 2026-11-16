import { describe, expect, it } from 'vitest'
import { draftPlan, planAsText } from './plan'

describe('draftPlan', () => {
  it('reads an app, a website, or both from the words', () => {
    expect(draftPlan('a booking app for my clinic').need).toBe('app')
    expect(draftPlan('a website for my coaching class').need).toBe('website')
    expect(draftPlan('a website and an app for my gym').need).toBe('both')
    expect(draftPlan('something for my business').need).toBe('both')
  })

  it('suggests screens for the kind of business', () => {
    expect(draftPlan('a booking app for my clinic').screens).toContain('Book an appointment')
    expect(draftPlan('an online store for my shop').screens).toContain('Cart and checkout')
    expect(draftPlan('something for my business').screens).toContain('Enquiry form')
  })
})

describe('planAsText', () => {
  it('writes the idea and the plan for the message', () => {
    const text = planAsText('a booking app', draftPlan('a booking app'))
    expect(text).toContain('I want to build a booking app.')
    expect(text).toContain('- A mobile app')
  })
})
