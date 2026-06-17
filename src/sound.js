// Sons et voix — pensés pour des non-lecteurs.
// Aucune dépendance : Web Audio pour les bips, SpeechSynthesis pour la voix.

// Coupe-son global (mémorisé), pour la classe. sfx + speak le respectent.
let muted = false
try { muted = localStorage.getItem('carmel-muted') === '1' } catch { /* ignore */ }
export function isMuted() { return muted }
export function setMuted(v) {
  muted = !!v
  try { localStorage.setItem('carmel-muted', muted ? '1' : '0') } catch { /* ignore */ }
  if (muted && typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
}

let audioCtx = null
function ctx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  return audioCtx
}

function tone(freq, start, duration, type = 'sine', gain = 0.15) {
  if (muted) return
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ac.destination)
  const t0 = ac.currentTime + start
  osc.start(t0)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.stop(t0 + duration)
}

export const sfx = {
  tap() { tone(520, 0, 0.12, 'triangle') },
  step() { tone(440, 0, 0.1, 'sine') },
  win() {
    tone(523, 0, 0.18, 'triangle')
    tone(659, 0.16, 0.18, 'triangle')
    tone(784, 0.32, 0.28, 'triangle')
  },
  fail() {
    tone(300, 0, 0.18, 'sawtooth', 0.1)
    tone(220, 0.18, 0.26, 'sawtooth', 0.1)
  },
}

// La liste des voix se charge de façon asynchrone : au premier appel elle est
// souvent vide. On la met en cache et on la rafraîchit via 'voiceschanged'.
let voicesCache = []
function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  voicesCache = window.speechSynthesis.getVoices() || []
  return voicesCache
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
}

// Choisit une vraie voix de la bonne langue. Sans ça, le navigateur garde sa
// voix par défaut (souvent anglaise) qui lit le français avec l'accent anglais.
function pickVoice(lang) {
  const voices = voicesCache.length ? voicesCache : loadVoices()
  const prefix = lang === 'fr' ? 'fr' : 'en'
  const byLang = (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
  // on privilégie une voix "locale" (installée sur la machine), plus naturelle
  return voices.find((v) => byLang(v) && v.localService) || voices.find(byLang) || null
}

// Lit un texte à voix haute dans la bonne langue. Utilisé par le bouton 🔊.
export function speak(text, lang = 'fr') {
  if (muted) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'fr' ? 'fr-FR' : 'en-US'
    const v = pickVoice(lang)
    if (v) u.voice = v
    u.rate = 0.9
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  } catch {
    /* la synthèse vocale n'est pas disponible partout — on ignore */
  }
}
