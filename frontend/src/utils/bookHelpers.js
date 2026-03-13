export const COVER_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-green-600',
];

export function hashTitle(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function getCoverColor(title) {
  return COVER_COLORS[hashTitle(title) % COVER_COLORS.length];
}

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Sci-Fi',
  'Fantasy',
  'Mystery',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Self-Help',
  'Uncategorized',
];
