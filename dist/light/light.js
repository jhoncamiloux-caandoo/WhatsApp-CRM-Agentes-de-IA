// Clint · LP versão B (light) — interações do protótipo
// Raiz do site (dist/), a partir deste script: as páginas ficam em níveis diferentes (/light/, /dark/es/…)
const SITE = new URL('../', document.currentScript.src)
const reduce = matchMedia('(prefers-reduced-motion: reduce)')

// Textos gerados pelo JS, por idioma (<html lang>)
const T = {
  pt: { pause: 'Pausar animações', resume: 'Retomar animações', stale: ['1 hora', '5 horas', '1 dia', '2 dias', '3 dias'], heat: ['Quente', 'Morna', 'Fria'] },
  es: { pause: 'Pausar animaciones', resume: 'Reanudar animaciones', stale: ['1 hora', '5 horas', '1 día', '2 días', '3 días'], heat: ['Caliente', 'Tibia', 'Fría'] },
  en: { pause: 'Pause animations', resume: 'Resume animations', stale: ['1 hour', '5 hours', '1 day', '2 days', '3 days'], heat: ['Hot', 'Warm', 'Cold'] },
}[document.documentElement.lang.slice(0, 2)] || null
const TXT = T || { pause: 'Pausar animações', resume: 'Retomar animações', stale: ['1 hora', '5 horas', '1 dia', '2 dias', '3 dias'], heat: ['Quente', 'Morna', 'Fria'] }
const isPaused = () => document.body.classList.contains('paused') || document.hidden
if (!reduce.matches) document.documentElement.classList.add('js')

// Header ganha borda ao rolar
const topBar = document.querySelector('.top')
addEventListener('scroll', () => topBar.classList.toggle('scrolled', scrollY > 8), { passive: true })

// Tema claro/escuro: troca na hora (botão sol/lua e seletor de versões)
;(() => {
  const root = document.documentElement
  const btn = document.querySelector('.theme-btn')
  const pills = document.querySelectorAll('[data-theme-set]')
  const apply = (theme, animate) => {
    if (animate && !reduce.matches) { root.classList.add('theme-anim'); setTimeout(() => root.classList.remove('theme-anim'), 400) }
    const dark = theme === 'dark'
    if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme
    btn.setAttribute('aria-pressed', String(dark))
    btn.setAttribute('aria-label', dark ? btn.dataset.labelLight : btn.dataset.labelDark)
    pills.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.themeSet === theme)))
  }
  btn.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true))
  pills.forEach((p) => p.addEventListener('click', () => apply(p.dataset.themeSet, true)))
  apply(root.dataset.theme === 'dark' ? 'dark' : 'light')
})()

// Seletor de idioma
;(() => {
  const btn = document.querySelector('.lang-btn')
  const menu = document.getElementById('lang-menu')
  const set = (open) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; if (open) menu.querySelector('a').focus() }
  btn.addEventListener('click', () => set(menu.hidden))
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.lang')) set(false) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus() } })
})()

// Botão "Pausar animações" + aba oculta
;(() => {
  const btn = document.getElementById('motion')
  let paused = reduce.matches
  const update = () => {
    document.body.classList.toggle('paused', paused)
    btn.setAttribute('aria-pressed', String(paused))
    btn.textContent = paused ? TXT.resume : TXT.pause
  }
  btn.addEventListener('click', () => { paused = !paused; update() })
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('hidden', document.hidden))
  update()
})()

// Hero: conversa no celular → qualificação → negócio no CRM (em loop enquanto visível)
;(() => {
  const stage = document.querySelector('.hero-stage')
  const items = [...stage.querySelectorAll('[data-at]')]
  const notif = stage.querySelector('.notif')
  const LAST = 9
  let step = -1
  let visible = true
  const render = () => {
    items.forEach((el) => {
      const at = Number(el.dataset.at)
      const until = el.dataset.until ? Number(el.dataset.until) : Infinity
      el.classList.toggle('on', step >= at && step < until)
    })
    notif.classList.toggle('on', step >= 0 && step < 2)
  }
  if (reduce.matches) { step = LAST; render(); return }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: .2 }).observe(stage)
  setInterval(() => {
    if (!visible || isPaused()) return
    step = step >= LAST + 2 ? -1 : step + 1 // segura o final por 2 batidas e recomeça
    render()
  }, 1500)
  render()
})()

