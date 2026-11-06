import {
  Braces,
  Cloud,
  Code2,
  Component,
  Database,
  Palette,
  PanelsTopLeft,
  Smartphone,
} from "lucide-react"

import { FeedHeader } from "@/components/feed-header"
import { FeedPostCard, type FeedPost } from "@/components/feed-post"
import { FeedSidebar } from "@/components/feed-sidebar"
import { RecommendedUsers } from "@/components/recommended-users"

const posts: FeedPost[] = [
  {
    id: "analytics-studio",
    author: {
      name: "Bruno Rocha",
      avatar: "/feed/avatars/bruno-rocha.png",
    },
    technologies: [
      { label: "Desenvolvimento web", icon: Code2 },
      { label: "TypeScript", icon: Braces },
      { label: "Bancos de dados", icon: Database },
    ],
    media: {
      src: "/feed/posts/analytics-studio.png",
      alt: "Mockup fictício de uma interface de analytics para um estúdio criativo",
    },
    score: 128,
  },
  {
    id: "wellness-mobile",
    author: {
      name: "Larissa Nunes",
      avatar: "/feed/avatars/larissa-nunes.png",
    },
    technologies: [
      { label: "Aplicativos mobile", icon: Smartphone },
      { label: "React", icon: Component },
      { label: "Design de interfaces", icon: Palette },
    ],
    media: {
      src: "/feed/posts/wellness-mobile.png",
      alt: "Mockup fictício de um aplicativo mobile de bem-estar",
    },
    score: 204,
  },
  {
    id: "commerce-system",
    author: {
      name: "Marina Alves",
      avatar: "/feed/avatars/marina-alves.png",
    },
    technologies: [
      { label: "Design de interfaces", icon: PanelsTopLeft },
      { label: "React", icon: Component },
      { label: "Cloud", icon: Cloud },
    ],
    media: {
      src: "/feed/posts/commerce-system.png",
      alt: "Mockup fictício de um design system para comércio eletrônico",
    },
    score: 91,
  },
]

export default function FeedPage() {
  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[5rem_minmax(0,1fr)] lg:px-6 xl:grid-cols-[15rem_minmax(0,1fr)_22rem] xl:gap-6 xl:px-8">
        <FeedSidebar />
        <section
          aria-label="Feed de publicações fictícias"
          className="min-h-[calc(100svh-8.75rem)] px-4 py-10 sm:px-6 lg:min-h-[calc(100svh-5rem)] lg:px-8 xl:px-0"
        >
          <div className="mx-auto max-w-3xl space-y-8">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
        <RecommendedUsers />
      </main>
    </div>
  )
}
