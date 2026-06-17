import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang, useUI } from '../i18n.jsx'
import { sfx, speak } from '../sound.js'

// ─────────────────────────────────────────────────────────────────────────────
// MOTEUR « grille + déplacements ». Brique réutilisable (base mTiny).
// Trois modes, du plus simple au plus complet :
//   mode 'direct'  : chaque flèche déplace le héros TOUT DE SUITE (cause→effet).
//   mode 'program' : on range une suite de flèches puis on appuie sur Go (défaut).
//   option hint    : des empreintes 🐾 montrent le chemin à reproduire (guidé).
// ─────────────────────────────────────────────────────────────────────────────

const MOVES = {
  up: { dr: -1, dc: 0, glyph: '⬆️', label: { fr: 'Monte', en: 'Up' } },
  down: { dr: 1, dc: 0, glyph: '⬇️', label: { fr: 'Descend', en: 'Down' } },
  left: { dr: 0, dc: -1, glyph: '⬅️', label: { fr: 'Gauche', en: 'Left' } },
  right: { dr: 0, dc: 1, glyph: '➡️', label: { fr: 'Droite', en: 'Right' } },
}

// Niveaux : du plus facile (0 = un seul pas) au plus difficile.
const LEVELS = {
  0: { cols: 3, rows: 1, start: [0, 0], goal: [0, 1], walls: [] }, // 1 pas
  1: { cols: 4, rows: 3, start: [2, 0], goal: [2, 3], walls: [] },
  2: { cols: 4, rows: 4, start: [3, 0], goal: [0, 0], walls: [] },
  3: { cols: 4, rows: 4, start: [3, 0], goal: [0, 3], walls: [] },
  4: { cols: 5, rows: 4, start: [3, 0], goal: [0, 4], walls: [] },
  5: { cols: 5, rows: 5, start: [4, 0], goal: [0, 4], walls: [[2, 2]] },
  6: { cols: 5, rows: 5, start: [4, 2], goal: [0, 2], walls: [[2, 1], [2, 3]] },
  7: { cols: 6, rows: 5, start: [4, 0], goal: [0, 5], walls: [[2, 2], [3, 3]] },
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1]

// Chemin simple en L (vertical puis horizontal) pour les empreintes du mode guidé.
function hintPath(start, goal) {
  const cells = []
  let [r, c] = start
  while (r !== goal[0]) { r += goal[0] > r ? 1 : -1; cells.push([r, c]) }
  while (c !== goal[1]) { c += goal[1] > c ? 1 : -1; cells.push([r, c]) }
  return cells.slice(0, -1) // sans la case du but
}

