"""
DuoForge daylight film: builds the Blender scene from exported data and renders with Cycles.
Run: blender -b -P build.py -- <data_dir> <out_dir> <frames e.g. "1,60,120" or "all"> [samples] [percent]
Three.js coordinates (Y up) are converted to Blender (Z up): (x, y, z) -> (x, -z, y).
"""
import bpy, bmesh, json, math, os, random, sys
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
DATA, OUT, WHICH = argv[0], argv[1], argv[2]
SAMPLES = int(argv[3]) if len(argv) > 3 else 64
PCT = int(argv[4]) if len(argv) > 4 else 100
anim = json.load(open(os.path.join(DATA, 'anim.json')))
N = anim['N']
random.seed(7)

C = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
CI = C.inverted()
def P(x, y, z): return Vector((x, -z, y))
def m_three(arr):  # three.js column-major 16 -> Blender world matrix
    m = Matrix(((arr[0], arr[4], arr[8], arr[12]), (arr[1], arr[5], arr[9], arr[13]), (arr[2], arr[6], arr[10], arr[14]), (0, 0, 0, 1)))
    return C @ m @ CI
def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v / 12.92) if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in c) + (a,)

# ───────── reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
scn.frame_start, scn.frame_end = 1, N
scn.render.fps = 24
scn.render.engine = 'CYCLES'
scn.cycles.device = 'CPU'
scn.cycles.samples = SAMPLES
scn.cycles.use_adaptive_sampling = True
scn.cycles.adaptive_threshold = 0.02
scn.cycles.use_denoising = False
try: scn.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
scn.cycles.max_bounces = 6
scn.cycles.diffuse_bounces = 3
scn.cycles.glossy_bounces = 3
scn.cycles.transparent_max_bounces = 12
scn.cycles.caustics_reflective = False
scn.cycles.caustics_refractive = False
scn.render.resolution_x, scn.render.resolution_y = 1920, 1080
scn.render.resolution_percentage = PCT
scn.render.film_transparent = False
scn.render.image_settings.file_format = 'JPEG'
scn.render.image_settings.quality = 94
scn.view_settings.view_transform = 'AgX'
try: scn.view_settings.look = 'AgX - Punchy'
except Exception: pass
scn.view_settings.exposure = 0.0

# ───────── material helpers
def principled(name, color=(0.8, 0.8, 0.8, 1), rough=0.5, metal=0.0, image=None, emission_img=None, emission_strength=1.0, alpha_img=None, bump_img=None, bump=0.0, uv_scale=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    def img_node(path, non_color=False):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(path, check_existing=True)
        if non_color: n.image.colorspace_settings.name = 'Non-Color'
        if uv_scale != 1.0:
            mp = nt.nodes.new('ShaderNodeMapping'); tc = nt.nodes.new('ShaderNodeTexCoord')
            mp.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)
            nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
        return n
    if image:
        n = img_node(image); nt.links.new(n.outputs['Color'], bsdf.inputs['Base Color'])
        if alpha_img == image:
            nt.links.new(n.outputs['Alpha'], bsdf.inputs['Alpha'])
            m.blend_method = 'HASHED'
    if bump_img:
        bn = img_node(bump_img, True); b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = bump
        nt.links.new(bn.outputs['Color'], b.inputs['Height']); nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])
    if emission_img:
        n = nt.nodes.new('ShaderNodeTexImage'); img = bpy.data.images.load(emission_img)
        img.source = 'SEQUENCE'; n.image = img
        n.image_user.frame_duration = N; n.image_user.frame_start = 1; n.image_user.frame_offset = 0; n.image_user.use_auto_refresh = True
        nt.links.new(n.outputs['Color'], bsdf.inputs['Emission Color'])
        bsdf.inputs['Emission Strength'].default_value = emission_strength
        bsdf.inputs['Base Color'].default_value = (0.0, 0.0, 0.0, 1)
        bsdf.inputs['Roughness'].default_value = 0.12
    return m

def link(o):
    bpy.context.scene.collection.objects.link(o); return o

