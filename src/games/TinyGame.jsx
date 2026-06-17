import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n.jsx'
import { sfx, speak } from '../sound.js'

// Jeux « tout-petits » (3 ans). Règle d'or : UN seul toucher, récompense
// immédiate, jamais d'échec, pas de séquence ni de comptage. Une variante par
// thème :
//   pop      : toucher les animaux qui apparaissent (souris / clic)
//   stamp    : toucher pour poser des tampons rigolos (dessin)
//   keys     : le piano des animaux — toucher = voir + entendre (clavier)
//   scribble : le doigt magique — dessiner en arc-en-ciel (Paint)
//   tapwalk  : toucher pour faire avancer le chien vers l'os (algorithme)
//   dance    : faire bouger le personnage (ScratchJr)

export default function TinyGame({ variant = 'pop', config = {} }) {
  switch (variant) {
    case 'stamp': return <Stamp />
    case 'keys': return <Keys />
    case 'scribble': return <Scribble />
    case 'tapwalk': return <TapWalk />
    case 'dance': return <Dance config={config} />
    case 'pop':
    default: return <Pop />
  }
}

const rnd = (a) => a[Math.floor(Math.random() * a.length)]

// ── Pop : toucher les animaux qui apparaissent ───────────────────────────────
function Pop() {
  const { t } = useLang()
  const FACES = ['🐶', '🐱', '🐰', '🦊', '🐸', '🐵', '🐥', '🦋', '⭐', '🎈']
  const spawn = () => ({ id: Math.random(), x: 8 + Math.random() * 80, y: 10 + Math.random() * 75, e: rnd(FACES) })
  const [items, setItems] = useState(() => Array.from({ length: 4 }, spawn))
  const [popped, setPopped] = useState(0)

  function pop(id) {
    sfx.tap()
    setPopped((n) => n + 1)
    setItems((arr) => arr.map((it) => (it.id === id ? spawn() : it)))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-lg font-bold text-violet-600">{'⭐'.repeat(Math.min(popped, 10))}</div>
      <div className="relative h-80 w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-violet-100 ring-4 ring-violet-200">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => pop(it.id)}
            className="absolute text-5xl transition-transform hover:scale-110 active:scale-125"
            style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%,-50%)' }}
          >{it.e}</button>
        ))}
      </div>
      <p className="text-center text-stone-500">{t({ fr: 'Touche les animaux !', en: 'Tap the animals!' })}</p>
    </div>
  )
}

// ── Stamp : toucher pour poser des tampons ───────────────────────────────────
function Stamp() {
  const { t } = useLang()
  const STAMPS = ['⭐', '❤️', '🌸', '🦋', '🐱', '🌈', '🍎', '🚗', '🎈', '😀']
  const [marks, setMarks] = useState([])
  const area = useRef(null)

  function place(e) {
    const r = area.current.getBoundingClientRect()
    const pt = e.touches ? e.touches[0] : e
    const x = ((pt.clientX - r.left) / r.width) * 100
    const y = ((pt.clientY - r.top) / r.height) * 100
    sfx.tap()
    setMarks((m) => [...m, { id: Math.random(), x, y, e: rnd(STAMPS) }])
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={area}
        onClick={place}
        className="relative h-80 w-full max-w-xl cursor-pointer overflow-hidden rounded-3xl bg-white ring-4 ring-pink-200"
      >
        {marks.map((m) => (
          <span key={m.id} className="absolute text-4xl" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%,-50%)' }}>{m.e}</span>
        ))}
        {marks.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-stone-300">{t({ fr: 'Touche partout !', en: 'Tap anywhere!' })}</span>}
      </div>
      <button onClick={() => { setMarks([]); sfx.tap() }} className="rounded-full bg-rose-100 px-5 py-2 text-lg font-bold text-rose-600 shadow active:scale-95">
        🗑️ {t({ fr: 'Effacer', en: 'Clear' })}
      </button>
    </div>
  )
}

