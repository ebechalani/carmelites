import { useEffect, useMemo } from 'react'
import { sfx } from '../sound.js'

const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

// Fête de fin de chapitre : confettis + bandeau, disparaît tout seul.
export default function Celebration({ title, onDone }) {
  // confettis générés une seule fois
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
      })),
    []
  )

  useEffect(() => {
    sfx.win()
    const id = setTimeout(onDone, 3600)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" onClick={onDone}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
      <div
        className="mx-4 rounded-3xl bg-white/95 px-8 py-6 text-center shadow-2xl ring-4 ring-amber-300"
        style={{ animation: 'pop-in 0.5s ease-out' }}
      >
        <div className="text-6xl">🎉🏆🎉</div>
        <div className="mt-2 text-2xl font-extrabold text-green-600">{title}</div>
      </div>
    </div>
  )
}