def box(name, size, loc, mat, bevel=0.0, segs=4, parent=None, rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    o.data.materials.append(mat)
    if bevel > 0:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        for p in o.data.polygons: p.use_smooth = True
    if parent: o.parent = parent
    return o

def plane(name, w, h, loc, mat, rot=(0, 0, 0), parent=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * h, 0))
    bm.to_mesh(me); bm.free()
    uv = me.uv_layers.new(name='UVMap')
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (co.x / w + 0.5, co.y / h + 0.5)
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    o.data.materials.append(mat)
    if parent: o.parent = parent
    return o

def cyl(name, r1, r2, h, loc, mat, verts=48, parent=None, rot=(0, 0, 0), smooth=True):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r1, radius2=r2, depth=h)
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    o.data.materials.append(mat)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = 0.01; md.segments = 3; md.limit_method = 'ANGLE'
    if parent: o.parent = parent
    return o

T = lambda n: os.path.join(DATA, 'tex', n)

PH = '/tmp/claude-0/-home-user-dj-pixel/f3ee8dfa-96e8-540a-bd49-96f13112dc04/scratchpad/ph'
def import_ph(aid, loc, scale, rotz=0.0):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(PH, aid, aid + '.gltf'))
    new = [o for o in bpy.data.objects if o not in before]
    root = link(bpy.data.objects.new(aid + '_root', None))
    for o in new:
        if o.parent is None: o.parent = root
        if o.type == 'MESH':
            for poly in o.data.polygons: poly.use_smooth = True
    root.location = loc; root.scale = (scale, scale, scale); root.rotation_euler = (0, 0, rotz)
    return root, new

