"""Gera dist/es/index.html e dist/en/index.html a partir de dist/index.html (PT) + i18n/<lang>.json.

Uso: python3 tools/build_i18n.py   (rode depois de editar a LP em português)
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
LANGS = {
    'es': {'html': 'es', 'flag': 'flag-es.svg', 'label': 'Idioma: Español'},
    'en': {'html': 'en', 'flag': 'flag-us.svg', 'label': 'Language: English'},
}
ATTR_RE = re.compile(r'\b(alt|aria-label|title|content|placeholder)="([^"]*)"')
TEXT_RE = re.compile(r'>([^<>]+)<')
BLOCK_RE = re.compile(r'(<(script|style)\b[^>]*>.*?</\2>)', re.S)


def translate(html, d, missing):
    def text(m):
        raw = m.group(1)
        t = raw.strip()
        if not t or not any(c.isalpha() for c in t):
            return m.group(0)
        if t in d:
            return '>' + raw.replace(t, d[t]) + '<'
        if len(t) > 2:
            missing.add(t)
        return m.group(0)

    def attr(m):
        v = m.group(2)
        return f'{m.group(1)}="{d.get(v, v)}"'

    # split com 2 grupos devolve [texto, bloco, nome-da-tag, texto, ...]; scripts e styles ficam intactos.
    parts = BLOCK_RE.split(html)
    out = []
    for i, chunk in enumerate(parts):
        if i % 3 == 0:
            out.append(TEXT_RE.sub(text, ATTR_RE.sub(attr, chunk)))
        elif i % 3 == 1:
            out.append(chunk)
    return ''.join(out)


def relocate(html, code, cfg):
    # Páginas ficam em /es/ e /en/: assets e scripts sobem um nível.
    for a, b in [('src="assets/', 'src="../assets/'), ('href="assets/', 'href="../assets/'),
                 ('href="styles.css"', 'href="../styles.css"'), ('href="./"><link rel="alternate" hreflang="es" href="es/"><link rel="alternate" hreflang="en" href="en/">', 'href="../"><link rel="alternate" hreflang="es" href="../es/"><link rel="alternate" hreflang="en" href="../en/">'), ('src="app.js"', 'src="../app.js"'),
                 ('"demo/demo.css"', '"../demo/demo.css"'), ('"demo/demo.js"', '"../demo/demo.js"')]:
        html = html.replace(a, b)
    html = html.replace('<html lang="pt-BR">', f'<html lang="{cfg["html"]}">', 1)
    # Seletor de idioma: links relativos, item atual e bandeira do botão.
    html = html.replace('href="./" hreflang', 'href="../" hreflang').replace('href="es/" hreflang', 'href="../es/" hreflang').replace('href="en/" hreflang', 'href="../en/" hreflang')
    html = html.replace(' aria-current="page"', '').replace('<span class="check" aria-hidden="true">✓</span>', '')
    html = re.sub(rf'(<a href="\.\./{code}/" hreflang="{code}" lang="{code}")(><img src="\.\./assets/{cfg["flag"]}"[^>]*>[^<]+)',
                  r'\1 aria-current="page"\2<span class="check" aria-hidden="true">✓</span>', html)
    html = html.replace('<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="lang-menu" aria-label="' + cfg['label'] + '"><img src="../assets/flag-br.svg"',
                        '<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="lang-menu" aria-label="' + cfg['label'] + '"><img src="../assets/' + cfg['flag'] + '"')
    return html


def main():
    src = (DIST / 'index.html').read_text()
    ok = True
    for code, cfg in LANGS.items():
        d = json.loads((ROOT / 'i18n' / f'{code}.json').read_text())
        missing = set()
        html = relocate(translate(src, d, missing), code, cfg)
        (DIST / code).mkdir(exist_ok=True)
        (DIST / code / 'index.html').write_text(html)
        if missing:
            ok = False
            print(f'[{code}] sem tradução:', *sorted(missing), sep='\n  ')
        print(f'[{code}] dist/{code}/index.html gerado')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
