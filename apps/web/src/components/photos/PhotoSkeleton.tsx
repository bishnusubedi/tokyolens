export function PhotoSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="masonry-item rounded-lg bg-muted animate-pulse"
      style={{ height }}
    />
  )
}

export function PhotoGridSkeleton() {
  const heights = [240, 320, 200, 280, 360, 220, 300, 260, 340, 190, 310, 250]
  return (
    <div className="masonry">
      {heights.map((h, i) => (
        <PhotoSkeleton key={i} height={h} />
      ))}
    </div>
  )
}