def scanned(name, aid, tint=None, uv=1.0, normal=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (uv, uv, uv)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    def tex(kind, nonc=False):
        import glob
        f = glob.glob(os.path.join(PH, aid, f'{aid}_{kind}_*'))
        if not f: return None
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(f[0])
        if nonc: n.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    d = tex('diffuse')
    if d:
        if tint:
            mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs['Fac'].default_value = 1.0; mx.inputs['Color2'].default_value = tint
            nt.links.new(d.outputs['Color'], mx.inputs['Color1']); nt.links.new(mx.outputs['Color'], b.inputs['Base Color'])
        else: nt.links.new(d.outputs['Color'], b.inputs['Base Color'])
    r = tex('rough', True)
    if r: nt.links.new(r.outputs['Color'], b.inputs['Roughness'])
    n = tex('nor_gl', True)
    if n:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal
        nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m


# ───────── materials
def _tint_oak(m):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    img = [n for n in nt.nodes if n.type == 'TEX_IMAGE'][0]
    mix = nt.nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MULTIPLY'; mix.inputs['Fac'].default_value = 1.0
    mix.inputs['Color2'].default_value = (0.95, 0.42, 0.16, 1)
    nt.links.new(img.outputs['Color'], mix.inputs['Color1']); nt.links.new(mix.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Coat Weight'].default_value = 0.35; b.inputs['Coat Roughness'].default_value = 0.12

M = {
    'alu': principled('alu', hexc('#D6D8DD'), 0.26, 1.0),
    'glass': principled('glass', hexc('#08080B'), 0.06, 0.0),
    'keys': principled('keys', image=T('keys.png'), rough=0.55, metal=0.3),
    'pad': principled('pad', hexc('#CBCED5'), 0.2, 0.9),
    'lapScreen': principled('lapScreen', emission_img=os.path.join(DATA, 'screens/lap/0001.jpg'), emission_strength=1.05),
    'phScreen': principled('phScreen', emission_img=os.path.join(DATA, 'screens/ph/0001.jpg'), emission_strength=1.3),
    'phBack': principled('phBack', hexc('#8DBDFF'), 0.22, 0.45),
    'oak': principled('oak', image=T('oak.png'), rough=0.32, bump_img=T('oak.png'), bump=0.06, uv_scale=1.0),
    'wall': principled('wall', hexc('#F3EFE9'), rough=0.92, bump_img=T('plaster.png'), bump=0.25, uv_scale=3.0),
    'stripe': principled('stripe', hexc('#FFC897'), 0.85),
    'mug': principled('mug', hexc('#FF5A1F'), 0.18),
    'coffee': principled('coffee', hexc('#4A2A18'), 0.08),
    'pot': principled('pot', hexc('#E8774A'), 0.75),
    'potRim': principled('potRim', hexc('#D9653A'), 0.75),
    'soil': principled('soil', hexc('#3E2A1C'), 1.0),
    'leaf': principled('leaf', image=T('leaf.png'), alpha_img=T('leaf.png'), rough=0.45),
    'teal': principled('teal', hexc('#14B8A6'), 0.55),
    'tealDark': principled('tealDark', hexc('#0E7C70'), 0.55),
    'pencil': principled('pencil', hexc('#FFB020'), 0.45),
    'wood': principled('wood', hexc('#F0D2A8'), 0.7),
    'eraser': principled('eraser', hexc('#FF5C8A'), 0.6),
    'blue': principled('blue', hexc('#3D7BFF'), 0.3, 0.15),
    'ceramic': principled('ceramic', hexc('#F4F1EC'), 0.18),
    'legs': principled('legs', hexc('#7A4A26'), 0.4),
}
_tint_oak(M['oak'])
for i, col in enumerate(['#FFE066', '#FF9EC4', '#A5F0D3']):
    M[f'note{i}'] = principled(f'note{i}', image=T(f'note{i}.png'), rough=0.85)
    M[f'noteSide{i}'] = principled(f'noteSide{i}', hexc(col), 0.85)

# ───────── room
M['oak'] = scanned('cherry', 'cherry_veneer', tint=(1.0, 0.86, 0.72, 1), uv=1.0)
M['oak'].node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value = 0.3
desk = box('desk', (12, 4.2, 0.3), P(0, -0.15, 0.2), M['oak'])
# UV for the desk top: project from above
me = desk.data; uv = me.uv_layers.new(name='UVMap')
for loop in me.loops:
    co = me.vertices[loop.vertex_index].co
    uv.data[loop.index].uv = (co.x / 6.0, co.y / 6.0)
M['wall'] = scanned('plaster', 'painted_plaster_wall', tint=(1.25, 1.2, 1.14, 1), uv=6.0, normal=0.6)
wall = plane('wall', 60, 30, (0, 13.5, 7), M['wall'], rot=(math.pi / 2, 0, 0))
for poly in []: pass


# ───────── mustard armchair behind the table
fab = bpy.data.materials.new('fabric'); fab.use_nodes = True
fnt = fab.node_tree; fb = fnt.nodes['Principled BSDF']
fb.inputs['Base Color'].default_value = hexc('#E3A212'); fb.inputs['Roughness'].default_value = 0.88
fb.inputs['Sheen Weight'].default_value = 0.8; fb.inputs['Sheen Tint'].default_value = hexc('#FFE7A0')
nz = fnt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900; nz.inputs['Detail'].default_value = 2
wv = fnt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 260; wv.inputs['Distortion'].default_value = 2
mx = fnt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'ADD'
fnt.links.new(nz.outputs['Fac'], mx.inputs['Color1']); fnt.links.new(wv.outputs['Fac'], mx.inputs['Color2'])
bu = fnt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = 0.35; bu.inputs['Distance'].default_value = 0.004
fnt.links.new(mx.outputs['Color'], bu.inputs['Height']); fnt.links.new(bu.outputs['Normal'], fb.inputs['Normal'])
chair, chair_objs = import_ph('modern_arm_chair_01', (2.9, 7.4, -7.6), 10.0, rotz=math.radians(25))
for o in chair_objs:
    for sl in o.material_slots:
        if sl.material and 'pillow' in sl.material.name:
            nt = sl.material.node_tree; bsdf = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]
            src = bsdf.inputs['Base Color'].links[0].from_socket if bsdf.inputs['Base Color'].links else None
            bw = nt.nodes.new('ShaderNodeRGBToBW'); mul = nt.nodes.new('ShaderNodeMixRGB'); mul.blend_type = 'MULTIPLY'; mul.inputs['Fac'].default_value = 1.0
            mul.inputs['Color2'].default_value = hexc('#D98F00')
            mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = 0.82; mr.inputs['To Max'].default_value = 1.12
            if src: nt.links.new(src, bw.inputs['Color']); nt.links.new(bw.outputs['Val'], mr.inputs['Value']); nt.links.new(mr.outputs['Result'], mul.inputs['Color1'])
            else: mul.inputs['Color1'].default_value = (1, 1, 1, 1)
            nt.links.new(mul.outputs['Color'], bsdf.inputs['Base Color'])
            bsdf.inputs['Sheen Weight'].default_value = 0.6
# floor under the armchair
floor = box('floor', (60, 40, 0.2), (0, 6, -7.7), principled('floor', hexc('#C9A27A'), 0.5))

# ───────── laptop
base = box('lapBase', (3.2, 2.15, 0.1), P(0, 0.05, 0), M['alu'], bevel=0.04)
deck = plane('keys', 2.8, 1.04, P(0, 0.1015, -0.28), M['keys'])
pad = plane('pad', 1.15, 0.64, P(0, 0.1015, 0.6), M['pad'])
lid = link(bpy.data.objects.new('lid', None)); lid.location = P(0, 0.1, -1.07); lid.rotation_euler = (-0.24, 0, 0)
box('lidBody', (3.2, 0.07, 2.05), (0, 0, 1.025), M['alu'], bevel=0.03, parent=lid)
plane('bezel', 3.14, 1.99, (0, -0.0365, 1.025), M['glass'], rot=(math.pi / 2, 0, 0), parent=lid)
plane('lapScreen', 2.96, 1.85, (0, -0.0385, 1.04), M['lapScreen'], rot=(math.pi / 2, 0, 0), parent=lid)

# ───────── phone (animated through matrices)
phone = link(bpy.data.objects.new('phone', None))
box('phBody', (0.78, 0.075, 1.6), (0, 0, 0), M['phBack'], bevel=0.035, segs=6, parent=phone)
box('phFace', (0.74, 0.012, 1.56), (0, -0.034, 0), M['glass'], bevel=0.004, parent=phone)
plane('phScreen', 0.68, 1.48, (0, -0.0415, 0), M['phScreen'], rot=(math.pi / 2, 0, 0), parent=phone)

# ───────── props
def mug(x, z):
    me = bpy.data.meshes.new('mug'); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=64, radius1=0.28, radius2=0.3, depth=0.56)
    top = [f for f in bm.faces if f.normal.z > 0.9][0]
    ins = bmesh.ops.inset_region(bm, faces=[top], thickness=0.03)
    ext = bmesh.ops.extrude_face_region(bm, geom=[top])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.z -= 0.48
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new('mug', me)); o.location = P(x, 0.28, z); o.data.materials.append(M['mug'])
    for p in o.data.polygons: p.use_smooth = True
    md = o.modifiers.new('bevel', 'BEVEL'); md.width = 0.012; md.segments = 3; md.limit_method = 'ANGLE'
    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.035, major_segments=48, minor_segments=16)
    h = bpy.context.active_object; h.location = (x + 0.3, -z, 0.3); h.rotation_euler = (math.pi / 2, 0, 0); h.data.materials.append(M['mug'])
    for p in h.data.polygons: p.use_smooth = True
    cyl('coffee', 0.25, 0.25, 0.01, P(x, 0.5, z), M['coffee'], smooth=False)
