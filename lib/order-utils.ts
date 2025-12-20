export function computeOrderBetween(
  prev?: number | null,
  next?: number | null
) {
  if (prev == null && next == null) return 0;
  if (prev == null) return (next ?? 0) - 1;
  if (next == null) return prev + 1;
  if (prev === next) return prev + 1;
  return prev + (next - prev) / 2;
}
