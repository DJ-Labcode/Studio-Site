export type Feature = {
  id: string
  name: string
  note: string
  weeks: number
  price: number // INR. Example numbers for the demo: set your real rates before launch.
  span: [number, number] // block size on the 6-column phone grid: [cols, rows]
  color: string
  stack: string[]
}

export const features: Feature[] = [
  { id: 'login', name: 'Login & profiles', note: 'Email, phone OTP, Google', weeks: 0.5, price: 12000, span: [3, 1], color: '#F5F3EE', stack: ['Firebase Auth'] },
  { id: 'pay', name: 'Payments', note: 'Razorpay, UPI, subscriptions', weeks: 1, price: 22000, span: [3, 1], color: '#FFB020', stack: ['Razorpay'] },
  { id: 'chat', name: 'Chat & notifications', note: 'Real-time chat, push alerts', weeks: 1.5, price: 30000, span: [2, 2], color: '#3D7BFF', stack: ['Firestore', 'FCM'] },
  { id: 'book', name: 'Bookings & calendar', note: 'Slots, reminders, cancellations', weeks: 1, price: 20000, span: [4, 1], color: '#2FBF71', stack: ['Cloud Functions'] },
  { id: 'maps', name: 'Maps & location', note: 'Live tracking, nearby search', weeks: 1, price: 18000, span: [2, 1], color: '#8F7CFF', stack: ['Google Maps'] },
  { id: 'admin', name: 'Admin dashboard', note: 'Web panel to run the business', weeks: 2, price: 38000, span: [6, 1], color: '#FF5A1F', stack: ['React', 'Next.js'] },
  { id: 'ai', name: 'AI assistant', note: 'Answers from your own data', weeks: 2, price: 45000, span: [4, 2], color: '#FF4D6D', stack: ['FastAPI', 'RAG'] },
  { id: 'offline', name: 'Offline mode', note: 'Works without internet, syncs later', weeks: 1, price: 16000, span: [2, 1], color: '#7FD1C7', stack: ['Hive'] },
]

export const platforms = [
  { id: 'android', name: 'Android', stack: 'Flutter' },
  { id: 'ios', name: 'iOS', stack: 'Flutter' },
  { id: 'web', name: 'Web', stack: 'React' },
] as const

export const BASE = { weeks: 2, price: 40000 } // design + core screens + store launch

export type Owner = 'Dhruv' | 'Vanashri'

export type Project = {
  id: string
  name: string
  type: 'app' | 'web'
  owner: Owner
  kind: string
  summary: string
  result: string
  stack: string[]
  hue: string
  /** which mock screen to animate */
  screen: 'quiz' | 'video' | 'plant' | 'menu' | 'listing' | 'plans' | 'gallery' | 'saas'
  url: string
  client: string
  platforms: string
  duration: string
  problem: string
  built: string
  features: string[]
  metrics: { v: string; k: string }[]
  /** true = sample entry, replace with the real project */
  placeholder?: boolean
}

