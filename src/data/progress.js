// Suivi de progression, mémorisé dans le navigateur (localStorage).
// Une activité « faite » est repérée par la clé `${session.id}:${activity.id}`
// (ex. "ch1-s1:a"), unique car les identifiants de séance le sont.

const KEY = 'carmel-progress'

export function loadDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function saveDone(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    /* navigation privée ou stockage plein : on ignore */
  }
}

// Compte les activités faites d'un chapitre (les clés commencent par "<chId>-").
export function doneInChapter(done, chapterId) {
  let n = 0
  for (const k of done) if (k.startsWith(chapterId + '-')) n += 1
  return n
}

// Nombre total d'activités d'un chapitre.
export function totalInChapter(chapter) {
  return chapter.sessions.reduce((sum, s) => sum + s.activities.length, 0)
}
