"""
STL -> GLB for the 3D tab.

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
      --python scripts/stl-to-glb.py -- <out.glb> <tri-budget> <in.stl> [more.stl ...]

Several STLs are joined, so multi-part prints can go in together as long as the
files already share a coordinate space. The mesh is decimated to the budget,
centred, and normalised to 1 unit on its longest axis so the viewer framing is
the same for every model. Exported without Draco on purpose — the decoder is a
~250KB download and these meshes are small enough not to need it.
"""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
dst, budget, sources = argv[0], int(argv[1]), argv[2:]

bpy.ops.wm.read_factory_settings(use_empty=True)
for src in sources:
    bpy.ops.import_mesh.stl(filepath=src)

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
if len(bpy.context.selected_objects) > 1:
    bpy.ops.object.join()

ob = bpy.context.view_layer.objects.active
before = len(ob.data.polygons)
if before > budget:
    mod = ob.modifiers.new("decimate", 'DECIMATE')
    mod.ratio = budget / before
    bpy.ops.object.modifier_apply(modifier=mod.name)

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
ob.location = (0, 0, 0)
longest = max(ob.dimensions)
if longest:
    ob.scale = [1.0 / longest] * 3
bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
bpy.ops.object.shade_smooth()

# STL carries no colour, so give every model the same neutral resin material.
mat = bpy.data.materials.new("resin")
mat.use_nodes = True
shader = mat.node_tree.nodes["Principled BSDF"]
shader.inputs["Base Color"].default_value = (0.58, 0.59, 0.63, 1)
shader.inputs["Roughness"].default_value = 0.42
ob.data.materials.append(mat)

bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_apply=True)
print(f"RESULT before={before} after={len(ob.data.polygons)}")
