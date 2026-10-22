# Clint — WhatsApp + CRM + IA

LP independente baseada no wireframe C aprovado. HTML/CSS/JS sem build. Abra dist/index.html ou sirva dist com um servidor estático. Assets e Poppins locais. CTA principal: https://app.useclint.com/signup/trial.

Animações CSS ilustrativas de inbox, conversa, oportunidade e passagem da IA ao time. Pausa global, pausa fora da tela/aba oculta e prefers-reduced-motion.

Fontes: https://www.useclint.com/conversas e https://www.useclint.com/crm para recursos; https://www.clint.digital/solicitar-demonstracao-gratis para cases (Tendas Araguaia R$461 mil/57 dias; Sabrina Nunes R$567 mil/35 dias; Grupo Acelerador 7 vendas/fim de semana). Resultados não atribuídos somente à organização do WhatsApp. Link comercial leva à página oficial de demonstração. As interfaces e conversas da LP são ilustrações, sem resultados inventados.

## Demonstração interativa (Aura + editor de automações)

Fonte em `demo-automacao/` (React + Tailwind + @xyflow/react + Framer Motion, dados mockados). O roteiro fica em `demo-automacao/src/data/demo-script.json`.

- Desenvolver: `npm --prefix demo-automacao run dev`
- Publicar na LP: `npm --prefix demo-automacao run build` (gera `dist/demo/demo.js` e `dist/demo/demo.css`)

A LP carrega a demo só quando a seção se aproxima da tela (`#demo-automacao` no `index.html`). O CSS da demo não tem reset global; ela pausa sozinha fora da tela, com a aba oculta ou com o botão "Pausar animações" do rodapé.

## Idiomas (PT / ES / EN)

A LP em português (`dist/index.html`) é a fonte. As versões `dist/es/` e `dist/en/` são geradas:

```bash
python3 tools/build_i18n.py
```

Os textos ficam em `i18n/es.json` e `i18n/en.json` (português → tradução). Se você alterar um texto em português, o script lista o que ficou sem tradução. A demonstração interativa segue o `<html lang>` da página: os textos dela ficam em `demo-automacao/src/i18n.js` e `demo-automacao/src/data/*.{es,en}.json`.

## Vídeo do topo

O briefing para o roteiro está em `roteiro-video-contexto.md`. Quando o vídeo estiver pronto, preencha `data-video` no botão `.hero-video` do `dist/index.html` com o ID do YouTube ou o caminho do `.mp4`, e rode `tools/build_i18n.py`.

## Versão B (protótipo) — light e dark

- Light: `dist/light/` (`index.html`, `light.css`, `light.js`)
- Dark: `dist/dark/`. É o mesmo HTML da light com `data-theme="dark"` (paleta em `dist/light/theme-dark.css`). O botão sol/lua do header troca o tema na hora.
- ES/EN: `dist/light/{es,en}/` e `dist/dark/{es,en}/`.

Depois de editar `dist/light/index.html`, rode:

```bash
python3 tools/build_b.py
```

Um seletor no canto inferior esquerdo alterna entre Light, Dark e a versão A (`dist/`).
