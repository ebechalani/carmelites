import { useState } from 'react'
import { LangProvider, useLang, useUI } from './i18n.jsx'
import { CHAPTERS, findChapter } from './data/curriculum.js'
import LangToggle from './components/LangToggle.jsx'
import SpeakButton from './components/SpeakButton.jsx'
import ActivityModal from './components/ActivityModal.jsx'
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
      <LangToggle />
    </header>
  )
}

function Home({ onOpenChapter }) {
  const { t } = useLang()
  const ui = useUI()
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-center text-3xl font-extrabold text-stone-700">
        {ui('chapters')} 📚
      </h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => { sfx.tap(); onOpenChapter(ch.id) }}
            className="group flex flex-col items-start gap-3 rounded-3xl bg-white p-6 text-left shadow-lg ring-2 ring-transparent transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-inner"
              style={{ backgroundColor: ch.color + '22' }}
            >
              {ch.emoji}
            </div>
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: ch.color }}>
              {ui('chapter')} {i + 1} · {ch.tool}
            </div>
            <div className="text-xl font-extrabold text-stone-800">{t(ch.title)}</div>
            <div className="text-sm text-stone-400">
              {ch.sessions.length} {ui('sessions')}
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}

function ChapterView({ chapterId, onOpenActivity }) {
  const { t } = useLang()
  const ui = useUI()
  const ch = findChapter(chapterId)
  const [teacherFor, setTeacherFor] = useState(null)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: ch.color + '22' }}
        >
          {ch.emoji}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: ch.color }}>
            {ch.tool}
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">{t(ch.title)}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {ch.sessions.map((s, i) => (
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {s.activities.map((a) => {
                const playable = a.type !== 'info'
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl border-2 border-stone-100 bg-stone-50 p-3 transition hover:border-violet-200 hover:bg-violet-50"
                  >
                    <button
                      onClick={() => { sfx.tap(); onOpenActivity(a) }}
                      className="flex flex-1 items-center gap-3 text-left active:scale-95"
                    >
                      <span className="text-3xl">{a.emoji}</span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{t(a.title)}</span>
                          {a.age === 3 && (
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-bold text-pink-600">👶 3 {t({ fr: 'ans', en: 'yo' })}</span>
                          )}
                        </span>
                        <span
                          className={`text-xs font-bold ${playable ? 'text-green-600' : 'text-stone-400'}`}
                        >
                          {playable ? `▶ ${ui('play')}` : `👀 ${t({ fr: 'À découvrir', en: 'Discover' })}`}
                        </span>
                      </span>
                    </button>
                    <SpeakButton text={`${t(a.title)}. ${t(a.desc)}`} className="h-10 w-10 text-xl" />
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function Shell() {
  const ui = useUI()
  const [chapterId, setChapterId] = useState(null)
  const [activity, setActivity] = useState(null)

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
        <ChapterView chapterId={chapterId} onOpenActivity={setActivity} />
      ) : (
        <Home onOpenChapter={setChapterId} />
      )}

      {activity && <ActivityModal activity={activity} onClose={() => setActivity(null)} />}
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