export default function DogGrid({ config = {} }) {
  const { lang, t } = useLang()
  const ui = useUI()
  const level = typeof config.level === 'object' ? config.level : (LEVELS[config.level] || LEVELS[1])
  const hero = config.hero || '🐶'
  const goalGlyph = config.goal || '🦴'
  const showCoords = !!config.showCoords
  const direct = config.mode === 'direct'
  const footprints = useMemo(() => (config.hint ? hintPath(level.start, level.goal) : []), [config.hint, level])

  const [program, setProgram] = useState([])
  const [pos, setPos] = useState(level.start)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('idle') // idle | win | fail
  const timer = useRef(null)
  const posRef = useRef(level.start) // suit la position pour les appuis rapides (mode direct)

  useEffect(() => {
    reset()
    return () => clearInterval(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.level, config.mode])

  function reset() {
    clearInterval(timer.current)
    posRef.current = level.start
    setProgram([])
    setPos(level.start)
    setRunning(false)
    setStatus('idle')
  }

  const isWall = (r, c) => level.walls.some((w) => same(w, [r, c]))
  const inGrid = (r, c) => r >= 0 && c >= 0 && r < level.rows && c < level.cols

  // ── Mode direct : on bouge tout de suite ───────────────────────────────────
  // posRef évite la fermeture obsolète si l'enfant appuie vite (comme mTiny).
  function step(key) {
    if (status === 'win') return
    const m = MOVES[key]
    const p = posRef.current
    const next = [p[0] + m.dr, p[1] + m.dc]
    if (!inGrid(next[0], next[1]) || isWall(next[0], next[1])) { sfx.fail(); return }
    posRef.current = next
    sfx.step()
    setPos(next)
    if (same(next, level.goal)) { setStatus('win'); sfx.win(); speak(t({ fr: 'Bravo !', en: 'Well done!' }), lang) }
  }

  // ── Mode programme : on range les flèches puis Go ──────────────────────────
  function addMove(key) {
    if (running) return
    sfx.tap()
    setStatus('idle')
    setPos(level.start)
    setProgram((p) => (p.length >= 10 ? p : [...p, key]))
  }
  function removeAt(i) {
    if (running) return
    setProgram((p) => p.filter((_, idx) => idx !== i))
  }
  function run() {
    if (running || program.length === 0) return
    setRunning(true)
    setStatus('idle')
    let cur = [...level.start]
    setPos(cur)
    let i = 0
    timer.current = setInterval(() => {
      if (i >= program.length) {
        clearInterval(timer.current)
        setRunning(false)
        const won = same(cur, level.goal)
        setStatus(won ? 'win' : 'fail')
        if (won) { sfx.win(); speak(t({ fr: 'Bravo !', en: 'Well done!' }), lang) }
        else sfx.fail()
        return
      }
      const m = MOVES[program[i]]
      const next = [cur[0] + m.dr, cur[1] + m.dc]
      if (!inGrid(next[0], next[1]) || isWall(next[0], next[1])) {
        clearInterval(timer.current); setRunning(false); setStatus('fail'); sfx.fail(); return
      }
      cur = next
      setPos(cur)
      sfx.step()
      i += 1
    }, 650)
  }

  const isFootprint = (r, c) => footprints.some((p) => same(p, [r, c]))

  // ── Rendu ──────────────────────────────────────────────────────────────────
  const cell = 'clamp(44px, 11vw, 76px)'
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Grille */}
      <div
        className="rounded-3xl bg-green-50 p-3 shadow-inner ring-4 ring-green-200"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${level.cols}, ${cell})`, gap: 6 }}
      >
        {Array.from({ length: level.rows }).map((_, r) =>
          Array.from({ length: level.cols }).map((__, c) => {
            const here = same([r, c], pos)
            const goal = same([r, c], level.goal)
            const wall = isWall(r, c)
            return (
              <div
                key={`${r}-${c}`}
                className={`relative flex items-center justify-center rounded-xl text-3xl transition-all duration-300 ${
                  wall ? 'bg-stone-400' : 'bg-white'
                } ${here ? 'ring-4 ring-amber-400' : 'ring-1 ring-green-200'}`}
                style={{ width: cell, height: cell }}
              >
                {showCoords && (
                  <span className="absolute left-1 top-0.5 text-[10px] text-stone-300">{c + 1}-{r + 1}</span>
                )}
                {!here && !goal && !wall && isFootprint(r, c) && <span className="opacity-30">🐾</span>}
                {wall && '🧱'}
                {goal && !here && goalGlyph}
                {here && <span className="drop-shadow">{status === 'fail' ? '😟' : hero}</span>}
              </div>
            )
          })
        )}
      </div>

      {/* Bandeau d'état */}
      <div className="h-8 text-center text-xl font-bold">
        {status === 'win' && <span className="text-green-600">{ui('win')}</span>}
        {status === 'fail' && <span className="text-rose-500">{ui('tryAgain')}</span>}
        {status === 'idle' && !running && (
          <span className="text-stone-400">{direct ? t({ fr: 'Appuie sur une flèche', en: 'Press an arrow' }) : ui('buildProgram')}</span>
        )}
      </div>

      {/* Programme (mode programme seulement) */}
      {!direct && (
        <div className="flex min-h-[60px] w-full max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl bg-violet-50 p-3 ring-2 ring-violet-200">
          {program.length === 0 && <span className="text-3xl opacity-30">➕</span>}
          {program.map((k, i) => (
            <button
              key={i}
              onClick={() => removeAt(i)}
              disabled={running}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow ring-2 ring-violet-200 transition hover:bg-rose-50 active:scale-90"
              title={t(MOVES[k].label)}
            >{MOVES[k].glyph}</button>
          ))}
        </div>
      )}

      {/* Palette des flèches */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(MOVES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => (direct ? step(key) : addMove(key))}
            disabled={running}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500 text-3xl text-white shadow-lg transition hover:bg-violet-600 active:scale-90 disabled:opacity-40"
            aria-label={t(m.label)}
          >{m.glyph}</button>
        ))}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3">
        {!direct && (
          <button
            onClick={run}
            disabled={running || program.length === 0}
            className="rounded-full bg-green-500 px-8 py-3 text-2xl font-extrabold text-white shadow-lg transition hover:bg-green-600 active:scale-95 disabled:opacity-40"
          >▶ {ui('run')}</button>
        )}
        <button
          onClick={reset}
          disabled={running}
          className="rounded-full bg-stone-200 px-6 py-3 text-xl font-bold text-stone-700 shadow transition hover:bg-stone-300 active:scale-95 disabled:opacity-40"
        >↺ {ui('reset')}</button>
      </div>
    </div>
  )
}
