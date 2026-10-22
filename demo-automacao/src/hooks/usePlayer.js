import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ANALYZING_MS = 1400
const USER_MS = 900
const CHARS_PER_SECOND = 48
const RESULT_DELAY_MS = 350
const MIN_HOLD_MS = 1600

/**
 * Linha do tempo de um passo, em ms "de roteiro" (a velocidade 5x só acelera o relógio):
 * [mensagem do usuário] → analisando → streaming da IA → card de resultado → espera → próximo.
 */
export function getTiming(step, reducedMotion) {
  if (reducedMotion) {
    return { userAt: 0, analyzingEnd: 0, streamEnd: 0, resultAt: 0, total: step.durationMs }
  }
  const userAt = step.userMessage ? USER_MS : 0
  const analyzingEnd = userAt + ANALYZING_MS
  const streamEnd = analyzingEnd + (step.aiMessage.length / CHARS_PER_SECOND) * 1000
  const resultAt = streamEnd + RESULT_DELAY_MS
  const total = Math.max(step.durationMs, resultAt + MIN_HOLD_MS)
  return { userAt, analyzingEnd, streamEnd, resultAt, total }
}

/** Estado visível do passo atual para um instante `elapsed`. */
export function getStepView(step, timing, elapsed) {
  const streamed = elapsed <= timing.analyzingEnd
    ? 0
    : Math.min(step.aiMessage.length, Math.floor(((elapsed - timing.analyzingEnd) / 1000) * CHARS_PER_SECOND))
  return {
    analyzing: elapsed < timing.analyzingEnd,
    text: step.aiMessage.slice(0, streamed),
    streaming: streamed > 0 && streamed < step.aiMessage.length,
    resultVisible: elapsed >= timing.resultAt,
  }
}

export function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function usePlayer(steps, { reducedMotion = false } = {}) {
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [started, setStarted] = useState(false)

  const step = steps[index]
  const timing = useMemo(() => getTiming(step, reducedMotion), [step, reducedMotion])
  const isLast = index === steps.length - 1
  const finished = isLast && elapsed >= timing.total

  // Relógio: requestAnimationFrame, acelerado pela velocidade escolhida.
  const speedRef = useRef(speed)
  speedRef.current = speed
  useEffect(() => {
    if (!playing) return undefined
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = (now - last) * speedRef.current
      last = now
      setElapsed((e) => e + dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Avança para o próximo passo ao fim da linha do tempo.
  useEffect(() => {
    if (elapsed < timing.total) return
    if (isLast) {
      setPlaying(false)
      return
    }
    setIndex((i) => i + 1)
    setElapsed(0)
  }, [elapsed, timing.total, isLast])

  const play = useCallback(() => {
    setStarted(true)
    if (finished) {
      setIndex(0)
      setElapsed(0)
    }
    setPlaying(true)
  }, [finished])

  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  // Navegação manual pausa e mostra o passo completo.
  const goTo = useCallback((i) => {
    const next = Math.max(0, Math.min(steps.length - 1, i))
    setStarted(true)
    setPlaying(false)
    setIndex(next)
    setElapsed(getTiming(steps[next], reducedMotion).resultAt + 1)
  }, [steps, reducedMotion])

  return {
    step,
    index,
    total: steps.length,
    elapsed,
    timing,
    playing,
    started,
    finished,
    speed,
    setSpeed,
    play,
    pause,
    toggle,
    goTo,
    next: () => goTo(index + 1),
    prev: () => goTo(index - 1),
  }
}
