import { Bell } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

import { feedNotifications } from "@/lib/feed/mock-data"

export function NotificationMenu() {
  return (
    <Popover>
      <PopoverTrigger className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        <Bell aria-hidden="true" className="size-5" />
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
        />
        <span className="sr-only">Abrir notificações</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="max-h-[min(32rem,var(--available-height))] w-[22rem] max-w-[calc(100vw-2rem)] overflow-y-auto p-4"
      >
        <PopoverHeader>
          <PopoverTitle>Notificações</PopoverTitle>
          <PopoverDescription>
            Acompanhe as interações com suas publicações.
          </PopoverDescription>
        </PopoverHeader>

        <ul className="-mx-2 space-y-1">
          {feedNotifications.map((notification) => (
            <li
              key={notification.id}
              className={`flex gap-3 rounded-lg px-2 py-2.5 ${
                notification.unread ? "bg-accent/60" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 size-2 shrink-0 rounded-full ${
                  notification.unread ? "bg-primary" : "bg-transparent"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm leading-5 font-medium">
                  {notification.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {notification.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
