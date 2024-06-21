import type { Place } from '@/interfaces/place';

export function getTags(places: Pick<Place, 'tags'>[]): string[] {
  const set = new Set<string>();
  for (const place of places) {
    for (const tag of place.tags) {
      set.add(tag);
    }
  }

  const entries = Array.from(set);
  entries.sort((a, b) => a.localeCompare(b));

  return entries;
}
