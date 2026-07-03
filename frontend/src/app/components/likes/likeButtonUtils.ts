export function getNextLikeCount(
  currentCount: number,
  wasLiked: boolean,
  nowLiked: boolean,
): number {
  if (wasLiked === nowLiked) {
    return currentCount;
  }

  if (nowLiked) {
    return currentCount + 1;
  }

  return Math.max(currentCount - 1, 0);
}
