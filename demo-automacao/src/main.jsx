import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DemoSection from './DemoSection.jsx'

if (import.meta.env.DEV) import('./dev.css')

const el = document.getElementById('demo-automacao')
if (el) {
  createRoot(el).render(
    <StrictMode>
      <DemoSection />
    </StrictMode>,
  )
}