// Faixa do vídeo: troca a capa pelo player do YouTube ao clicar
document.querySelectorAll('.player-btn').forEach((b) => b.addEventListener('click', () => {
  const f = document.createElement('iframe')
  f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.youtube}?autoplay=1&rel=0`
  f.title = b.getAttribute('aria-label')
  f.allow = 'autoplay; encrypted-media; picture-in-picture'
  f.allowFullscreen = true
  b.replaceWith(f)
  f.focus()
}))

// Vídeos dos cases em modal
;(() => {
  const modal = document.getElementById('video-modal')
  const frame = modal.querySelector('.video-frame')
  let opener = null
  modal.addEventListener('close', () => { frame.innerHTML = ''; opener?.focus() })
  modal.querySelector('.video-close').addEventListener('click', () => modal.close())
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close() })
  document.querySelectorAll('.case-thumb').forEach((b) => b.addEventListener('click', () => {
    opener = b
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.youtube}?autoplay=1&rel=0" title="${b.getAttribute('aria-label')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
    modal.showModal()
  }))
})()

// Radar: três cenas que trocam com o scroll (desktop) ou ao aparecer (mobile)
;(() => {
  const track = document.querySelector('.radar-track')
  const steps = [...document.querySelectorAll('.radar-steps li')]
  const scenes = [...document.querySelectorAll('.scene')]
  const s2 = document.querySelector('.scene-2')
  const staleEl = s2.querySelector('[data-stale]')
  const tempEl = s2.querySelector('[data-temp]')
  const hand = s2.querySelector('.clock-hand')
  const STALE = TXT.stale
  const desktop = matchMedia('(min-width: 961px)')

  // Cena 2: o tempo passa (t de 0 a 1)
  const age = (t) => {
    const i = Math.min(STALE.length - 1, Math.floor(t * STALE.length))
    staleEl.textContent = STALE[i]
    tempEl.textContent = TXT.heat[t < .35 ? 0 : t < .7 ? 1 : 2]
    s2.style.setProperty('--heat', `${Math.round(100 - t * 88)}%`)
    hand.style.setProperty('--turn', `${Math.round(t * 1080)}deg`)
    s2.classList.toggle('is-late', i === STALE.length - 1)
  }

  const activate = (i) => {
    steps.forEach((el, k) => el.classList.toggle('is-active', k === i))
    scenes.forEach((el, k) => el.classList.toggle('is-active', k === i))
  }

  let ticking = false
  const onScroll = () => {
    if (ticking || !desktop.matches) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const r = track.getBoundingClientRect()
      const span = r.height - innerHeight
      const p = Math.min(1, Math.max(0, -r.top / span))
      const i = Math.min(2, Math.floor(p * 3))
      activate(i)
      if (i === 1) age(Math.min(1, (p * 3 - 1) * 1.25))
    })
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // Mobile: cada cena anima quando entra na tela; a cena 2 faz o "time-lapse" sozinha
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (desktop.matches || !e.isIntersecting) return
    e.target.classList.add('is-active')
    if (e.target === s2) {
      if (reduce.matches) return age(1)
      const t0 = performance.now()
      const run = (now) => { const t = Math.min(1, (now - t0) / 2600); age(t); if (t < 1) requestAnimationFrame(run) }
      requestAnimationFrame(run)
    }
    io.unobserve(e.target)
  }), { threshold: .4 })
  scenes.forEach((s) => io.observe(s))
  if (reduce.matches) age(1)
})()

// Do primeiro oi: etapas que avançam sozinhas (fim da barra = próxima etapa)
;(() => {
  const flow = document.querySelector('.flow')
  const product = flow.querySelector('.product')
  const tabs = [...flow.querySelectorAll('[role="tab"]')]
  const board = flow.querySelector('.board')
  const select = (i, focus) => {
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)))
    product.dataset.step = String(i)
    // O quadro rola até a coluna onde o negócio está: Base (etapa 3) ou Em negociação (etapa 4)
    const target = i === 3 ? board.querySelector('.col-target') : board.firstElementChild
    board.scrollTo({ left: target.getBoundingClientRect().left - board.getBoundingClientRect().left + board.scrollLeft - 14, behavior: reduce.matches ? 'auto' : 'smooth' })
    if (focus) tabs[i].focus()
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i))
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
      if (d) { e.preventDefault(); select((i + d + tabs.length) % tabs.length, true) }
    })
    t.querySelector('.bar').addEventListener('animationend', () => select((i + 1) % tabs.length))
  })
  new IntersectionObserver(([e]) => flow.classList.toggle('paused', !e.isIntersecting), { threshold: .3 }).observe(flow)
})()

// Carrossel de cases
;(() => {
  const track = document.querySelector('.cases-track')
  const btns = document.querySelectorAll('.cases-btn')
  const sync = () => { btns[0].disabled = track.scrollLeft < 8; btns[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8 }
  btns.forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: (track.firstElementChild.offsetWidth + 20) * Number(b.dataset.dir), behavior: reduce.matches ? 'auto' : 'smooth' })))
  track.addEventListener('scroll', sync, { passive: true })
  addEventListener('resize', sync)
  sync()
})()

// Revelação suave de blocos ao rolar
;(() => {
  const els = document.querySelectorAll('.video-head, .player, .flow-head, .agents-in, .cases-head, .faq-grid, .final-in')
  els.forEach((el) => el.classList.add('rv'))
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 })
  els.forEach((el) => io.observe(el))
})()

// Demonstração interativa da Aura (mesmo build da versão A), carregada só perto da seção
;(() => {
  const slot = document.getElementById('demo-automacao')
  let done = false
  const load = () => {
    if (done) return
    done = true
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('demo/demo.css', SITE).href; document.head.appendChild(css)
    const js = document.createElement('script'); js.type = 'module'; js.src = new URL('demo/demo.js', SITE).href; js.onload = () => slot.classList.remove('demo-slot'); document.head.appendChild(js)
  }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); load() } }, { rootMargin: '600px 0px' })
  io.observe(slot)
})()
