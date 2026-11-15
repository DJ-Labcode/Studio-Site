import { site } from '@/content/site'
import BlenderHome from './home/BlenderHome'
import StoryHome from './home/StoryHome'

/** Which home page is shown is decided by one line in src/content/site.ts. */
export default function HomePage() {
  return site.homeVariant === 'blender' ? <BlenderHome /> : <StoryHome />
}