mug(-2.35, 0.55)

def plant(x, z, s, white=False):
    root = link(bpy.data.objects.new('plant', None)); root.location = P(x, 0, z); root.scale = (s, s, s)
    cyl('pot', 0.32, 0.42, 0.7, (0, 0, 0.35), M['ceramic'] if white else M['pot'], parent=root)
    cyl('rim', 0.45, 0.45, 0.1, (0, 0, 0.72), M['ceramic'] if white else M['potRim'], parent=root)
    cyl('soil', 0.4, 0.4, 0.02, (0, 0, 0.75), M['soil'], smooth=False, parent=root)
    for i in range(44):
        a = i * 2.4 + random.random() * 0.3; tilt = 0.55 + random.random() * 0.75; hgt = 0.85 + random.random() * 0.75
        lf = plane('leaf', 0.5, 0.95, (0, 0, 0), M['leaf'], parent=root)
        rot = Matrix.Rotation(-a, 4, 'Z') @ Matrix.Rotation(math.pi / 2 - tilt, 4, 'X') @ Matrix.Rotation((random.random() - 0.5) * 0.5, 4, 'Y')
        lf.matrix_basis = Matrix.Translation((math.cos(a) * 0.18, math.sin(a) * 0.18, hgt)) @ rot @ Matrix.Translation((0, 0.3, 0))
        md = lf.modifiers.new('bend', 'SIMPLE_DEFORM'); md.deform_method = 'BEND'; md.angle = 1.1; md.deform_axis = 'X'
        lf.data.polygons[0].use_smooth = True
        sub = lf.modifiers.new('sub', 'SUBSURF'); lf.modifiers.move(1, 0); sub.levels = sub.render_levels = 3; sub.subdivision_type = 'SIMPLE'
