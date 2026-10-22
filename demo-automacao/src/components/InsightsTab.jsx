import Icon from './Icon.jsx'
import { t } from '../i18n.js'
import FlowCanvas from './flow/FlowCanvas.jsx'
import { INSIGHTS_SUMMARY, NODE_STATS } from '../data/mockData.js'

// Igual ao Insights do app: painel "Automação" à esquerda e o próprio fluxo
// com quantos leads passaram por cada bloco.
// Abre enquadrando o coração do follow-up; o resto está a um zoom/arrasto de distância.
const INSIGHTS_FOCUS = ['n3', 'n4']

export default function InsightsTab({ canvas, onInteract, reducedMotion }) {
  const s = INSIGHTS_SUMMARY
  return (
    <div className="absolute inset-0 flex flex-col md:flex-row">
      <aside className="cdemo-scroll shrink-0 overflow-y-auto border-b border-line bg-bg md:w-[220px] md:border-b-0 md:border-r">
        <p className="hidden items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-fg md:flex">
          <Icon name="split" size={15} className="text-fg-muted" />
          {t.automation}
        </p>
        <div className="px-4 py-3 md:py-4">
          <p className="hidden text-xs font-semibold text-fg md:block">{t.pickTrigger}</p>
          <p className="mt-1.5 hidden text-[11px] leading-relaxed text-fg-muted md:block">
            {t.pickTriggerSub}
          </p>
          <div className="flex items-center justify-between rounded-md border border-line bg-panel px-2.5 py-1.5 md:mt-3">
            <span className="rounded bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium text-primary-soft">{s.trigger}</span>
            <Icon name="chevronDown" size={14} className="text-fg-subtle" />
          </div>

          <p className="mt-4 hidden text-[10px] font-semibold uppercase tracking-[0.4px] text-fg-muted md:block">{t.general} · {s.period}</p>
          <ul className="mt-2 grid grid-cols-4 gap-1.5 md:grid-cols-2 md:gap-2">
            {s.general.map((g) => (
              <li key={g.label} className="rounded-md border border-line bg-panel px-2 py-2 md:px-2.5">
                <p className="flex items-center gap-1 truncate text-[10px] text-fg-muted md:text-[11px]">
                  <Icon name={g.icon} size={11} className="hidden shrink-0 md:block" />
                  {g.label}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-primary-soft md:text-base">{g.value}</p>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden rounded-md border border-primary-muted bg-primary-subtle p-3 md:block">
            <p className="text-[11px] text-fg-muted">{s.highlight.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-fg">{s.highlight.value}</p>
            <p className="mt-0.5 text-[11px] text-success">{s.highlight.detail}</p>
          </div>
          <p className="mt-3 hidden text-[10px] text-fg-subtle md:block">{t.sample}</p>
        </div>
      </aside>

      <div className="relative min-h-0 flex-1">
        <FlowCanvas canvas={canvas} stats={NODE_STATS} focusNodes={INSIGHTS_FOCUS} onInteract={onInteract} reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}
