import Link from "next/link"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import type { FeedPostData } from "@/lib/feed/types"

function authorKey(post: FeedPostData): string {
  return post.author.id ?? (post.author.avatar || post.id)
}

export function FollowingPostsStrip({ posts }: { posts: FeedPostData[] }) {
  const seen = new Set<string>()
  const authors = posts.filter((post) => {
    const key = authorKey(post)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (!authors.length) return null

  return (
    <section aria-label="Pessoas que você segue com publicações">
      {authors.length ? (
        <ul className="flex h-28 [scrollbar-width:none] items-center gap-5 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
          {authors.map((post) => (
            <li key={authorKey(post)} className="w-24 shrink-0">
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
                    fictitious={post.author.fictitious !== false}
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
      ) : null}
    </section>
  )
}
