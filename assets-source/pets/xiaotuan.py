"""Rebuild the original Xiaotuan model and its GLB in Blender 5.2."""
import bpy
import math
import os
import json
import struct
import sys
from mathutils import Vector


args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
bpy.context.preferences.filepaths.save_version = 0
out_dir = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(os.path.join(out_dir, '..', '..'))
preview_dir = os.path.join(out_dir, 'previews')
os.makedirs(preview_dir, exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def mat(name, color, roughness=0.82):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*color, 1)
    item.use_nodes = True
    shader = item.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    return item


cloud = mat('Cloud lilac body', (0.83, 0.79, 0.98))
belly = mat('Pearl belly', (0.98, 0.97, 1.0))
mint = mat('Mint ear and leaf', (0.53, 0.85, 0.78))
lilac = mat('Lilac ear and leaf', (0.69, 0.57, 0.94))
eyes = mat('Plum eyes', (0.16, 0.13, 0.23), 0.32)
shine = mat('Eye light', (1, 1, 1), 0.25)
blush = mat('Rose cheeks', (0.96, 0.63, 0.75))
cloth = mat('Accessory lavender', (0.63, 0.47, 0.83))
gold = mat('Star gold', (0.99, 0.81, 0.43), 0.48)

root = bpy.data.objects.new('PetRoot', None)
bpy.context.collection.objects.link(root)


def group(name, parent=root, scale=1):
    ob = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(ob)
    ob.parent = parent
    ob.scale = (scale,) * 3
    return ob


def ellipsoid(name, location, scale, material, parent=root):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=location)
    ob = bpy.context.object
    ob.name = name
    ob.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(material)
    ob.parent = parent
    return ob


def hinge(name, location, parent=root):
    """Put a visible part on a local pivot so clips can move it without sliding the mesh origin."""
    ob = group(name, parent)
    ob.location = location
    return ob


