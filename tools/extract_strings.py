"""Lista os textos traduzíveis de dist/index.html (texto visível + atributos)."""
import json, sys
from html.parser import HTMLParser

ATTRS = ('alt', 'aria-label', 'title', 'content', 'placeholder')

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
        d = dict(attrs)
        if tag == 'meta' and d.get('name') not in ('description',): return
        for a in ATTRS:
            v = (d.get(a) or '').strip()
            if v and any(c.isalpha() for c in v): self.out.append(v)
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip -= 1
    def handle_data(self, data):
        t = data.strip()
        if not self.skip and t and any(c.isalpha() for c in t): self.out.append(t)

p = P(); p.feed(open(sys.argv[1]).read())
seen = []
for s in p.out:
    if s not in seen: seen.append(s)
print(json.dumps(seen, ensure_ascii=False, indent=1))
