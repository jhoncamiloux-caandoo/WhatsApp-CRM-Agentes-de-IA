import { useState } from 'react'
import { t } from '../i18n.js'
import auraMark from '../assets/aura-mark.svg'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon.jsx'
import { CONVERSATIONS } from '../data/mockData.js'

const TAG_TONES = {
  success: 'bg-success-subtle text-success',
  primary: 'bg-primary-subtle text-primary-soft',
  warning: 'bg-[#fb923c]/15 text-[#fb923c]',
  muted: 'bg-line text-fg-muted',
}

function Avatar({ c, size = 36 }) {
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span className="grid h-full w-full place-items-center rounded-full text-xs font-semibold text-white" style={{ background: c.color }}>
        {c.initials}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-bg bg-whatsapp text-white">
        <Icon name="whatsapp" size={8} strokeWidth={2.5} />
      </span>
    </span>
  )
}

function ConversationList({ selectedId, onSelect }) {
  return (
    <nav aria-label={t.convList} className="flex h-full flex-col">
      <div className="p-2.5">
        <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs text-fg-subtle">
          {t.search}
          <Icon name="search" size={13} className="ml-auto" />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-fg">
          <span className="flex items-center gap-1 rounded-md border border-line px-2 py-1">{t.all} <Icon name="chevronDown" size={12} /></span>
          <Icon name="filter" size={13} className="text-fg-subtle" />
        </div>
      </div>
      <ul className="cdemo-scroll min-h-0 flex-1 overflow-y-auto">
        {CONVERSATIONS.map((c) => {
          const active = c.id === selectedId
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-start gap-2.5 border-l-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${active ? 'border-primary bg-emphasized' : 'border-transparent hover:bg-panel'}`}
              >
                <Avatar c={c} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-fg">{c.name}</span>
                    <span className="ml-auto shrink-0 text-[10px] text-fg-subtle">{c.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate text-[11px] text-fg-muted">{c.preview}</span>
                    {c.unread > 0 && (
                      <span className="ml-auto grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">{c.unread}</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Message({ m, name }) {
  if (m.from === 'event') {
    return (
      <p className="mx-auto flex max-w-[90%] items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-center text-[11px] text-fg-muted">
        <Icon name="zap" size={11} className="shrink-0 text-[#f5a524]" />
        {m.text}
      </p>
    )
  }
  const mine = m.from !== 'lead'
  const author = m.from === 'agent' ? t.agentName : m.from === 'template' ? t.templateName : name
  return (
    <div className={`flex max-w-[82%] flex-col ${mine ? 'ml-auto items-end' : 'items-start'}`}>
      <span className="mb-1 flex items-center gap-1 text-[10px] text-fg-subtle">
        {m.from === 'agent' && <img src={auraMark} width="12" height="12" alt="" className="rounded-full" />}
        {author}
      </span>
      <div className={`rounded-[10px] px-3 py-2 text-[12.5px] leading-relaxed text-fg ${mine ? 'rounded-br-sm bg-[#2e2375]' : 'rounded-bl-sm border border-line bg-panel'}`}>
        {m.text}
        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-fg-subtle">
          {m.day ? `${m.day} · ` : ''}{m.time}
          {mine && <Icon name="checks" size={12} className="text-edge" />}
        </span>
      </div>
    </div>
  )
}

export default function ConversasTab({ onInteract }) {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id)
  const c = CONVERSATIONS.find((x) => x.id === selectedId)

  const select = (id) => {
    onInteract()
    setSelectedId(id)
  }

  return (
    <div className="absolute inset-0 flex">
      <div className="hidden w-[230px] shrink-0 border-r border-line bg-bg sm:block">
        <ConversationList selectedId={selectedId} onSelect={select} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-bg-deep">
        {/* Troca de conversa no mobile */}
        <div className="cdemo-scroll flex gap-1.5 overflow-x-auto border-b border-line p-2 sm:hidden">
          {CONVERSATIONS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={x.id === selectedId}
              onClick={() => select(x.id)}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${x.id === selectedId ? 'border-primary bg-primary-subtle text-fg' : 'border-line text-fg-muted'}`}
            >
              {x.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <header className="flex items-center gap-2.5 border-b border-line bg-bg px-4 py-2.5">
          <Avatar c={c} size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-fg">{c.name}</p>
            <p className="truncate text-[11px] text-fg-subtle">{c.deal.stage} · {c.deal.value} · {t.owner}: {c.deal.owner}</p>
          </div>
          <span className={`hidden shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium md:inline ${TAG_TONES[c.tag.tone]}`}>{c.tag.label}</span>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={c.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="cdemo-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {c.messages.map((m, i) => <Message key={i} m={m} name={c.name.split(' ')[0]} />)}
          </motion.div>
        </AnimatePresence>

        <div className="border-t border-line bg-bg p-2.5">
          <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-xs text-fg-subtle">
            {t.typeMessage}
            <Icon name="send" size={14} className="ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
