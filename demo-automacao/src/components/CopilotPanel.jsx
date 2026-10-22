import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { t } from '../i18n.js'
import auraMark from '../assets/aura-mark.svg'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon.jsx'
import { NODE_META } from '../data/nodeTypes.js'
import { getStepView } from '../hooks/usePlayer.js'

const enter = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: 'easeOut' } }

function AuraMark({ size = 24 }) {
  return <img src={auraMark} width={size} height={size} alt="" className="shrink-0 rounded-full" />
}

function ControlButton({ label, onClick, disabled, children, pressed, className = '' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 min-w-8 place-items-center rounded-md border border-line bg-panel px-2 text-fg-muted transition-colors hover:bg-emphasized hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}

function StepList({ steps, index, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }}>
      <ControlButton label={t.stepList} onClick={() => setOpen((o) => !o)} pressed={open}>
        <Icon name="list" />
      </ControlButton>
      <AnimatePresence>
        {open && (
          <motion.ol
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            aria-label={t.steps}
            className="absolute right-0 top-10 z-30 w-72 rounded-[10px] border border-line bg-panel p-1.5 shadow-2xl shadow-black/50"
          >
            {steps.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => { onSelect(i); setOpen(false) }}
                  className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-emphasized focus-visible:outline-2 focus-visible:outline-primary ${i === index ? 'bg-primary-subtle text-fg' : 'text-fg-muted'}`}
                >
                  <span className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${i < index ? 'bg-primary text-white' : i === index ? 'border border-primary text-primary-soft' : 'border border-line-strong text-fg-subtle'}`}>
                    {i < index ? <Icon name="check" size={11} strokeWidth={2.5} /> : i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MiniNode({ type }) {
  const meta = NODE_META[type]
  return (
    <div aria-hidden="true" className="w-[92px] shrink-0 rounded-md border border-line bg-bg-tint p-2">
      <div className="flex items-center gap-1.5">
        <span className="grid h-4 w-4 place-items-center rounded" style={{ color: meta.color, background: `${meta.color}22` }}>
          <Icon name={meta.icon} size={10} strokeWidth={2} />
        </span>
        <span className="h-1.5 flex-1 rounded-full bg-line-strong" />
      </div>
      <div className="mt-2 space-y-1">
        <span className="block h-1.5 w-full rounded-full bg-line" />
        <span className="block h-1.5 w-2/3 rounded-full bg-line" />
      </div>
      <div className="mt-2 flex justify-end">
        <span className="h-1.5 w-1.5 rounded-full border border-primary" />
      </div>
    </div>
  )
}

function ResultCard({ card, tab }) {
  return (
    <motion.div {...enter} className="ml-8 flex items-center gap-3 rounded-[10px] border border-line bg-panel p-2.5">
      <MiniNode type={card.nodeType} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-fg">{card.title}</p>
        <p className="mt-0.5 truncate text-xs text-fg-subtle">{card.detail}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
          <Icon name="check" size={11} strokeWidth={2.5} />
          {tab === 'insights' ? t.openInsights : tab === 'conversas' ? t.openConversas : t.readyCanvas}
        </span>
      </div>
    </motion.div>
  )
}

function Analyzing() {
  return (
    <motion.div {...enter} role="status" className="flex items-center gap-2 pl-8 text-[13px] text-fg-subtle">
      <span className="flex gap-1" aria-hidden="true">
        <span className="cdemo-dot h-1.5 w-1.5 rounded-full bg-primary-soft" />
        <span className="cdemo-dot h-1.5 w-1.5 rounded-full bg-primary-soft" />
        <span className="cdemo-dot h-1.5 w-1.5 rounded-full bg-primary-soft" />
      </span>
      {t.analyzing}
    </motion.div>
  )
}

function StepMessages({ step, view, showUser }) {
  return (
    <>
      {step.userMessage && showUser && (
        <motion.div {...enter} className="ml-auto max-w-[88%] rounded-[10px] rounded-br-sm bg-primary-subtle px-3.5 py-2.5 text-[13px] leading-relaxed text-fg">
          {step.userMessage}
        </motion.div>
      )}
      {view.analyzing && showUser !== false && <Analyzing />}
      {view.text && (
        <motion.div {...enter} className="flex gap-2.5">
          <AuraMark size={22} />
          <p className="pt-0.5 text-[13px] leading-relaxed text-fg">
            {view.text}
            {view.streaming && <span className="cdemo-caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-primary-soft" aria-hidden="true" />}
          </p>
        </motion.div>
      )}
      {view.resultVisible && step.resultCard && <ResultCard card={step.resultCard} tab={step.activeTab} />}
    </>
  )
}

const DONE_VIEW = { analyzing: false, streaming: false, resultVisible: true }

export default function CopilotPanel({ steps, player, reducedMotion }) {
  const { step, index, total, elapsed, timing, playing, started, finished, speed } = player
  const feedRef = useRef(null)
  const view = getStepView(step, timing, elapsed)
  const showUser = elapsed >= timing.userAt || reducedMotion

  // Mantém o feed rolado até a última mensagem sem rolar a página.
  useLayoutEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [index, view.text.length, view.resultVisible, view.analyzing, started])

  return (
    <aside aria-label={t.copilot} className="flex h-full min-h-0 flex-col border-line bg-bg lg:border-r">
      {/* Cabeçalho */}
      <header className="border-b border-line px-5 pb-4 pt-5">
        <div className="flex items-center gap-2 text-xs font-medium text-fg-subtle">
          <AuraMark size={18} />
          {t.copilotTag}
        </div>
        <div aria-live="polite">
          <h3 className="mt-3 text-[15px] font-semibold text-fg">{started ? step.title : t.idleTitle}</h3>
          <p className="mt-1 text-[13px] text-fg-muted">{started ? step.subtitle : t.idleSub}</p>
        </div>
      </header>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={player.toggle}
          aria-label={playing ? t.pauseLabel : finished ? t.replayLabel : t.playLabel}
          className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name={playing ? 'pause' : finished ? 'replay' : 'play'} size={14} />
          {playing ? t.pause : finished ? t.replay : t.play}
        </button>

        <div role="group" aria-label={t.speed} className="flex h-8 rounded-md border border-line bg-panel p-0.5">
          {[1, 5].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={speed === v}
              onClick={() => player.setSpeed(v)}
              className={`rounded px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${speed === v ? 'bg-emphasized text-fg' : 'text-fg-subtle hover:text-fg'}`}
            >
              {v}x
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ControlButton label={t.prev} onClick={player.prev} disabled={index === 0}><Icon name="prev" /></ControlButton>
          <span className="min-w-11 text-center text-xs tabular-nums text-fg-muted" aria-label={t.stepOf(index + 1, total)}>
            {index + 1} / {total}
          </span>
          <ControlButton label={t.next} onClick={player.next} disabled={index === total - 1}><Icon name="next" /></ControlButton>
          <StepList steps={steps} index={index} onSelect={player.goTo} />
        </div>
      </div>

      {/* Progresso do passo */}
      <div className="h-0.5 bg-line" aria-hidden="true">
        <div className="h-full bg-primary transition-[width] duration-100" style={{ width: started ? `${Math.min(100, (elapsed / timing.total) * 100)}%` : '0%' }} />
      </div>

      {/* Feed */}
      <div ref={feedRef} className="cdemo-scroll flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-5">
        {!started ? (
          <div className="m-auto max-w-64 text-center">
            <span className="mx-auto block w-fit"><AuraMark size={40} /></span>
            <p className="mt-3 text-[13px] text-fg-muted">
              {t.idleBody}
            </p>
          </div>
        ) : (
          <>
            {steps.slice(0, index).map((s) => (
              <StepMessages key={s.id} step={s} view={{ ...DONE_VIEW, text: s.aiMessage }} showUser />
            ))}
            <StepMessages key={step.id} step={step} view={view} showUser={showUser} />
          </>
        )}
      </div>
    </aside>
  )
}

