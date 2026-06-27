import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@fispqs_pdf_favorites';

export async function loadFavorites(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export async function saveFavorites(favorites: Set<string>): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

export function toggleFavoriteSync(name: string, current: Set<string>): Set<string> {
  const next = new Set(current);
  if (next.has(name)) {
    next.delete(name);
  } else {
    next.add(name);
  }
  return next;
}

export async function toggleFavorite(
  name: string,
  current: Set<string>,
): Promise<Set<string>> {
  const next = toggleFavoriteSync(name, current);
  await saveFavorites(next);
  return next;
}