def tube(name, coords, radius, material, parent=root, closed=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('POLY')
    spline.points.add(len(coords) - 1)
    for point, coord in zip(spline.points, coords):
        point.co = (*coord, 1)
    spline.use_cyclic_u = closed
    ob = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    ob.parent = parent
    return ob


body = group('Body')
ellipsoid('BodyShell', (0, 0, 1.03), (0.94, 0.70, 0.86), cloud, body)
for sign, color in [(-1, lilac), (1, mint)]:
    ear = hinge('EarLeft' if sign < 0 else 'EarRight', (sign * 0.52, 0.02, 1.58))
    ear_shell = ellipsoid('EarShell', (sign * 0.13, 0.03, 0.37), (0.25, 0.17, 0.54), color, ear)
    ear_shell.rotation_euler[1] = sign * -0.40
    inner = ellipsoid('EarInner', (sign * 0.13, -0.145, 0.41), (0.14, 0.045, 0.37), blush, ear)
    inner.rotation_euler[1] = sign * -0.40
    foot = hinge('FootLeft' if sign < 0 else 'FootRight', (sign * 0.34, -0.02, 0.36))
    ellipsoid('FootMesh', (sign * 0.13, -0.13, -0.13), (0.25, 0.29, 0.15), color, foot)
    arm = group('ArmLeft' if sign < 0 else 'ArmRight')
    arm.location = (sign * 0.77, 0, 0.93)
    paw = ellipsoid('PawMesh', (sign * 0.15, -0.08, -0.13), (0.26, 0.23, 0.20), cloud, arm)
    paw.rotation_euler[0] = 0.20
    ellipsoid(('CheekLeft' if sign < 0 else 'CheekRight'), (sign * 0.59, -0.519, 1.04), (0.17, 0.026, 0.085), blush)
    ellipsoid(('EyeLeft' if sign < 0 else 'EyeRight'), (sign * 0.36, -0.689, 1.25), (0.085, 0.045, 0.12), eyes)
    ellipsoid(('EyeLightLeft' if sign < 0 else 'EyeLightRight'), (sign * 0.34, -0.734, 1.30), (0.025, 0.014, 0.03), shine)

# Two leaves make the existing illustrated tuft legible from the side as well.
for name, sign, material in [('LeafLeft', -1, mint), ('LeafRight', 1, lilac)]:
    leaf = hinge(name, (0, 0, 1.95))
    mesh = ellipsoid('LeafMesh', (sign * 0.15, -0.03, 0.08), (0.23, 0.10, 0.14), material, leaf)
    mesh.rotation_euler[1] = sign * 0.28
    for vertex in mesh.data.vertices:
        outward = max(0, sign * vertex.co.x / 0.23)
        vertex.co.y *= 1 - 0.65 * outward
        vertex.co.z *= 1 - 0.65 * outward
        vertex.co.z += 0.10 * outward
tube('Smile', [(-0.13, -0.688, 0.97), (-0.06, -0.720, 0.92), (0.06, -0.720, 0.92), (0.13, -0.688, 0.97)], 0.020, eyes)

# Optional wardrobes keep full local transforms in glTF. The app owns visibility.
beret = group('Beret')
ellipsoid('BeretCrown', (0, -0.02, 2.16), (0.48, 0.32, 0.15), cloth, beret)
ellipsoid('BeretBrim', (0, -0.07, 2.07), (0.50, 0.34, 0.045), lilac, beret)
ellipsoid('BeretStem', (0.08, 0, 2.32), (0.045, 0.045, 0.10), cloth, beret)
halo = group('Halo')
coords = [(0.54 * math.cos(i * math.tau / 40), 0.31 * math.sin(i * math.tau / 40), 2.43) for i in range(40)]
tube('HaloRing', coords, 0.025, gold, halo, closed=True)
ellipsoid('HaloStar', (0.49, -0.16, 2.44), (0.075, 0.04, 0.075), shine, halo)
scarf = group('Scarf')
ellipsoid('ScarfBand', (0, -0.50, 0.64), (0.70, 0.18, 0.11), cloth, scarf)
ellipsoid('ScarfTail', (0.30, -0.66, 0.40), (0.13, 0.08, 0.28), cloth, scarf)
bow = group('Bow')
for sign in (-1, 1):
    ellipsoid('BowWing', (sign * 0.16, -0.70, 0.65), (0.20, 0.08, 0.13), cloth, bow)
ellipsoid('BowKnot', (0, -0.79, 0.65), (0.085, 0.09, 0.08), belly, bow)

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 48


# Local controls stay on the exclusive character. Missing curves keep the rest pose.
CLIP_CONTROLS = (
    'PetRoot', 'Body', 'EarLeft', 'EarRight', 'LeafLeft', 'LeafRight',
    'ArmLeft', 'ArmRight', 'FootLeft', 'FootRight',
)


def clip(name, curves):
    controls = [bpy.data.objects[control] for control in CLIP_CONTROLS]
    rest_pose = {ob: (ob.location.copy(), ob.rotation_euler.copy()) for ob in controls}
    for ob in controls:
        if ob.animation_data:
            ob.animation_data.action = None
    for control, channel, samples in curves:
        ob = bpy.data.objects[control]
        for frame, value in samples:
            if channel == 'location.z':
                ob.location.z = value
                ob.keyframe_insert(data_path='location', index=2, frame=frame)
            else:
                index = {'x': 0, 'y': 1, 'z': 2}[channel]
                ob.rotation_euler[index] = value
                ob.keyframe_insert(data_path='rotation_euler', index=index, frame=frame)
    for ob in controls:
        action = ob.animation_data.action if ob.animation_data else None
        if action is None:
            continue
        # Blender groups a whole transform when one axis is keyed; keep only authored axes.
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in list(bag.fcurves):
                        if not curve.keyframe_points:
                            bag.fcurves.remove(curve)
        action.name = name
        track = ob.animation_data.nla_tracks.new()
        track.name = name
        strip = track.strips.new(name, 1, action)
        strip.action_frame_start = 1
        strip.action_frame_end = 48
        ob.animation_data.action = None
    for ob, (location, rotation) in rest_pose.items():
        ob.location = location
        ob.rotation_euler = rotation


# Loops start and end on the rest pose so crossfades do not pop.
clip('idle', [
    ('PetRoot', 'location.z', [(1, 0), (24, 0.035), (48, 0)]),
    ('PetRoot', 'z', [(1, 0), (24, 0.012), (48, 0)]),
    ('Body', 'x', [(1, 0), (24, 0.025), (48, 0)]),
    ('EarLeft', 'z', [(1, 0), (24, 0.05), (48, 0)]),
    ('EarRight', 'z', [(1, 0), (24, -0.05), (48, 0)]),
    ('LeafLeft', 'z', [(1, 0), (24, 0.06), (48, 0)]),
    ('LeafRight', 'z', [(1, 0), (24, -0.06), (48, 0)]),
    ('ArmLeft', 'y', [(1, 0), (24, 0.04), (48, 0)]),
    ('ArmRight', 'y', [(1, 0), (24, -0.04), (48, 0)]),
])
clip('happy', [
    ('PetRoot', 'location.z', [(1, 0), (12, 0.13), (24, 0.03), (36, 0.13), (48, 0)]),
    ('PetRoot', 'z', [(1, 0), (12, -0.10), (24, 0.08), (36, -0.10), (48, 0)]),
    ('Body', 'x', [(1, 0), (12, -0.05), (24, 0.02), (36, -0.05), (48, 0)]),
    ('EarLeft', 'z', [(1, 0), (12, 0.18), (24, 0.04), (36, 0.18), (48, 0)]),
    ('EarRight', 'z', [(1, 0), (12, -0.18), (24, -0.04), (36, -0.18), (48, 0)]),
    ('LeafLeft', 'z', [(1, 0), (12, 0.22), (24, 0.05), (36, 0.22), (48, 0)]),
    ('LeafRight', 'z', [(1, 0), (12, -0.22), (24, -0.05), (36, -0.22), (48, 0)]),
    ('ArmLeft', 'y', [(1, 0), (12, 0.8), (24, 0.2), (36, 0.8), (48, 0)]),
    ('ArmRight', 'y', [(1, 0), (12, -0.8), (24, -0.2), (36, -0.8), (48, 0)]),
    ('FootLeft', 'x', [(1, 0), (12, -0.18), (24, 0), (36, -0.18), (48, 0)]),
    ('FootRight', 'x', [(1, 0), (12, -0.18), (24, 0), (36, -0.18), (48, 0)]),
])
clip('look', [
    ('PetRoot', 'y', [(1, 0), (16, 0.22), (32, 0.22), (48, 0)]),
    ('EarLeft', 'z', [(1, 0), (16, 0.08), (32, 0.08), (48, 0)]),
    ('EarRight', 'z', [(1, 0), (16, 0.12), (32, 0.12), (48, 0)]),
    ('LeafLeft', 'z', [(1, 0), (16, 0.06), (32, 0.06), (48, 0)]),
    ('LeafRight', 'z', [(1, 0), (16, -0.04), (32, -0.04), (48, 0)]),
])
clip('rest', [
    ('PetRoot', 'location.z', [(1, 0), (16, -0.08), (48, -0.08)]),
    ('PetRoot', 'x', [(1, 0), (16, 0.16), (48, 0.16)]),
    ('EarLeft', 'x', [(1, 0), (16, 0.28), (48, 0.28)]),
    ('EarRight', 'x', [(1, 0), (16, 0.28), (48, 0.28)]),
    ('LeafLeft', 'x', [(1, 0), (16, 0.12), (48, 0.12)]),
    ('LeafRight', 'x', [(1, 0), (16, 0.12), (48, 0.12)]),
    ('ArmLeft', 'x', [(1, 0), (16, 0.35), (48, 0.35)]),
    ('ArmRight', 'x', [(1, 0), (16, 0.35), (48, 0.35)]),
])
clip('walk', [
    ('PetRoot', 'location.z', [(1, 0), (12, 0.07), (24, 0), (36, 0.07), (48, 0)]),
    ('PetRoot', 'z', [(1, 0), (12, 0.06), (24, 0), (36, -0.06), (48, 0)]),
    ('Body', 'x', [(1, 0), (12, 0.08), (24, 0), (36, -0.08), (48, 0)]),
    ('EarLeft', 'x', [(1, 0), (12, 0.10), (24, 0), (36, -0.10), (48, 0)]),
    ('EarRight', 'x', [(1, 0), (12, -0.10), (24, 0), (36, 0.10), (48, 0)]),
    ('ArmLeft', 'x', [(1, 0), (12, 0.55), (24, 0), (36, -0.35), (48, 0)]),
    ('ArmRight', 'x', [(1, 0), (12, -0.35), (24, 0), (36, 0.55), (48, 0)]),
    ('FootLeft', 'y', [(1, 0), (12, -0.95), (24, 0), (36, 0.35), (48, 0)]),
    ('FootRight', 'y', [(1, 0), (12, 0.35), (24, 0), (36, -0.95), (48, 0)]),
])

# Save the editable model before adding render-only objects.
blend_path = os.path.join(out_dir, 'xiaotuan.blend')
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
glb_path = os.path.join(repo, 'public', 'pets', 'xiaotuan.glb')
os.makedirs(os.path.dirname(glb_path), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB', export_animations=True, export_nla_strips=True)


def merge_animation_tracks(path):
    """Combine Blender's per-object NLA exports into two complete named clips."""
    raw = open(path, 'rb').read()
    magic, version, _ = struct.unpack_from('<4sII', raw)
    assert magic == b'glTF' and version == 2
    offset = 12
    chunks = []
    while offset < len(raw):
        length, kind = struct.unpack_from('<I4s', raw, offset)
        offset += 8
        chunks.append((kind, raw[offset:offset + length]))
        offset += length
    doc = json.loads(chunks[0][1])
    merged = {}
    for animation in doc['animations']:
        name = animation['name'].split('.')[0]
        if name not in merged:
            merged[name] = {'name': name, 'samplers': [], 'channels': []}
        target = merged[name]
        shift = len(target['samplers'])
        target['samplers'].extend(animation['samplers'])
        target['channels'].extend({**channel, 'sampler': channel['sampler'] + shift} for channel in animation['channels'])
    assert set(merged) == {'idle', 'happy', 'walk', 'look', 'rest'}
    doc['animations'] = list(merged.values())
    json_bytes = json.dumps(doc, separators=(',', ':')).encode('utf-8')
    json_bytes += b' ' * (-len(json_bytes) % 4)
    chunks[0] = (b'JSON', json_bytes)
    payload = b''.join(struct.pack('<I4s', len(chunk), kind) + chunk for kind, chunk in chunks)
    with open(path, 'wb') as file:
        file.write(struct.pack('<4sII', b'glTF', 2, 12 + len(payload)) + payload)


merge_animation_tracks(glb_path)

if '--preview' in args:
    for accessory in (beret, halo, scarf, bow):
        accessory.scale = (0, 0, 0)
    world = bpy.data.worlds.new('Preview world')
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.30, 0.34, 0.42, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 20
    scene.render.resolution_x = 520
    scene.render.resolution_y = 520
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    camera_data = bpy.data.cameras.new('Preview camera')
    camera = bpy.data.objects.new('Preview camera', camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    camera_data.type = 'ORTHO'
    camera_data.ortho_scale = 3.25
    lamp_data = bpy.data.lights.new('Softbox', 'AREA')
    lamp = bpy.data.objects.new('Softbox', lamp_data)
    bpy.context.collection.objects.link(lamp)
    lamp.location = (2, -4, 5)
    lamp_data.energy = 550
    lamp_data.shape = 'DISK'
    lamp_data.size = 5
    for name, pos in [('front', (0, -5, 2.0)), ('side', (5, 0, 2.0)), ('back', (0, 5, 2.0))]:
        camera.location = pos
        target = Vector((0, 0, 1.15))
        camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(preview_dir, f'xiaotuan_{name}.png')
        bpy.ops.render.render(write_still=True)

print('XIAOTUAN_OUTPUT', blend_path, glb_path, preview_dir)
