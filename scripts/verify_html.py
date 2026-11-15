"""Check demo assets, ES module syntax, imports and DOM references."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[1] / 'deliverables/demo'
errors = []


class Page(HTMLParser):
    ids = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for name, value in attrs.items():
            if name.startswith('on'):
                errors.append(f'Inline handler: {name}')
            if name in ('src', 'href') and value and not value.startswith(('http', '#', 'data:')):
                if not (root / value).exists():
                    errors.append(f'Missing HTML asset: {value}')


page = Page()
page.feed((root / 'index.html').read_text(encoding='utf-8'))
errors.extend(f'Duplicate ID: {key}' for key, count in Counter(page.ids).items() if count > 1)
graph = {}
for path in root.rglob('*'):
    if path.suffix not in ('.html', '.js', '.css'):
        continue
    text = path.read_text(encoding='utf-8')
    if re.search(r'^(?:<{7}|={7}|>{7})(?:\s|$)', text, re.M):
        errors.append(f'Conflict marker: {path}')
    if path.suffix == '.css':
        for value in re.findall(r"@import url\(['\"]([^'\"]+)", text):
            if not (path.parent / value).exists():
                errors.append(f'Missing CSS: {value}')
    if path.suffix != '.js' or 'vendor' in path.parts:
        continue
    result = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
    if result.returncode:
        errors.append(result.stderr)
    deps = [(path.parent / value).resolve() for value in re.findall(r"\bfrom\s+['\"]([^'\"]+)['\"]", text)]
    graph[path.resolve()] = deps
    errors.extend(f'Missing import: {dep}' for dep in deps if not dep.exists())
    missing = set(re.findall(r'''getElementById\(["']([^"']+)["']\)''', text)) - set(page.ids)
    errors.extend(f'Missing DOM ID: {key} in {path.name}' for key in missing)


def visit(path, stack):
    if path in stack:
        errors.append(f'Circular dependency: {path}')
        return
    for dep in graph.get(path, []):
        visit(dep, stack | {path})


for path in graph:
    visit(path, set())
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(page.ids)} unique IDs; {len(graph)} scripts; assets, syntax, imports, DOM references and acyclic module graph.')
