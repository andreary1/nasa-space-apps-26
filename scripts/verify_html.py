# -*- coding: utf-8 -*-
import re

with open('deliverables/demo/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Check for undefined pr.y
lines = content.split('\n')
for idx, line in enumerate(lines):
    if 'pr.y' in line:
        print(f'Line {idx+1}: pr.y found: {line.strip()}')

# 2. Extract script content
scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
print(f'Found {len(scripts)} inline scripts.')

js_code = scripts[-1]
get_elem_ids = set(re.findall(r'document\.getElementById\([\"\']([^\"\']+)[\"\']\)', js_code))
html_ids = set(re.findall(r'id=[\"\']([^\"\']+)[\"\']', content))

missing = get_elem_ids - html_ids
if missing:
    print('Missing IDs in HTML:', missing)
else:
    print(f'PASS: All {len(get_elem_ids)} getElementById IDs match HTML elements!')

onclick_funcs = set(re.findall(r'onclick=[\"\']([a-zA-Z0-9_]+)', content))
print('Onclick functions used in HTML:', onclick_funcs)

defined_funcs = set(re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', js_code))
print('Defined functions in JS:', defined_funcs)

missing_funcs = onclick_funcs - defined_funcs
if missing_funcs:
    print('WARNING: Missing functions:', missing_funcs)
else:
    print('PASS: All onclick functions are defined!')

print('Total HTML length:', len(content))
