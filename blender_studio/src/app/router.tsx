import { createBrowserRouter } from 'react-router'
import RootLayout from './RootLayout'

/** Every page is its own lazy chunk, so visitors only download the page they open. */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).default }),
      },
      {
        path: 'work/:slug',
        lazy: async () => ({ Component: (await import('@/pages/CaseStudyPage')).default }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).default }),
      },
    ],
  },
])
