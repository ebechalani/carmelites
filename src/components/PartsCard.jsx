import { useLang } from '../i18n.jsx'
import { sfx, speak } from '../sound.js'

// Fiche illustrée d'un kit (ex. les parties de mTiny). Chaque élément est une
// grande carte cliquable qui prononce son nom — pensé pour présenter le matériel
// au tableau à des non-lecteurs.
export default function PartsCard({ parts = [] }) {
  const { t, lang } = useLang()

  function say(p) {
    sfx.tap()
    speak(`${t(p.name)}. ${t(p.desc)}`, lang)
  }

  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
      {parts.map((p, i) => (
        <button
          key={i}
          onClick={() => say(p)}
          className="flex items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-md ring-4 transition hover:scale-[1.02] active:scale-95"
          style={{ '--tw-ring-color': p.color }}
        >
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl shadow-inner"
            style={{ backgroundColor: p.color + '22' }}
          >
            {p.emoji}
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-stone-800">{t(p.name)}</span>
              <span className="text-xl">🔊</span>
            </span>
            <span className="block text-sm text-stone-500">{t(p.desc)}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
