import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostModal } from "@/components/feed/post-modal"
import FeedPage from "../../page"
import { getFeedPost } from "@/lib/feed/get-feed-post"

type PostPageProps = {
  params: Promise<{ postId: string }>
  searchParams: Promise<{ tab?: string; autorId?: string }>
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params
  const post = await getFeedPost(postId)

  if (!post) return { title: "Publicação não encontrada" }

  return {
    title: `Publicação de ${post.author.name}`,
    description: post.content,
  }
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { postId } = await params
  const post = await getFeedPost(postId)

  if (!post) notFound()

  return (
    <>
      <FeedPage searchParams={searchParams} />
      <PostModal post={post} closeHref="/feed" />
    </>
  )
}
