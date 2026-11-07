import { notFound } from "next/navigation"

import { PostModal } from "@/components/feed/post-modal"
import { getFeedPostById } from "@/lib/feed/mock-data"

export default async function InterceptedPostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const post = getFeedPostById(postId)

  if (!post) notFound()

  return <PostModal post={post} />
}
