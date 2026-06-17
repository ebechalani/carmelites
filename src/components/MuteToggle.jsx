import { useState } from 'react'
import { isMuted, setMuted } from '../sound.js'

// Coupe-son pour la classe : 🔊 / 🔇 (mémorisé).
export default function MuteToggle() {
  const [muted, setM] = useState(() => isMuted())
  function toggle() {
    const v = !muted
    setMuted(v)
    setM(v)
  }
  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Activer le son' : 'Couper le son'}
      title={muted ? 'Activer le son' : 'Couper le son'}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-xl shadow ring-2 ring-violet-200 transition hover:bg-white active:scale-95"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