// ── Keys : le piano des animaux ──────────────────────────────────────────────
function Keys() {
  const { t, lang } = useLang()
  const ANIMALS = [
    { e: '🐶', fr: 'Chien', en: 'Dog', c: 'bg-red-400' },
    { e: '🐱', fr: 'Chat', en: 'Cat', c: 'bg-orange-400' },
    { e: '🐮', fr: 'Vache', en: 'Cow', c: 'bg-amber-400' },
    { e: '🐸', fr: 'Grenouille', en: 'Frog', c: 'bg-green-400' },
    { e: '🐥', fr: 'Poussin', en: 'Chick', c: 'bg-sky-400' },
    { e: '🐵', fr: 'Singe', en: 'Monkey', c: 'bg-violet-400' },
  ]
  const [big, setBig] = useState(null)

  function press(a) {
    setBig(a); sfx.tap(); speak(t({ fr: a.fr, en: a.en }), lang)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-violet-50 text-8xl ring-4 ring-violet-200">
        {big ? big.e : '🎹'}
      </div>
      <div className="text-xl font-bold text-violet-600">{big ? t({ fr: big.fr, en: big.en }) : ''}</div>
      <div className="flex flex-wrap justify-center gap-3">
        {ANIMALS.map((a) => (
          <button key={a.e} onClick={() => press(a)} className={`flex h-20 w-20 items-center justify-center rounded-2xl ${a.c} text-4xl shadow-lg transition hover:scale-105 active:scale-90`}>
            {a.e}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Scribble : le doigt magique (dessin arc-en-ciel) ─────────────────────────
function Scribble() {
  const { t } = useLang()
  const W = 640, H = 420
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const hue = useRef(0)

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H)
    ctx.lineCap = 'round'; ctx.lineWidth = 18
  }, [])

  function xy(e) {
    const r = canvasRef.current.getBoundingClientRect()
    const pt = e.touches ? e.touches[0] : e
    return { x: ((pt.clientX - r.left) / r.width) * W, y: ((pt.clientY - r.top) / r.height) * H }
  }
  function start(e) { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext('2d'); const p = xy(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
  function move(e) {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = xy(e)
    hue.current = (hue.current + 8) % 360
    ctx.strokeStyle = `hsl(${hue.current} 90% 55%)`
    ctx.lineTo(p.x, p.y); ctx.stroke()
  }
  function end() { drawing.current = false }
  function clear() { const ctx = canvasRef.current.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); sfx.tap() }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef} width={W} height={H}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        className="w-full max-w-2xl touch-none rounded-2xl bg-white shadow-inner ring-4 ring-rainbow ring-violet-200"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <button onClick={clear} className="rounded-full bg-rose-100 px-5 py-2 text-lg font-bold text-rose-600 shadow active:scale-95">
        🗑️ {t({ fr: 'Effacer', en: 'Clear' })}
      </button>
      <p className="text-center text-stone-500">{t({ fr: 'Glisse ton doigt pour dessiner !', en: 'Slide your finger to draw!' })}</p>
    </div>
  )
}

// ── TapWalk : toucher pour faire avancer le chien ────────────────────────────
function TapWalk() {
  const { t, lang } = useLang()
  const N = 5
  const [pos, setPos] = useState(0)
  const won = pos >= N

  function walk() {
    if (won) return
    sfx.step()
    const p = pos + 1
    setPos(p)
    if (p >= N) { sfx.win(); speak(t({ fr: 'Bravo !', en: 'Well done!' }), lang) }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-xl items-center gap-1 rounded-3xl bg-green-50 p-3 ring-4 ring-green-200">
        {Array.from({ length: N + 1 }).map((_, i) => (
          <div key={i} className="flex h-16 flex-1 items-center justify-center rounded-xl bg-white text-3xl ring-1 ring-green-200">
            {i === pos ? '🐶' : i === N ? '🦴' : ''}
          </div>
        ))}
      </div>
      {!won ? (
        <button onClick={walk} className="rounded-full bg-violet-500 px-10 py-4 text-2xl font-extrabold text-white shadow-lg transition hover:bg-violet-600 active:scale-95">
          🐾 {t({ fr: 'Avance', en: 'Walk' })}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-extrabold text-green-600">{t({ fr: 'Bravo ! 🎉', en: 'Well done! 🎉' })}</div>
          <button onClick={() => setPos(0)} className="rounded-full bg-violet-500 px-6 py-2 text-lg font-bold text-white shadow active:scale-95">
            ↺ {t({ fr: 'Encore', en: 'Again' })}
          </button>
        </div>
      )}
      <p className="text-center text-stone-500">{t({ fr: 'Touche le bouton pour avancer le chien.', en: 'Tap the button to move the dog.' })}</p>
    </div>
  )
}

// ── Dance : faire bouger le personnage ───────────────────────────────────────
function Dance({ config }) {
  const { t, lang } = useLang()
  const hero = config.hero || '🐱'
  const [transform, setTransform] = useState('none')

  function act(kind) {
    sfx.tap()
    if (kind === 'jump') { setTransform('translateY(-40px)'); setTimeout(() => setTransform('none'), 350) }
    else if (kind === 'spin') { setTransform('rotate(360deg)'); setTimeout(() => setTransform('none'), 600) }
    else { setTransform('rotate(-20deg) scale(1.2)'); setTimeout(() => setTransform('rotate(20deg) scale(1.2)'), 150); setTimeout(() => setTransform('none'), 350) }
    speak(t({ fr: 'Youpi !', en: 'Yay!' }), lang)
  }

  const BTN = [
    { k: 'jump', e: '🦘', fr: 'Sauter', en: 'Jump', c: 'bg-purple-500' },
    { k: 'spin', e: '🌀', fr: 'Tourner', en: 'Spin', c: 'bg-blue-500' },
    { k: 'wiggle', e: '💃', fr: 'Danser', en: 'Dance', c: 'bg-pink-500' },
  ]
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-56 w-full max-w-xl items-center justify-center rounded-3xl bg-gradient-to-b from-sky-100 to-green-200 ring-4 ring-green-200">
        <span className="text-7xl transition-transform duration-300" style={{ transform }}>{hero}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {BTN.map((b) => (
          <button key={b.k} onClick={() => act(b.k)} className={`flex h-20 w-24 flex-col items-center justify-center rounded-2xl ${b.c} text-white shadow-lg transition hover:scale-105 active:scale-90`}>
            <span className="text-3xl">{b.e}</span>
            <span className="text-xs font-bold">{t({ fr: b.fr, en: b.en })}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-stone-500">{t({ fr: 'Touche un bouton pour le faire bouger !', en: 'Tap a button to make it move!' })}</p>
    </div>
  )
}
