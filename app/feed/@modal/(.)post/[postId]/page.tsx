import { notFound } from "next/navigation"

import { PostModal } from "@/components/feed/post-modal"
import { getFeedPost } from "@/lib/feed/get-feed-post"

export default async function InterceptedPostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const post = await getFeedPost(postId)

  if (!post) notFound()

  return <PostModal post={post} />
}
