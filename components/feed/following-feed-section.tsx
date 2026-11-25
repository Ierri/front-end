"use client"

import { useState } from "react"

import { FollowingPostsStrip } from "@/components/feed/following-posts-strip"
import { InfiniteFeed } from "@/components/feed/infinite-feed"
import type { FeedPostData } from "@/lib/feed/types"
import type { FeedPageData } from "@/services/publications"

const emptyFollowingPage: FeedPageData = {
  items: [],
  nextCursor: null,
  hasMore: true,
}

export function FollowingFeedSection() {
  const [posts, setPosts] = useState<FeedPostData[]>([])

  return (
    <>
      <div className="flex min-h-28 min-w-0 items-center [&>article]:w-full [&>section]:w-full">
        <FollowingPostsStrip posts={posts} />
      </div>
      <InfiniteFeed
        key="following"
        initialPage={emptyFollowingPage}
        scope="seguindo"
        loadOnMount
        emptyTitle="Nenhuma publicação de quem você segue"
        emptyDescription="Quando as pessoas que você segue compartilharem projetos, eles aparecerão aqui."
        onPostsChange={setPosts}
      />
    </>
  )
}