import_ph('potted_plant_02', P(-3.0, 0, -1.45), 3.6, rotz=0.6)
import_ph('potted_plant_02', P(4.1, 0, -1.4), 2.7, rotz=2.2)
import_ph('ceramic_vase_02', P(-2.75, 0, -0.35), 4.6)

notes = [(-1.95, 1.35, 0.25), (-1.25, 1.62, -0.18), (3.3, 1.45, -0.32)]
for i, (x, z, r) in enumerate(notes):
    box(f'noteBody{i}', (0.62, 0.62, 0.012), P(x, 0.006, z), M[f'noteSide{i}'], rot=(0, 0, r))
    plane(f'noteTop{i}', 0.62, 0.62, P(x, 0.0125, z), M[f'note{i}'], rot=(0, 0, r))

nb = link(bpy.data.objects.new('notebook', None)); nb.location = P(3.25, 0, -0.75); nb.rotation_euler = (0, 0, 0.25)
box('nbCover', (1.3, 1.75, 0.09), (0, 0, 0.045), M['teal'], bevel=0.02, parent=nb)
box('nbBand', (0.08, 1.76, 0.095), (0.45, 0, 0.046), M['tealDark'], parent=nb)
pen = link(bpy.data.objects.new('pencil', None)); pen.parent = nb; pen.location = (-0.1, -0.05, 0.13); pen.rotation_euler = (0, math.pi / 2, 0.5)
cyl('shaft', 0.035, 0.035, 1.1, (0, 0, 0), M['pencil'], verts=6, parent=pen, smooth=False)
cyl('tip', 0.035, 0.0, 0.12, (0, 0, -0.61), M['wood'], verts=6, parent=pen, smooth=False)
cyl('eraser', 0.036, 0.036, 0.1, (0, 0, 0.6), M['eraser'], verts=16, parent=pen)

hp = link(bpy.data.objects.new('headphones', None)); hp.location = P(-3.6, 0, 0.9); hp.rotation_euler = (0, 0, -0.9)
bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.045, major_segments=64, minor_segments=16)
arc = bpy.context.active_object; arc.parent = hp; arc.location = (0, 0, 0.07); arc.data.materials.append(M['blue'])
for p in arc.data.polygons: p.use_smooth = True
# keep half of the torus as the headband
bm = bmesh.new(); bm.from_mesh(arc.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -0.01], context='VERTS'); bm.to_mesh(arc.data); bm.free()
for sx in (0.42, -0.42):
    cyl('cup', 0.2, 0.2, 0.14, (sx, 0, 0.07), M['blue'], parent=hp)

# leaf gobo: casts dappled shadows, invisible to the camera
gobo_mat = bpy.data.materials.new('gobo'); gobo_mat.use_nodes = True
nt = gobo_mat.node_tree; nt.nodes.clear()
outn = nt.nodes.new('ShaderNodeOutputMaterial'); mix = nt.nodes.new('ShaderNodeMixShader')
tr = nt.nodes.new('ShaderNodeBsdfTransparent'); df = nt.nodes.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = (0, 0, 0, 1)
im = nt.nodes.new('ShaderNodeTexImage'); im.image = bpy.data.images.load(T('gobo.png'))
nt.links.new(im.outputs['Alpha'], mix.inputs['Fac']); nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(df.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], outn.inputs['Surface'])
gobo_mat.blend_method = 'CLIP'

