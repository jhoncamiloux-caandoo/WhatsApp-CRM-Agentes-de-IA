"""Gera as variações da versão B a partir de dist/light/index.html (PT, tema claro):

  dist/dark/index.html            PT, tema escuro
  dist/light/es/, dist/light/en/  ES e EN, tema claro
  dist/dark/es/,  dist/dark/en/   ES e EN, tema escuro

Uso: python3 tools/build_b.py   (rode sempre que editar dist/light/index.html)
Textos: i18n/es.json e i18n/en.json (o script lista o que ficar sem tradução).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_i18n import translate  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
LANGS = {
    'pt': {'html': 'pt-BR', 'flag': 'flag-br.svg', 'name': 'Português', 'label': 'Idioma: Português'},
    'es': {'html': 'es', 'flag': 'flag-es.svg', 'name': 'Español', 'label': 'Idioma: Español'},
    'en': {'html': 'en', 'flag': 'flag-us.svg', 'name': 'English', 'label': 'Language: English'},
}
SRC = (DIST / 'light' / 'index.html').read_text()


def lang_menu(prefix, theme, current):
    items = []
    for code, cfg in LANGS.items():
        href = f'{prefix}{theme}/' + ('' if code == 'pt' else f'{code}/')
        cur = ' aria-current="page"' if code == current else ''
        check = '<span class="check" aria-hidden="true">✓</span>' if code == current else ''
        items.append(f'<li><a href="{href}" hreflang="{cfg["html"]}" lang="{cfg["html"]}"{cur}><img src="{prefix}assets/{cfg["flag"]}" width="16" height="16" alt="">{cfg["name"]}{check}</a></li>')
    return '<ul class="lang-menu" id="lang-menu" hidden>' + ''.join(items) + '</ul>'


def build(theme, code):
    out_dir = DIST / theme / ('' if code == 'pt' else code)
    depth = len(out_dir.relative_to(DIST).parts)
    prefix = '../' * depth
    html = SRC
    missing = set()
    if code != 'pt':
        d = json.loads((ROOT / 'i18n' / f'{code}.json').read_text())
        html = translate(html, d, missing)
    cfg = LANGS[code]

    html = html.replace('<html lang="pt-BR">', f'<html lang="{cfg["html"]}"' + (' data-theme="dark"' if theme == 'dark' else '') + '>', 1)
    # Caminhos: assets, demo e os arquivos da pasta light/
    html = html.replace('"../assets/', f'"{prefix}assets/').replace("'../demo/", f"'{prefix}demo/")
    html = html.replace('href="light.css"', f'href="{prefix}light/light.css"').replace('href="theme-dark.css"', f'href="{prefix}light/theme-dark.css"')
    html = html.replace('src="light.js"', f'src="{prefix}light/light.js"')
    # Seletor de idioma aponta para a mesma variação (tema) nos outros idiomas
    html = re.sub(r'<ul class="lang-menu" id="lang-menu" hidden>.*?</ul>', lambda m: lang_menu(prefix, theme, code), html, flags=re.S)
    html = re.sub(r'(<button class="lang-btn"[^>]*aria-label=")[^"]*(">\s*<img src=")[^"]*(")',
                  lambda m: m.group(1) + cfg['label'] + m.group(2) + f'{prefix}assets/{cfg["flag"]}' + m.group(3), html, count=1)
    # "Versão A" leva para a versão A no mesmo idioma
    html = re.sub(r'<a href="[^"]*">(Versão A|Versión A|Version A)</a>',
                  lambda m: f'<a href="{prefix}{"" if code == "pt" else code + "/"}">{m.group(1)}</a>', html)
    if theme == 'dark':
        html = html.replace('data-theme-set="light" aria-pressed="true"', 'data-theme-set="light" aria-pressed="false"')
        html = html.replace('data-theme-set="dark" aria-pressed="false"', 'data-theme-set="dark" aria-pressed="true"')

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'index.html').write_text(html)
    rel = out_dir.relative_to(DIST)
    print(f'dist/{rel}/index.html')
    return missing


def main():
    all_missing = {}
    for theme in ('light', 'dark'):
        for code in LANGS:
            if theme == 'light' and code == 'pt':
                # A fonte também precisa do seletor de idioma apontando para a versão B
                global SRC
                SRC = re.sub(r'<ul class="lang-menu" id="lang-menu" hidden>.*?</ul>', lang_menu('../', 'light', 'pt'), SRC, flags=re.S)
                (DIST / 'light' / 'index.html').write_text(SRC)
                continue
            m = build(theme, code)
            if m:
                all_missing.setdefault(code, set()).update(m)
    for code, m in all_missing.items():
        print(f'[{code}] sem tradução:', *sorted(m), sep='\n  ')
    return 1 if all_missing else 0


if __name__ == '__main__':
    sys.exit(main())
