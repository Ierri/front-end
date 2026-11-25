import Link from "next/link"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { TechnologyIconList } from "@/components/feed/technology-icon-list"
import type { FeedUserData, TechnologyKey } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

type FeedUserSummaryProps = {
  user: FeedUserData
  technologies: TechnologyKey[]
  profileHref?: string
  compact?: boolean
  className?: string
}

export function FeedUserSummary({
  user,
  technologies,
  profileHref,
  compact = false,
  className,
}: FeedUserSummaryProps) {
  const profileLinkClass =
    "relative z-10 w-fit rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
  const avatar = (
    <FeedUserAvatar
      src={user.avatar}
      name={user.name}
      size={compact ? "small" : "large"}
    />
  )

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {profileHref ? (
        <Link
          href={profileHref}
          aria-label={`Ver perfil de ${user.name}`}
          className={profileLinkClass}
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      <div className="min-w-0">
        {profileHref ? (
          <Link
            href={profileHref}
            className={cn(
              profileLinkClass,
              "block max-w-full text-sm leading-5 font-semibold [overflow-wrap:anywhere]"
            )}
          >
            {user.name}
          </Link>
        ) : (
          <p className="text-sm leading-5 font-semibold [overflow-wrap:anywhere]">
            {user.name}
          </p>
        )}
        {technologies.length > 0 && (
          <TechnologyIconList
            technologies={technologies}
            ownerName={user.name}
            className={compact ? "mt-1 gap-2" : "mt-1.5"}
          />
        )}
      </div>
    </div>
  )
}