# ───────── light: Nishita sky + sun lamp aligned with it
world = bpy.data.worlds.new('sky'); scn.world = world; world.use_nodes = True
wn = world.node_tree; bg = wn.nodes['Background']
sky = wn.nodes.new('ShaderNodeTexSky'); sky.sky_type = 'NISHITA'; sky.sun_disc = False
sun_dir = (P(-9, 5.5, 2.2) - P(0.2, 0, -0.9)).normalized()
sky.sun_elevation = math.asin(sun_dir.z); sky.sun_rotation = math.atan2(sun_dir.x, sun_dir.y) * -1 + math.pi
sky.air_density = 1.0; sky.dust_density = 2.0; sky.altitude = 100
env = wn.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(os.path.join(PH, 'photo_studio_loft_hall', 'photo_studio_loft_hall_2k.hdr'))
mpw = wn.nodes.new('ShaderNodeMapping'); tcw = wn.nodes.new('ShaderNodeTexCoord'); mpw.inputs['Rotation'].default_value = (0, 0, math.radians(70))
wn.links.new(tcw.outputs['Generated'], mpw.inputs['Vector']); wn.links.new(mpw.outputs['Vector'], env.inputs['Vector'])
wn.links.new(env.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.55

sun_data = bpy.data.lights.new('sun', 'SUN'); sun_data.energy = 14.0; sun_data.angle = math.radians(0.25); sun_data.color = (1.0, 0.8, 0.56)
sun = link(bpy.data.objects.new('sun', sun_data))
sun.rotation_euler = (-sun_dir).to_track_quat('-Z', 'Y').to_euler()
sky_data = bpy.data.lights.new('window', 'AREA'); sky_data.energy = 480; sky_data.shape = 'RECTANGLE'; sky_data.size = 5; sky_data.size_y = 3; sky_data.color = (0.86, 0.93, 1.0)
win = link(bpy.data.objects.new('window', sky_data)); win.location = P(-7.5, 2.6, 0.5)
win.rotation_euler = (P(0, 0.8, -0.8) - win.location).to_track_quat('-Z', 'Y').to_euler()
fill_data = bpy.data.lights.new('fill', 'AREA'); fill_data.energy = 150; fill_data.size = 6; fill_data.color = (1.0, 0.95, 0.88)
fill = link(bpy.data.objects.new('fill', fill_data)); fill.location = P(5, 3.5, 6)
fill.rotation_euler = (P(0, 0.6, 0) - fill.location).to_track_quat('-Z', 'Y').to_euler()

im.image = bpy.data.images.load(T('window.png'))
gobo = plane('gobo', 60, 60, P(1.0, 1.2, -5.5) + sun_dir * 22.0, gobo_mat)
gobo.rotation_euler = sun_dir.to_track_quat('Z', 'Y').to_euler()
GOBO_BASE = gobo.location.copy(); GOBO_SIDE = sun_dir.cross(Vector((0, 0, 1))).normalized() * 0.15
gobo.visible_camera = False; gobo.visible_diffuse = False; gobo.visible_glossy = False; gobo.visible_transmission = False
gobo.hide_render = True  # direct sun instead; window bars below cast the frame stripes
_right = sun_dir.cross(Vector((0, 0, 1))).normalized(); _up = _right.cross(sun_dir).normalized()
_c = P(0.6, 1.0, -2.5) + sun_dir * 14.0
bar_mat = principled('bar', hexc('#000000'), 1.0)
for i, (off, horiz) in enumerate([(-2.1, False), (0.0, False), (2.1, False), (1.1, True)]):
    b = box(f'winbar{i}', (0.22, 0.22, 26) if not horiz else (26, 0.22, 0.22), (0, 0, 0), bar_mat)
    rot = Matrix((_right, sun_dir, _up)).transposed().to_4x4()
    b.matrix_world = Matrix.Translation(_c + (_up * off if horiz else _right * off)) @ rot
    b.visible_camera = False; b.visible_diffuse = False; b.visible_glossy = False; b.visible_transmission = False

# ───────── camera
cam_data = bpy.data.cameras.new('cam'); cam_data.sensor_fit = 'VERTICAL'; cam_data.angle_y = math.radians(30)
cam_data.clip_start = 0.05; cam_data.clip_end = 80
cam_data.dof.use_dof = True; cam_data.dof.aperture_fstop = 2.4
cam = link(bpy.data.objects.new('cam', cam_data)); scn.camera = cam
target = link(bpy.data.objects.new('target', None))
tc = cam.constraints.new('TRACK_TO'); tc.target = target; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
cam_data.dof.focus_object = target

# ───────── voxel logo + confetti
def rounded_cube_mesh(name):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    return me
vox_me = rounded_cube_mesh('vox')
col_mats = {}
def colmat(h, rough=0.32):
    if h not in col_mats: col_mats[h] = principled('c' + h, hexc(h), rough)
    return col_mats[h]
meta = anim['meta']
logo_objs, conf_objs = [], []
for i, h in enumerate(meta['logoColors']):
    o = link(bpy.data.objects.new(f'v{i}', vox_me))
    logo_objs.append((o, h))
for i, h in enumerate(meta['confColors']):
    o = link(bpy.data.objects.new(f'c{i}', vox_me)); conf_objs.append((o, h))
# per-object materials via object-linked slots
vox_me.materials.append(colmat('#FFFFFF'))
for o, h in logo_objs + conf_objs:
    o.material_slots[0].link = 'OBJECT'; o.material_slots[0].material = colmat(h)
bev = None
for o, _ in logo_objs:
    md = o.modifiers.new('bevel', 'BEVEL'); md.width = 0.12; md.segments = 3; md.limit_method = 'NONE'

# ───────── keyframes
def key_matrix(o, m, f):
    o.matrix_world = m
    o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f); o.keyframe_insert('scale', frame=f)
