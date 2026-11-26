"use client"

import { useSyncExternalStore } from "react"

import type { FeedPostData, FeedVisibility } from "@/lib/feed/types"

export type PostEditPatch = {
  content: string
  visibility: FeedVisibility
  editedAt: string | null
  stacks: FeedPostData["stacks"]
  media: FeedPostData["media"]
}

export type PostMutationEntry = {
  edited: PostEditPatch | null
  deleted: boolean
}

const EMPTY_MUTATION: PostMutationEntry = Object.freeze({
  edited: null,
  deleted: false,
})

type Listener = () => void

const entries = new Map<string, PostMutationEntry>()
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribePostMutations(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPostMutationSnapshot(postId: string): PostMutationEntry {
  return entries.get(postId) ?? EMPTY_MUTATION
}

export function getEmptyPostMutationSnapshot(): PostMutationEntry {
  return EMPTY_MUTATION
}

export function recordPostEdit(postId: string, patch: PostEditPatch) {
  const current = entries.get(postId) ?? EMPTY_MUTATION
  entries.set(postId, {
    ...current,
    edited: patch,
    deleted: false,
  })
  emit()
}

export function recordPostDelete(postId: string) {
  const current = entries.get(postId) ?? EMPTY_MUTATION
  entries.set(postId, {
    ...current,
    deleted: true,
  })
  emit()
}

export function usePostMutation(postId: string): PostMutationEntry {
  return useSyncExternalStore(
    subscribePostMutations,
    () => getPostMutationSnapshot(postId),
    getEmptyPostMutationSnapshot
  )
}

export function applyPostMutation(
  post: FeedPostData,
  mutation: PostMutationEntry
): FeedPostData {
  if (!mutation.edited) return post
  return {
    ...post,
    content: mutation.edited.content,
    visibility: mutation.edited.visibility,
    editedAt: mutation.edited.editedAt,
    stacks: mutation.edited.stacks,
    media: mutation.edited.media,
  }
}
