import { memo } from 'react'
import { LOCALE, t } from '../../i18n.js'
import auraMark from '../../assets/aura-mark.svg'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'
import Icon from '../Icon.jsx'
import { NODE_META } from '../../data/nodeTypes.js'

// Estrutura e medidas copiadas dos nós do editor de automações do app:
// card 330px, cabeçalho 20/20/10 com título 16px/600, corpo com caixas de raio 6px
// e rodapé "Próximo passo" com o handle de saída.

function NodeFrame({ id, type, title, titleColor, data, children, footer = true }) {
  const meta = NODE_META[type]
  return (
    <motion.div
      initial={data.fresh ? { opacity: 0, scale: 0.94, y: 8 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative w-[330px] cursor-pointer rounded-[10px] border bg-panel text-left transition-[border-color,box-shadow] duration-300 ${
        data.highlighted ? 'border-primary shadow-[0_0_0_4px_rgb(117_102_255_/_0.18)]' : data.selected ? 'border-line-strong' : 'border-line'
      }`}
    >
      <Handle type="target" position={Position.Left} className="cdemo-handle cdemo-handle-target" style={{ top: 31 }} isConnectable={false} />

      <div className="flex items-center gap-2 px-5 pb-2.5 pt-5">
        <span className="shrink-0" style={{ color: meta.color }}><Icon name={meta.icon} size={18} /></span>
        <p className="min-w-0 flex-1 truncate text-base font-semibold" style={{ color: titleColor ?? 'var(--color-fg)' }}>{title}</p>
        {data.stats && <StatPill value={data.stats.total} />}
      </div>

      <div className="flex flex-col gap-3 px-2.5 pb-2.5">{children}</div>

      {footer && (
        <div className="relative flex items-center justify-end gap-2 pb-[15px] pr-5">
          <span className="text-xs text-fg-muted">{t.nextStep}</span>
          <Handle id={`${id}-out`} type="source" position={Position.Right} className="cdemo-handle" style={{ position: 'relative', top: 'auto', right: 'auto', transform: 'none' }} isConnectable={false} />
        </div>
      )}
    </motion.div>
  )
}

const fmt = (n) => n.toLocaleString(LOCALE)

// Contador de leads do modo Insights (mesmo lugar do selo do nó no app).
function StatPill({ value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-subtle text-primary-soft',
    danger: 'bg-danger-subtle text-[#ff8fa8]',
    muted: 'bg-line text-fg-muted',
  }
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${tones[tone]}`} title={`${fmt(value)} ${t.leads}`}>
      <Icon name="users" size={12} />
      {fmt(value)}
    </span>
  )
}

function Label({ icon, children }) {
  return (
    <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4px] text-fg-muted">
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}

function Box({ children, tone = 'panel', className = '' }) {
  const tones = {
    panel: 'bg-panel border-line',
    raised: 'bg-line border-line-strong',
  }
  return <div className={`rounded-md border px-3 py-2.5 ${tones[tone]} ${className}`}>{children}</div>
}

const TriggerNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="trigger" title={data.title} data={data}>
    <div className="flex flex-col gap-2.5 px-2.5 py-2">
      <Label icon="flag">{data.label}</Label>
      <div className="flex items-center gap-3">
        <span className="grid h-6 w-6 place-items-center rounded-[30%] bg-[#5a5a5a] text-[9px] font-semibold text-white">FC</span>
        <div>
          <p className="text-xs font-medium text-fg">{data.meta}</p>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.4px] text-fg-muted">
            {t.stage} <span className="font-normal">•</span>
            <span className="text-[11px] font-medium normal-case tracking-normal text-[#a5b4fc]">{data.value}</span>
          </p>
        </div>
      </div>
    </div>
  </NodeFrame>
))

const AgentNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="agent" title={data.title} titleColor="#9289ff" data={data}>
    <div className="px-2.5">
      <Box>
        <p className="flex items-center gap-2 text-xs text-fg"><Icon name="whatsapp" size={14} className="text-whatsapp" />{t.device}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-[#fbd55c] text-[10px] uppercase text-white">W</span>
          {data.device}
        </p>
      </Box>
    </div>
    <div className="px-2.5">
      <Box>
        <p className="flex items-center gap-2 text-xs text-fg"><Icon name="bot" size={14} className="text-fg-muted" />{t.agent}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
          <img src={auraMark} width="20" height="20" alt="" className="rounded-lg" />
          {data.agent}
        </p>
        <span className="my-2.5 block border-t border-line" />
        <p className="text-[11px] font-semibold uppercase text-fg-muted">{t.agentPrompt}</p>
        <p className="mt-1.5 line-clamp-2 text-xs text-fg">{data.prompt}</p>
      </Box>
    </div>
  </NodeFrame>
))

const ConditionNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="condition" title={data.title} data={data} footer={false}>
    <div className="px-5 pb-2.5">
      <div className="rounded-md border border-line p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-fg"><Icon name="split" size={13} className="text-fg-muted" />{t.convTransition}</p>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {data.branches.map((b) => {
            const danger = b.tone === 'danger'
            return (
              <div
                key={b.id}
                className={`relative flex items-center justify-between gap-2 rounded-md border p-2.5 ${danger ? 'border-[#86172c] bg-[#3b0912]' : 'border-emphasized bg-bg-deep'}`}
              >
                <span className={`min-w-0 flex-1 text-xs text-fg ${danger ? 'font-semibold' : ''}`}>{b.label}</span>
                {data.stats?.branches && <StatPill value={data.stats.branches[b.id]} tone={danger ? 'danger' : 'muted'} />}
                <Handle
                  id={b.id}
                  type="source"
                  position={Position.Right}
                  className={`cdemo-handle ${danger ? 'cdemo-handle-danger' : 'cdemo-handle-muted'}`}
                  style={{ position: 'relative', top: 'auto', right: 'auto', transform: 'none' }}
                  isConnectable={false}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </NodeFrame>
))

const WaitNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="wait" title={data.title} data={data}>
    <div className="px-2.5">
      <Box>
        <Label icon="clock">{t.waitTime}</Label>
        <p className="mt-1.5 text-sm font-semibold text-fg">{data.value}</p>
        <p className="mt-1 text-[11px] text-fg-muted">{data.meta}</p>
        {data.stats?.waiting && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#fb923c]"><Icon name="clock" size={12} />{t.waitingNow(fmt(data.stats.waiting))}</p>
        )}
      </Box>
    </div>
  </NodeFrame>
))

const WhatsappNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="whatsapp" title={data.title} data={data}>
    <div className="-mt-2 flex items-center gap-1.5 pl-[42px] pr-2">
      <span className="text-xs text-fg">{data.channel}</span>
    </div>
    <div className="flex items-center gap-1.5 pl-[42px]">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-line text-whatsapp"><Icon name="whatsapp" size={12} /></span>
      <span className="text-[11px] font-medium text-fg">{data.sender}</span>
    </div>
    <div className="px-2.5">
      <Box tone="raised" className="p-2.5">
        <p className="text-xs font-light leading-relaxed text-fg">{data.preview}</p>
      </Box>
    </div>
  </NodeFrame>
))

const EmailNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="email" title={data.title} data={data}>
    <div className="px-2.5">
      <Box>
        <Label icon="mail">{t.subject}</Label>
        <p className="mt-1.5 text-xs text-fg">{data.subject}</p>
        <p className="mt-1 text-[11px] text-fg-muted">{data.meta}</p>
      </Box>
    </div>
  </NodeFrame>
))

const ActionNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="action" title={data.title} titleColor="#fb923c" data={data}>
    {data.items.map((item) => (
      <div key={item.label} className="px-2.5">
        <div className="rounded-md border border-[#2e2e36] bg-line px-3 py-2.5">
          <p className="flex items-center gap-2 text-xs font-semibold text-fg"><Icon name="zap" size={13} className="text-[#f5a524]" />{item.label}</p>
          <p className="mt-1 pl-[21px] text-[11px] text-fg">{item.value} ›</p>
        </div>
      </div>
    ))}
  </NodeFrame>
))

const GoalNode = memo(({ id, data }) => (
  <NodeFrame id={id} type="goal" title={data.title} titleColor="#9289ff" data={data} footer={false}>
    <div className="px-2.5 pb-2.5">
      <Box>
        <Label icon="target">{t.goalWhen}</Label>
        <p className="mt-1.5 text-sm font-semibold text-fg">{data.value}</p>
        <p className="mt-1 text-[11px] text-fg-muted">{data.meta}</p>
      </Box>
    </div>
  </NodeFrame>
))

export const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  condition: ConditionNode,
  wait: WaitNode,
  whatsapp: WhatsappNode,
  email: EmailNode,
  action: ActionNode,
  goal: GoalNode,
}
