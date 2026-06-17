import { useState } from 'react'
import { LangProvider, useLang, useUI } from './i18n.jsx'
import { CHAPTERS, findChapter } from './data/curriculum.js'
import { LEVELS, LEVEL_BY_ID, levelOf } from './data/levels.js'
import { loadDone, saveDone, doneInChapter, totalInChapter } from './data/progress.js'
import LangToggle from './components/LangToggle.jsx'
import MuteToggle from './components/MuteToggle.jsx'
import SpeakButton from './components/SpeakButton.jsx'
import ActivityModal from './components/ActivityModal.jsx'
import Celebration from './components/Celebration.jsx'
import { sfx } from './sound.js'

function Header({ onHome }) {
  const ui = useUI()
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-8">
      <button onClick={onHome} className="flex items-center gap-2 text-left active:scale-95">
        <span className="text-3xl">🎒</span>
        <div className="leading-tight">
          <div className="text-lg font-extrabold text-violet-700">{ui('appTitle')}</div>
          <div className="text-xs text-stone-500">{ui('appSubtitle')}</div>
        </div>
      </button>
      <div className="flex-1" />
      <MuteToggle />
      <LangToggle />
    </header>
  )
}

function Home({ onOpenChapter, done }) {
  const { t } = useLang()
  const ui = useUI()
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-center text-3xl font-extrabold text-stone-700">
        {ui('chapters')} 📚
      </h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((ch, i) => {
          const total = totalInChapter(ch)
          const d = doneInChapter(done, ch.id)
          const complete = d >= total
          return (
            <button
              key={ch.id}
              onClick={() => { sfx.tap(); onOpenChapter(ch.id) }}
              className="group flex flex-col items-start gap-3 rounded-3xl bg-white p-6 text-left shadow-lg ring-2 ring-transparent transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-inner"
                  style={{ backgroundColor: ch.color + '22' }}
                >
                  {ch.emoji}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${complete ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {complete ? '✓ ' : ''}{d}/{total}
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: ch.color }}>
                {ui('chapter')} {i + 1} · {ch.tool}
              </div>
              <div className="text-xl font-extrabold text-stone-800">{t(ch.title)}</div>
              <div className="text-sm text-stone-400">
                {ch.sessions.length} {ui('sessions')}
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}

// Petite pastille de niveau (👶 3 ans / 🧒 Débutant / 🧑 Grand).
function LevelBadge({ id }) {
  const { t } = useLang()
  const l = LEVEL_BY_ID[id]
  if (!l) return null
  return (
    <span className={`rounded-full ${l.soft} ${l.text} px-2 py-0.5 text-[11px] font-bold`}>
      {l.emoji} {t(l.label)}
    </span>
  )
}

// Filtre par niveau, en haut du chapitre.
function LevelFilter({ value, onChange }) {
  const { t } = useLang()
  const Btn = ({ id, emoji, label }) => {
    const active = value === id
    const l = id !== 'all' ? LEVEL_BY_ID[id] : null
    return (
      <button
        onClick={() => onChange(id)}
        className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ring-2 transition active:scale-95 ${
          active
            ? l ? `${l.soft} ${l.text} ${l.ring}` : 'bg-violet-100 text-violet-700 ring-violet-300'
            : 'bg-white text-stone-500 ring-stone-200 hover:bg-stone-50'
        }`}
      >
        {emoji} {label}
      </button>
    )
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-bold text-stone-500">{t({ fr: 'Niveau :', en: 'Level:' })}</span>
      <Btn id="all" emoji="🌈" label={t({ fr: 'Tous', en: 'All' })} />
      {LEVELS.map((l) => (
        <Btn key={l.id} id={l.id} emoji={l.emoji} label={t(l.label)} />
      ))}
    </div>
  )
}

function ChapterView({ chapterId, onOpenActivity, done, markDone, onClearProgress }) {
  const { t } = useLang()
  const ui = useUI()
  const ch = findChapter(chapterId)
  const [teacherFor, setTeacherFor] = useState(null)
  const [level, setLevel] = useState('all')

  // niveaux à afficher selon le filtre
  const shownLevels = level === 'all' ? LEVELS.map((l) => l.id) : [level]
  const total = totalInChapter(ch)
  const d = doneInChapter(done, ch.id)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: ch.color + '22' }}
        >
          {ch.emoji}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: ch.color }}>
            {ch.tool}
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">{t(ch.title)}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${d >= total ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
            {d >= total ? '✓ ' : ''}{d}/{total}
          </span>
          {d > 0 && (
            <button onClick={onClearProgress} className="text-xs font-bold text-stone-400 underline transition hover:text-rose-500">
              ↺ {t({ fr: 'remettre à zéro', en: 'reset' })}
            </button>
          )}
        </div>
      </div>

      <LevelFilter value={level} onChange={setLevel} />

      <div className="flex flex-col gap-6">
        {ch.sessions.map((s, i) => {
          // activités groupées par niveau, dans l'ordre 3 ans → débutant → grand
          const groups = shownLevels
            .map((lvl) => ({ lvl, acts: s.activities.filter((a) => levelOf(a) === lvl) }))
            .filter((g) => g.acts.length > 0)
          if (groups.length === 0) return null // séance vide pour ce filtre

          return (
            <section key={s.id} className="rounded-3xl bg-white p-5 shadow-md sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-base font-extrabold text-white"
                  style={{ backgroundColor: ch.color }}
                >
                  {i + 1}
                </span>
                <h2 className="flex-1 text-xl font-extrabold text-stone-800">{t(s.title)}</h2>
                <button
                  onClick={() => setTeacherFor(teacherFor === s.id ? null : s.id)}
                  className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-bold text-stone-600 transition hover:bg-stone-200 active:scale-95"
                >
                  👩‍🏫 {ui('teacherView')}
                </button>
              </div>

              {teacherFor === s.id && (
                <div className="mb-4 rounded-2xl bg-amber-50 p-4 ring-2 ring-amber-200">
                  <div className="mb-1 text-sm font-bold uppercase tracking-wide text-amber-700">
                    {ui('objectives')}
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-stone-700">
                    {t(s.objectives).map((o, k) => (
                      <li key={k}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* un bloc par niveau présent dans la séance */}
              <div className="flex flex-col gap-4">
                {groups.map(({ lvl, acts }) => {
                  const l = LEVEL_BY_ID[lvl]
                  return (
                    <div key={lvl}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-0.5 w-4 rounded" style={{ backgroundColor: l.color }} />
                        <LevelBadge id={lvl} />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {acts.map((a) => {
                          const playable = a.type !== 'info'
                          const key = `${s.id}:${a.id}`
                          const isDone = done.has(key)
                          return (
                            <div
                              key={a.id}
                              className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition hover:bg-violet-50 ${isDone ? 'border-green-200 bg-green-50' : 'border-stone-100 bg-stone-50'}`}
                            >
                              <button
                                onClick={() => { sfx.tap(); markDone(key); onOpenActivity(a) }}
                                className="flex flex-1 items-center gap-3 text-left active:scale-95"
                              >
                                <span className="relative text-3xl">
                                  {a.emoji}
                                  {isDone && <span className="absolute -bottom-1 -right-1 text-sm">✅</span>}
                                </span>
                                <span className="flex-1">
                                  <span className="block font-bold text-stone-800">{t(a.title)}</span>
                                  <span className={`text-xs font-bold ${isDone ? 'text-green-600' : playable ? 'text-green-600' : 'text-stone-400'}`}>
                                    {isDone ? `✓ ${t({ fr: 'fait', en: 'done' })}` : playable ? `▶ ${ui('play')}` : `👀 ${t({ fr: 'À découvrir', en: 'Discover' })}`}
                                  </span>
                                </span>
                              </button>
                              <SpeakButton text={`${t(a.title)}. ${t(a.desc)}`} className="h-10 w-10 text-xl" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

function Shell() {
  const ui = useUI()
  const { t } = useLang()
  const [chapterId, setChapterId] = useState(null)
  const [activity, setActivity] = useState(null)
  const [done, setDone] = useState(() => loadDone())
  const [celebrate, setCelebrate] = useState(null) // chapitre qui vient d'être fini

  function markDone(key) {
    if (done.has(key)) return
    const next = new Set(done)
    next.add(key)
    saveDone(next)
    setDone(next)
    // fête si le chapitre vient d'atteindre 100 %
    const chId = key.split('-')[0] // "ch1-s1:a" → "ch1"
    const chapter = findChapter(chId)
    if (chapter && doneInChapter(next, chId) === totalInChapter(chapter)) {
      setCelebrate(chapter)
    }
  }
  function clearProgress() {
    const next = new Set()
    saveDone(next)
    setDone(next)
  }

  return (
    <div className="min-h-full pb-16">
      <Header onHome={() => { setChapterId(null); setActivity(null) }} />

      {chapterId && (
        <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-8">
          <button
            onClick={() => setChapterId(null)}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow ring-2 ring-stone-100 transition hover:bg-stone-50 active:scale-95"
          >
            ← {ui('home')}
          </button>
        </div>
      )}

      {chapterId ? (
        <ChapterView chapterId={chapterId} onOpenActivity={setActivity} done={done} markDone={markDone} onClearProgress={clearProgress} />
      ) : (
        <Home onOpenChapter={setChapterId} done={done} />
      )}

      {activity && <ActivityModal activity={activity} onClose={() => setActivity(null)} />}

      {celebrate && (
        <Celebration
          title={`${t({ fr: 'Chapitre terminé !', en: 'Chapter complete!' })} ${t(celebrate.title)}`}
          onDone={() => setCelebrate(null)}
        />
      )}

      <footer className="mt-10 px-4 pb-6 text-center text-xs text-stone-400">
        <div className="font-bold text-stone-500">Numérique au Carmel</div>
        <div>© {new Date().getFullYear()} · {ui('siteBy')} <span className="font-bold text-violet-500">Eddy Bachaalany</span></div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}
