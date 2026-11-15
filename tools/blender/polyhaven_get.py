# download Poly Haven assets via the public API into ph/<id>/
import json, os, sys, urllib.request
OUT = os.path.dirname(os.path.abspath(__file__))
def get(url): 
    req = urllib.request.Request(url, headers={'User-Agent': 'asset-fetch/1.0'})
    with urllib.request.urlopen(req, timeout=180) as r: return r.read()
def save(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path): open(path, 'wb').write(get(url))
def model(aid, res='2k'):
    f = json.loads(get(f'https://api.polyhaven.com/files/{aid}'))
    g = f['gltf'][res]['gltf']
    save(g['url'], f'{OUT}/{aid}/{aid}.gltf')
    for rel, inc in g.get('include', {}).items(): save(inc['url'], f'{OUT}/{aid}/{rel}')
    print('model', aid, len(g.get('include', {})), 'files')
def texture(aid, res='2k'):
    f = json.loads(get(f'https://api.polyhaven.com/files/{aid}'))
    for m in ('Diffuse', 'Rough', 'nor_gl', 'Displacement'):
        if m in f:
            fmt = 'jpg' if 'jpg' in f[m][res] else list(f[m][res])[0]
            save(f[m][res][fmt]['url'], f'{OUT}/{aid}/{aid}_{m.lower()}_{res}.{fmt}')
    print('texture', aid)
def hdri(aid, res='2k'):
    f = json.loads(get(f'https://api.polyhaven.com/files/{aid}'))
    save(f['hdri'][res]['hdr']['url'], f'{OUT}/{aid}/{aid}_{res}.hdr'); print('hdri', aid)
for a in sys.argv[1:]:
    kind, aid = a.split(':')
    {'m': model, 't': texture, 'h': hdri}[kind](aid)
