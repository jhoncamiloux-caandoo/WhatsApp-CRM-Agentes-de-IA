import { useRef } from 'react'
import { SCRIPT } from '../i18n.js'
import { t } from '../i18n.js'
import auraMark from '../assets/aura-mark.svg'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'
import FlowCanvas from './flow/FlowCanvas.jsx'
import InsightsTab from './InsightsTab.jsx'
import ConversasTab from './ConversasTab.jsx'

const TABS = ['editor', 'insights', 'conversas'].map((id) => ({ id, label: t.tabs[id] }))

const PALETTE = [
  { icon: 'flag', color: '#7b9bff', label: t.palette[0] },
  { icon: 'whatsapp', color: '#25d366', label: t.palette[1] },
  { icon: 'sms', color: '#3dd68c', label: t.palette[2] },
  { icon: 'phone', color: '#60a5fa', label: t.palette[3] },
  { icon: 'instagram', color: '#f2667b', label: t.palette[4] },
  { icon: 'zap', color: '#f5a524', label: t.palette[5] },
  { icon: 'clock', color: '#fb923c', label: t.palette[6] },
  { icon: 'split', color: '#9289ff', label: t.palette[7] },
]

function IconButton({ label, children, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-emphasized hover:text-fg focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function TopBar({ name, status, activeTab, onTab, publishing }) {
  const tabRefs = useRef([])
  const active = status === SCRIPT.automation.publishedStatus

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === activeTab)
    let n = null
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length
    if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length
    if (n === null) return
    e.preventDefault()
    e.stopPropagation()
    onTab(TABS[n].id)
    tabRefs.current[n]?.focus()
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-bg px-3 py-2.5 md:flex-nowrap">
      <IconButton label={t.back}><Icon name="back" /></IconButton>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-fg">{name}</span>
          <Icon name="pencil" size={13} className="shrink-0 text-fg-subtle" />
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${active ? 'bg-success-subtle text-success' : 'bg-emphasized text-fg-muted'}`}>
            {status}
          </span>
        </div>
        <p className="text-[11px] text-fg-subtle">{active ? t.publishedNow : t.editedNow}</p>
      </div>

      <div role="tablist" aria-label={t.tabsLabel} onKeyDown={onKeyDown} className="order-last flex w-full shrink-0 rounded-lg border md:order-none md:w-auto border-line bg-panel p-0.5">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el }}
            role="tab"
            id={`cdemo-tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls="cdemo-tabpanel"
            tabIndex={activeTab === t.id ? 0 : -1}
            onClick={() => onTab(t.id)}
            className={`flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors md:flex-none focus-visible:outline-2 focus-visible:outline-primary ${activeTab === t.id ? 'bg-emphasized text-fg' : 'text-fg-subtle hover:text-fg'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="hidden 2xl:contents"><IconButton label={t.undo}><Icon name="undo" /></IconButton>
        <IconButton label={t.redo} disabled><Icon name="redo" /></IconButton></span>
        <button type="button" className="hidden h-8 rounded-md border border-line-strong px-3 sm:block text-xs font-medium text-fg-muted transition-colors hover:bg-emphasized focus-visible:outline-2 focus-visible:outline-primary">
          {t.save}
        </button>
        <motion.button
          type="button"
          animate={publishing ? { boxShadow: ['0 0 0 0 rgb(117 102 255 / .6)', '0 0 0 8px rgb(117 102 255 / 0)'] } : { boxShadow: '0 0 0 0 rgb(117 102 255 / 0)' }}
          transition={publishing ? { duration: 1.1, repeat: 2 } : { duration: 0.2 }}
          className="h-8 rounded-md bg-primary px-3.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {active ? t.published : t.publish}
        </motion.button>
      </div>
    </div>
  )
}

export default function CanvasShell({ automationName, canvas, status, fullCanvas, activeTab, onTab, onCanvasInteract, publishing, reducedMotion }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <TopBar name={automationName} status={status} activeTab={activeTab} onTab={onTab} publishing={publishing} />

      <div className="flex min-h-0 flex-1">
      <div id="cdemo-tabpanel" role="tabpanel" aria-labelledby={`cdemo-tab-${activeTab}`} className="relative min-h-0 min-w-0 flex-1 bg-bg">
        {activeTab === 'editor' && (
          <>
            <FlowCanvas canvas={canvas} onInteract={onCanvasInteract} reducedMotion={reducedMotion} />

            {/* Barra flutuante da Aura */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(420px,calc(100%-7rem))] -translate-x-1/2">
              <div className="flex items-center gap-2.5 rounded-xl border border-primary-muted bg-panel/95 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur">
                <img src={auraMark} width="20" height="20" alt="" className="rounded-full" />
                <span className="flex-1 truncate text-[13px] text-fg-subtle">{t.askAura}</span>
                <kbd className="rounded border border-line px-1.5 text-[10px] text-fg-subtle">⌘K</kbd>
              </div>
            </div>
          </>
        )}
        {activeTab === 'insights' && <InsightsTab canvas={fullCanvas} onInteract={onCanvasInteract} reducedMotion={reducedMotion} />}
        {activeTab === 'conversas' && <ConversasTab onInteract={onCanvasInteract} />}
      </div>

      {/* Paleta de blocos: coluna fixa à direita, como no editor do app (decorativa) */}
      {activeTab === 'editor' && (
        <div aria-hidden="true" className="hidden w-[52px] shrink-0 flex-col items-center gap-2 border-l border-line bg-bg py-3 md:flex">
          {PALETTE.map((p) => (
            <span key={p.label} className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel" style={{ color: p.color }}>
              <Icon name={p.icon} size={15} />
            </span>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