export const projects: Project[] = [
  {
    id: 'hsc-it', platforms: 'Android · iOS', name: 'HSC-iT', type: 'app', owner: 'Dhruv', kind: 'EdTech · Android & iOS',
    summary: 'Exam-prep app for 12th-standard students with theory, MCQs, quizzes and analytics that find each student’s weak chapters.',
    result: '100+ active learners, paid plans via Razorpay',
    stack: ['Flutter', 'Firebase', 'Razorpay', 'Provider', 'GoRouter'], hue: '#3D7BFF', screen: 'quiz', url: 'hsc-it',
    client: 'HSC IT students, Maharashtra board', duration: '10 weeks',
    problem: 'Students preparing for the HSC IT exam were juggling PDFs, WhatsApp notes and old papers, with no way to know which chapters they were actually weak in.',
    built: 'One app with the full syllabus as short theory, chapter-wise MCQs, timed quizzes and practicals. Every answer feeds an analytics screen that ranks chapters from weakest to strongest.',
    features: ['Chapter-wise theory and MCQs', 'Timed mock tests with instant scoring', 'Weak-chapter analytics', 'Razorpay subscriptions with free trial', 'Quizzes, practicals and progress in one place'],
    metrics: [{ v: '100+', k: 'active learners' }, { v: 'Live', k: 'in production' }, { v: '2', k: 'platforms, one codebase' }],
  },
  {
    id: 'plantiq', platforms: 'Android · Web', name: 'PlantIQ', type: 'app', owner: 'Dhruv', kind: 'Manufacturing · Phone & web app',
    summary: 'Runs a small factory from one app: batches, machines, inventory, sales and compliance, plus an Ask tab that answers from the plant’s own documents.',
    result: 'Private, local LLM. No data leaves the plant',
    stack: ['Flutter', 'BLoC', 'FastAPI', 'pgvector', 'LangGraph', 'Ollama'], hue: '#2FBF71', screen: 'plant', url: 'plantiq',
    client: 'Small manufacturing plant', duration: '14 weeks',
    problem: 'Production, stock, purchase and licence records lived in registers and Excel. Finding “when does the fire NOC expire?” meant digging through files.',
    built: 'A phone and web app covering batches, machines, inventory, purchase, sales and payments, plus an Ask tab: a RAG assistant that answers from the plant’s own documents using a local LLM.',
    features: ['Production batches and machine logs', 'Inventory with low-stock alerts', 'Purchase, sales and payment tracking', 'Licence and compliance reminders', 'Ask tab: answers from your own PDFs'],
    metrics: [{ v: '0', k: 'data sent to the cloud' }, { v: '7', k: 'modules in one app' }, { v: '2', k: 'platforms: phone + web' }],
  },
  {
    id: 'streamforge', platforms: 'Android · Web', name: 'StreamForge', type: 'app', owner: 'Dhruv', kind: 'Media · Video streaming',
    summary: 'Video streaming app with upload, FFmpeg transcoding and HLS adaptive playback served from AWS S3.',
    result: 'Under 200 ms average API response',
    stack: ['Flutter', 'FastAPI', 'AWS S3', 'Redis', 'Docker', 'PostgreSQL'], hue: '#FF4D6D', screen: 'video', url: 'streamforge',
    client: 'Self-initiated product', duration: '8 weeks',
    problem: 'Streaming video smoothly on slow mobile networks needs more than a file link: it needs transcoding, adaptive quality and a fast API.',
    built: 'An end-to-end platform: upload from the app, transcode with FFmpeg into HLS segments, serve from S3, and play back with automatic quality switching.',
    features: ['Upload with progress and resume', 'FFmpeg transcoding to multiple qualities', 'HLS adaptive streaming', 'Redis-cached feeds and search', 'Dockerised backend'],
    metrics: [{ v: '<200ms', k: 'average API response' }, { v: '10+', k: 'REST endpoints' }, { v: 'HLS', k: 'adaptive streaming' }],
  },
  // Vanashri’s websites: sample entries until the real ones are added
  {
    id: 'bloom-brew', platforms: 'Web', name: 'Bloom & Brew', type: 'web', owner: 'Vanashri', kind: 'Café · Website',
    summary: 'Warm, photo-led site for a neighbourhood café with an online menu and table booking.',
    result: 'Bookings straight from Instagram bio link',
    stack: ['React', 'Tailwind', 'Firebase'], hue: '#F2A541', screen: 'menu', url: 'bloomandbrew.in', placeholder: true,
    client: 'Neighbourhood café', duration: '3 weeks',
    problem: 'Table bookings came through Instagram DMs and phone calls, and the menu was a blurry photo.',
    built: 'A fast site with a live menu the owner edits from her phone, and a table-booking form that sends each booking to the café’s WhatsApp.',
    features: ['Menu editable from a phone', 'Table booking with time slots', 'Instagram feed section', 'Google Maps directions'],
    metrics: [{ v: '3 wks', k: 'idea to launch' }, { v: '95', k: 'mobile speed score' }, { v: '0', k: 'missed DMs' }],
  },
  {
    id: 'nimbus', platforms: 'Web', name: 'Nimbus Realty', type: 'web', owner: 'Vanashri', kind: 'Real estate · Web app',
    summary: 'Property listings with filters, map search and a lead form that goes straight to the agent’s WhatsApp.',
    result: 'Listings load in under a second',
    stack: ['Next.js', 'Maps API', 'Supabase'], hue: '#5B8CFF', screen: 'listing', url: 'nimbusrealty.in', placeholder: true,
    client: 'Real estate agency', duration: '6 weeks',
    problem: 'Listings were spread across portals that charged per lead, and the agency had no site of its own.',
    built: 'A listings web app with filters, map search, a page per property and an enquiry button that opens WhatsApp with the property already mentioned.',
    features: ['Filter by area, budget and BHK', 'Map search with pins', 'Property pages with photo gallery', 'WhatsApp enquiry button', 'Admin panel to add listings'],
    metrics: [{ v: '<1s', k: 'listing load time' }, { v: '120', k: 'listings at launch' }, { v: '0', k: 'portal fees' }],
  },
  {
    id: 'pulsefit', platforms: 'Web', name: 'PulseFit', type: 'web', owner: 'Vanashri', kind: 'Fitness · Website',
    summary: 'Gym website with membership plans, a weekly class timetable and online sign-up.',
    result: 'Members sign up and pay online',
    stack: ['React', 'Razorpay', 'Node.js'], hue: '#9BE15D', screen: 'plans', url: 'pulsefit.in', placeholder: true,
    client: 'Independent gym', duration: '4 weeks',
    problem: 'New members had to visit the front desk to join, and the class timetable was a printed sheet.',
    built: 'A bold site with membership plans, a live class timetable and online sign-up with Razorpay payment.',
    features: ['Plan comparison and online payment', 'Weekly class timetable', 'Trainer profiles', 'Free trial booking'],
    metrics: [{ v: '4 wks', k: 'to launch' }, { v: '24/7', k: 'sign-ups' }, { v: '3', k: 'membership plans' }],
  },
  {
    id: 'studio-kala', platforms: 'Web', name: 'Studio Kala', type: 'web', owner: 'Vanashri', kind: 'Portfolio · Website',
    summary: 'Gallery-first portfolio for an illustrator, with project stories and a commission enquiry form.',
    result: 'Full-screen gallery, works on any phone',
    stack: ['Next.js', 'Framer Motion', 'Sanity'], hue: '#FF6B9A', screen: 'gallery', url: 'studiokala.art', placeholder: true,
    client: 'Freelance illustrator', duration: '3 weeks',
    problem: 'Her work lived only on Instagram, where clients couldn’t see full projects or know how to commission her.',
    built: 'A gallery-first portfolio she updates herself, with project stories and a commission form that asks the right questions.',
    features: ['Masonry gallery with lightbox', 'Project story pages', 'Self-editable content', 'Commission enquiry form'],
    metrics: [{ v: '60+', k: 'artworks' }, { v: '98', k: 'speed score' }, { v: '3 wks', k: 'to launch' }],
  },
  {
    id: 'ledgerlite', platforms: 'Web', name: 'LedgerLite', type: 'web', owner: 'Vanashri', kind: 'SaaS · Landing page',
    summary: 'Launch site for a billing tool: feature tour, pricing table and a free-trial sign-up.',
    result: 'Lighthouse score 98 on mobile',
    stack: ['Next.js', 'TypeScript', 'Vercel'], hue: '#8F7CFF', screen: 'saas', url: 'ledgerlite.app', placeholder: true,
    client: 'Early-stage SaaS startup', duration: '2 weeks',
    problem: 'The founders had a working product but no site to explain it, show pricing or collect trial sign-ups.',
    built: 'A clear launch page with a feature tour, a monthly/yearly pricing toggle and a free-trial sign-up.',
    features: ['Feature tour with product shots', 'Monthly / yearly pricing toggle', 'Free-trial sign-up', 'SEO and social previews'],
    metrics: [{ v: '98', k: 'Lighthouse mobile' }, { v: '2 wks', k: 'to launch' }, { v: '3', k: 'pricing tiers' }],
  },
]
