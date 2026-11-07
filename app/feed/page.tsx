import { CreatePostCard } from "@/components/feed/create-post-card"
import { FeedPostCard } from "@/components/feed/feed-post-card"
import { RecommendedUsersPanel } from "@/components/feed/recommended-users-panel"
import { feedPosts } from "@/lib/feed/mock-data"

export default function FeedPage() {
  return (
    <main className="mx-auto grid w-full max-w-[1350px] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-6 xl:px-8">
      <section
        aria-label="Feed de publicações fictícias"
        className="min-h-[calc(100svh-11.25rem)] px-4 py-10 sm:px-6 md:min-h-[calc(100svh-5rem)] lg:px-8 xl:px-0"
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <CreatePostCard />
          {feedPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
      <RecommendedUsersPanel />
    </main>
  )
}
