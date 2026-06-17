// Les 3 niveaux, définis une seule fois. Chaque activité est rangée dans l'un
// d'eux (par `a.lvl` explicite, sinon déduit de son type).
//   tot = novice    · un seul toucher, récompense immédiate (tout-petits)
//   beg = débutant  · premiers pas guidés (mode direct, empreintes)
//   pro = avancé    · l'activité complète du manuel

export const LEVELS = [
  { id: 'tot', emoji: '🌱', label: { fr: 'Novice', en: 'Novice' }, color: '#db2777', soft: 'bg-pink-100', text: 'text-pink-600', ring: 'ring-pink-300' },
  { id: 'beg', emoji: '🌟', label: { fr: 'Débutant', en: 'Beginner' }, color: '#d97706', soft: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300' },
  { id: 'pro', emoji: '🏆', label: { fr: 'Avancé', en: 'Advanced' }, color: '#16a34a', soft: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-300' },
]

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]))

// Range une activité dans son niveau.
export function levelOf(a) {
  if (a.lvl) return a.lvl
  if (a.age === 3 || a.type === 'tiny') return 'tot'
  if (a.type === 'arrow-pick') return 'beg'
  if (a.type === 'dog-grid' && (a.dog?.mode === 'direct' || a.dog?.hint)) return 'beg'
  return 'pro'
}
