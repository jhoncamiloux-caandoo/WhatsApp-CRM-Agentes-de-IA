import { useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { SCRIPT as script, t } from './i18n.js'
import { buildCanvasState } from './data/canvasState.js'
import { getStepView, usePlayer, usePrefersReducedMotion } from './hooks/usePlayer.js'
import CopilotPanel from './components/CopilotPanel.jsx'
import CanvasShell from './components/CanvasShell.jsx'

const { steps, automation } = script
// Automação completa e publicada: base das abas Insights e Conversas.
const fullCanvas = buildCanvasState(steps, steps.length - 1, true, automation.publishedStatus)

export default function DemoSection() {
  const reducedMotion = usePrefersReducedMotion()
  const player = usePlayer(steps, { reducedMotion })
  const { step, index, timing, elapsed, started } = player

  const resultVisible = started && getStepView(step, timing, elapsed).resultVisible
  const canvas = useMemo(
    () => buildCanvasState(steps, index, resultVisible, automation.initialStatus),
    [index, resultVisible],
  )

  // A aba segue o roteiro; o visitante pode trocar e o próximo passo devolve o controle ao roteiro.
  const [tabOverride, setTabOverride] = useState(null)
  useEffect(() => setTabOverride(null), [index])
  const scriptTab = started && resultVisible ? step.activeTab : steps[Math.max(0, index - 1)].activeTab
  const activeTab = tabOverride ?? (started ? scriptTab : 'editor')

  // Pausa sozinha quando a demo sai da tela, a aba do navegador fica oculta
  // ou o visitante usa o "Pausar animações" do rodapé da LP (body.paused).
  const frameRef = useRef(null)
  const { pause } = player
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause() }, { threshold: 0.2 })
    if (frameRef.current) io.observe(frameRef.current)
    const onVisibility = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', onVisibility)
    const mo = new MutationObserver(() => { if (document.body.classList.contains('paused')) pause() })
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => {
      io.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pause])

  // Insights e Conversas mostram a automação já publicada.
  const status = activeTab === 'editor' ? canvas.status : automation.publishedStatus

  const onTab = (id) => {
    player.pause()
    setTabOverride(id)
  }

  // Atalhos: Espaço = play/pause, ←/→ = passos (só com foco dentro da demo).
  const onKeyDown = (e) => {
    const tag = e.target.tagName
    if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') {
      e.preventDefault()
      player.toggle()
    } else if (e.key === 'ArrowRight' && e.target.getAttribute('role') !== 'tab') {
      player.next()
    } else if (e.key === 'ArrowLeft' && e.target.getAttribute('role') !== 'tab') {
      player.prev()
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="cdemo-title" className="cdemo px-4 py-[60px] font-sans text-[16px] leading-normal text-fg antialiased sm:px-8 md:py-[100px]">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-soft">{t.eyebrow}</span>
            <h2 id="cdemo-title" className="mt-3 text-[clamp(30px,3.3vw,45px)] font-normal leading-[1.2] tracking-[-1.5px] text-[#f6f0fc]">
              {t.titleA}{' '}
              <span className="bg-[linear-gradient(100deg,#efe3ff,#bb8ae9_80%)] bg-clip-text text-transparent">{t.titleB}</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#ad9fbc]">
              {t.lead}
            </p>
          </div>

          <div
            ref={frameRef}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={t.frameLabel}
            className="mt-10 grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_30px_80px_-20px_rgb(117_102_255_/_0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:h-[640px] lg:grid-cols-[35fr_65fr]"
          >
            <div className="flex h-[440px] min-w-0 flex-col lg:h-auto lg:min-h-0">
              <CopilotPanel steps={steps} player={player} reducedMotion={reducedMotion} />
            </div>
            <div className="flex h-[480px] min-w-0 flex-col border-t border-line lg:h-auto lg:min-h-0 lg:border-t-0">
              <CanvasShell
                automationName={automation.name}
                canvas={canvas}
                status={status}
                fullCanvas={fullCanvas}
                activeTab={activeTab}
                onTab={onTab}
                onCanvasInteract={player.pause}
                publishing={step.id === 'publicar' && resultVisible}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
