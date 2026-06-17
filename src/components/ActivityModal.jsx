import { useEffect } from 'react'
import { useLang, useUI } from '../i18n.jsx'
import SpeakButton from './SpeakButton.jsx'
import ComingSoon from './ComingSoon.jsx'
import DogGrid from '../games/DogGrid.jsx'
import ArrowPick from '../games/ArrowPick.jsx'
import TinyGame from '../games/TinyGame.jsx'
import MouseGame from '../games/MouseGame.jsx'
import KeyboardGame from '../games/KeyboardGame.jsx'
import PaintStudio from '../games/PaintStudio.jsx'
import PuzzleGame from '../games/PuzzleGame.jsx'
import ScratchBlocks from '../games/ScratchBlocks.jsx'

export default function ActivityModal({ activity, onClose }) {
  const { t } = useLang()
  const ui = useUI()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!activity) return null
  const title = t(activity.title)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">{activity.emoji}</span>
          <h2 className="flex-1 text-2xl font-extrabold text-stone-800">{title}</h2>
          <SpeakButton text={`${title}. ${t(activity.desc)}`} />
          <button
            onClick={onClose}
            aria-label={ui('close')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl shadow transition hover:bg-rose-100 active:scale-90"
          >
            ✕
          </button>
        </div>

        {activity.type === 'tiny' ? (
          <TinyGame variant={activity.variant} config={activity.tiny} />
        ) : activity.type === 'dog-grid' ? (
          <DogGrid config={activity.dog} />
        ) : activity.type === 'arrow-pick' ? (
          <ArrowPick config={activity.dog} />
        ) : activity.type === 'mouse' ? (
          <MouseGame variant={activity.variant} config={activity} />
        ) : activity.type === 'keyboard' ? (
          <KeyboardGame variant={activity.variant} config={activity.kb} />
        ) : activity.type === 'paint' ? (
          <PaintStudio activity={activity} />
        ) : activity.type === 'puzzle' ? (
          <PuzzleGame variant={activity.variant} />
        ) : activity.type === 'scratch' ? (
          <ScratchBlocks config={activity.sc} />
        ) : (
          <ComingSoon activity={activity} />
        )}
      </div>
    </div>
  )
}
