import { describe, expect, it } from 'vitest'
import { briefAsText, whatsappUrl } from './whatsapp'

describe('whatsappUrl', () => {
  it('opens a chat with the number, keeping only its digits', () => {
    expect(whatsappUrl('hi there', '+91 98765-43210')).toBe(
      'https://wa.me/919876543210?text=hi%20there',
    )
  })

  it('lets the visitor pick a chat when no number is set', () => {
    expect(whatsappUrl('hi')).toBe('https://wa.me/?text=hi')
  })
})

describe('briefAsText', () => {
  it('puts the name, the need and the message together', () => {
    expect(briefAsText({ name: 'Asha', need: 'An app', message: 'For my clinic' })).toBe(
      "Hi, I'm Asha.\nI need: An app.\nFor my clinic",
    )
  })
})
