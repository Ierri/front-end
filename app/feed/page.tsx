import { ProtectedRoute } from "@/components/auth/protected-route"
import { FollowingFeedSection } from "@/components/feed/following-feed-section"
import { InfiniteFeed } from "@/components/feed/infinite-feed"
import { RecommendedUsersPanel } from "@/components/feed/recommended-users-panel"
import { TopPostsRanking } from "@/components/feed/top-posts-ranking"
import { creatorsService, type RankedCreatorData } from "@/services/creators"
import { publicationsService, type FeedPageData } from "@/services/publications"

const emptyPage: FeedPageData = {
  items: [],
  nextCursor: null,
  hasMore: true,
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; autorId?: string }>
}) {
  const { tab, autorId } = await searchParams
  const isFollowingTab = tab === "following"
  const isTopTab = tab === "top"
  const authorId =
    !isFollowingTab && !isTopTab ? autorId?.trim() || undefined : undefined

  let initialPage = emptyPage
  let initialError = ""
  let rankedCreators: RankedCreatorData[] = []

  if (isTopTab) {
    const [postsResult, rankingResult] = await Promise.allSettled([
      publicationsService.list({ order: "score" }),
      creatorsService.ranking({ limit: 5 }),
    ])
    if (postsResult.status === "fulfilled") {
      initialPage = postsResult.value
    } else {
      initialError =
        postsResult.reason instanceof Error
          ? postsResult.reason.message
          : "Não foi possível carregar as publicações mais votadas."
    }
    if (rankingResult.status === "fulfilled") {
      rankedCreators = rankingResult.value.items
    }
  } else if (!isFollowingTab) {
    try {
      initialPage = await publicationsService.list({ authorId })
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
          isFollowingTab
            ? "Feed de pessoas que você segue"
            : isTopTab
              ? "Feed das publicações mais votadas"
              : "Feed de publicações"
        }
        className="px-4 pt-6 pb-10 sm:px-6 lg:px-8 xl:px-0"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {isFollowingTab ? (
            <FollowingFeedSection />
          ) : (
            <>
              {isTopTab && rankedCreators.length > 0 && (
                <div className="flex min-h-28 min-w-0 items-center [&>article]:w-full [&>section]:w-full">
                  <TopPostsRanking creators={rankedCreators} />
                </div>
              )}
              <InfiniteFeed
                key={isTopTab ? "top" : (authorId ?? "all")}
                initialPage={initialPage}
                initialError={initialError}
                authorId={authorId}
                order={isTopTab ? "score" : undefined}
              />
            </>
          )}
        </div>
      </section>
      <RecommendedUsersPanel />
    </main>
  )

  return isFollowingTab ? (
    <ProtectedRoute returnTo="/feed?tab=following">{content}</ProtectedRoute>
  ) : (
    content
  )
}
