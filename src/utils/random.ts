export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomItemExcept<T extends { id: string }>(
  items: T[],
  currentId?: string
): T {
  if (items.length <= 1) {
    return items[0];
  }

  let next = randomItem(items);
  while (next.id === currentId) {
    next = randomItem(items);
  }

  return next;
}
