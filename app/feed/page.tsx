import { CreatePostCard } from "@/components/feed/create-post-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { FollowingPostsStrip } from "@/components/feed/following-posts-strip"
import { TopPostsRanking } from "@/components/feed/top-posts-ranking"
import { FeedPostCard } from "@/components/feed/feed-post-card"
import { RecommendedUsersPanel } from "@/components/feed/recommended-users-panel"
import { followedDemoAuthors, feedPosts } from "@/lib/feed/mock-data"

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const posts =
    tab === "following"
      ? feedPosts.filter((post) =>
          followedDemoAuthors.includes(post.author.avatar)
        )
      : tab === "top"
        ? [...feedPosts].sort((a, b) => b.score - a.score)
        : feedPosts

  const content = (
    <main className="mx-auto grid w-full max-w-[1350px] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-6 xl:px-8">
      <section
        aria-label="Feed de publicações fictícias"
        className="min-h-[calc(100svh-11.25rem)] px-4 pt-6 pb-10 sm:px-6 md:min-h-[calc(100svh-5rem)] lg:px-8 xl:px-0"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex min-h-28 min-w-0 items-center [&>article]:w-full [&>section]:w-full">
            {tab === "following" ? (
              <FollowingPostsStrip posts={posts} />
            ) : tab === "top" ? (
              <TopPostsRanking posts={posts} />
            ) : (
              <CreatePostCard />
            )}
          </div>
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
      <RecommendedUsersPanel />
    </main>
  )

  return tab === "following" ? (
    <ProtectedRoute returnTo="/feed?tab=following">{content}</ProtectedRoute>
  ) : (
    content
  )
}
