import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { TechnologyIconList } from "@/components/feed/technology-icon-list"
import type { FeedUserData, TechnologyKey } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

type FeedUserSummaryProps = {
  user: FeedUserData
  technologies: TechnologyKey[]
  compact?: boolean
  className?: string
}

export function FeedUserSummary({
  user,
  technologies,
  compact = false,
  className,
}: FeedUserSummaryProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <FeedUserAvatar
        src={user.avatar}
        name={user.name}
        size={compact ? "small" : "large"}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <TechnologyIconList
          technologies={technologies}
          ownerName={user.name}
          className={compact ? "mt-1 gap-2" : "mt-1.5"}
        />
      </div>
    </div>
  )
}
