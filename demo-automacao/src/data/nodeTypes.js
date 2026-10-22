// Ícone e cor de cada tipo de bloco (cores dos ícones da paleta do editor); nome e explicação vêm do i18n.
import { nodeText } from '../i18n.js'

const META = {
  trigger: { icon: 'flag', color: '#7b9bff' },
  agent: { icon: 'bot', color: '#3dd68c' },
  condition: { icon: 'split', color: '#f2667b' },
  wait: { icon: 'clock', color: '#fb923c' },
  whatsapp: { icon: 'whatsapp', color: '#25d366' },
  email: { icon: 'mail', color: '#60a5fa' },
  action: { icon: 'zap', color: '#f5a524' },
  goal: { icon: 'target', color: '#9289ff' },
  insights: { icon: 'chart', color: '#9289ff' },
}

export const NODE_META = Object.fromEntries(
  Object.entries(META).map(([type, m]) => {
    const [label, help] = nodeText(type)
    return [type, { ...m, label, help }]
  }),
)
