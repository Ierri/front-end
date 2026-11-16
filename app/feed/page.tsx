import { CreatePostCard } from "@/components/feed/create-post-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { FollowingPostsStrip } from "@/components/feed/following-posts-strip"
import { InfiniteFeed } from "@/components/feed/infinite-feed"
import { TopPostsRanking } from "@/components/feed/top-posts-ranking"
import { FeedPostCard } from "@/components/feed/feed-post-card"
import { RecommendedUsersPanel } from "@/components/feed/recommended-users-panel"
import { followedDemoAuthors, feedPosts } from "@/lib/feed/mock-data"
import { publicationsService, type FeedPageData } from "@/services/publications"

const emptyPage: FeedPageData = {
  items: [],
  nextCursor: null,
  hasMore: true,
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const isDemoTab = tab === "following" || tab === "top"
  const demoPosts =
    tab === "following"
      ? feedPosts.filter((post) =>
          followedDemoAuthors.includes(post.author.avatar)
        )
      : tab === "top"
        ? [...feedPosts].sort((a, b) => b.score - a.score)
        : []
  let initialPage = emptyPage
  let initialError = ""
  if (!isDemoTab) {
    try {
      initialPage = await publicationsService.list()
    } catch (error) {
      initialError =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as publicações."
    }
  }

  const content = (
    <main className="mx-auto grid w-full max-w-[1350px] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-6 xl:px-8">
      <section
        aria-label={
          isDemoTab
            ? "Feed de publicações demonstrativas"
            : "Feed de publicações"
        }
        className="min-h-[calc(100svh-11.25rem)] px-4 pt-6 pb-10 sm:px-6 md:min-h-[calc(100svh-5rem)] lg:px-8 xl:px-0"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex min-h-28 min-w-0 items-center [&>article]:w-full [&>section]:w-full">
            {tab === "following" ? (
              <FollowingPostsStrip posts={demoPosts} />
            ) : tab === "top" ? (
              <TopPostsRanking posts={demoPosts} />
            ) : (
              <CreatePostCard />
            )}
          </div>
          {isDemoTab && (
            <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
              Conteúdo demonstrativo enquanto este filtro não está disponível na
              API.
            </p>
          )}
          {isDemoTab ? (
            demoPosts.map((post) => <FeedPostCard key={post.id} post={post} />)
          ) : (
            <InfiniteFeed
              initialPage={initialPage}
              initialError={initialError}
            />
          )}
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
