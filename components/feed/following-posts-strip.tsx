import Link from "next/link"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import type { FeedPostData } from "@/lib/feed/types"

export function FollowingPostsStrip({ posts }: { posts: FeedPostData[] }) {
  const authors = posts.filter(
    (post, index) =>
      posts.findIndex((entry) => entry.author.avatar === post.author.avatar) ===
      index
  )

  return (
    <section aria-label="Pessoas que você segue com publicações">
      {authors.length ? (
        <ul className="flex h-28 [scrollbar-width:none] items-center gap-5 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
          {authors.map((post) => (
            <li key={post.author.avatar} className="w-24 shrink-0">
              <Link
                href={`/feed/post/${post.id}`}
                aria-label={`Ver publicação de ${post.author.name}`}
                className="group flex flex-col items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="rounded-full border-2 border-primary p-1 transition-colors group-hover:bg-accent">
                  <FeedUserAvatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="story"
                  />
                </span>
                <span
                  className="w-full truncate text-center text-xs font-medium"
                  title={post.author.name}
                >
                  {post.author.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Quando as pessoas que você segue publicarem, elas aparecerão aqui.
        </p>
      )}
    </section>
  )
}
