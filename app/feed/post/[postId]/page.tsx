import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostDetail } from "@/components/feed/post-detail"
import { getFeedPost } from "@/lib/feed/get-feed-post"

type PostPageProps = {
  params: Promise<{ postId: string }>
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

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  const post = await getFeedPost(postId)

  if (!post) notFound()

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PostDetail post={post} />
    </main>
  )
}
