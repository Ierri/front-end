export default function FeedLoading() {
  return (
    <main className="mx-auto w-full max-w-[1350px] px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6" aria-label="Carregando feed">
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-[32rem] animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </main>
  )
}