for f, fr in enumerate(anim['frames'], start=1):
    cam.location = P(*fr['cam']); cam.keyframe_insert('location', frame=f)
    target.location = P(*fr['look']); target.keyframe_insert('location', frame=f)
    key_matrix(phone, m_three(fr['phone']), f)
    if 'sway' in fr:
        gobo.location = GOBO_BASE + GOBO_SIDE * fr['sway']; gobo.keyframe_insert('location', frame=f)
    for group, objs in (('logo', logo_objs), ('conf', conf_objs)):
        data = fr[group]
        if data is None:
            nxt = anim['frames'][f] if f < N else None
            if nxt is not None and nxt[group] is not None:  # hidden key right before it appears
                for o, _ in objs:
                    o.scale = (0, 0, 0); o.keyframe_insert('scale', frame=f)
            continue
        for (o, _), arr in zip(objs, data):
            key_matrix(o, m_three(arr), f)
for o, _ in logo_objs + conf_objs:
    if not o.animation_data:
        o.scale = (0, 0, 0)

os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'duoforge_day.blend'))

# ───────── render
os.makedirs(os.path.join(OUT, 'frames'), exist_ok=True)
frames = range(1, N + 1) if WHICH == 'all' else [int(x) for x in WHICH.split(',')]
import time
for f in frames:
    if WHICH == 'all' and os.path.exists(os.path.join(OUT, 'frames', f'{f:04d}.jpg')) and f != frames[-1] and os.path.exists(os.path.join(OUT, 'frames', f'{f + 1:04d}.jpg')):
        continue  # resume: keep finished frames (the newest one is redone in case it was cut off)
    t0 = time.time()
    scn.frame_set(f)
    scn.render.filepath = os.path.join(OUT, 'frames', f'{f:04d}.jpg')
    bpy.ops.render.render(write_still=True)
    print(f'FRAME {f} {time.time() - t0:.1f}s', flush=True)
