#!/usr/bin/env bash
# Regenerate every GLB in public/models/ from the source STLs.
#
#   ./scripts/build-models.sh [path-to-3d-printing-folder]
#
# Columns: output-name | triangle-budget | source STL(s), ':'-separated.
# Several sources are joined — parts exported from one design share a
# coordinate space, which is how the "Assembled" entries are built.
set -euo pipefail

SRC_ROOT="${1:-$HOME/Documents/This is Home/3D Printing}"
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/models"
mkdir -p "$OUT"

MODELS='
artemis-badge|40000|Artemis Badge/Artemis Badge v1.stl
baby-artemis|40000|Artemis SLS/Baby Stls/Baby Artemis.stl
catalina-planter|25000|Planter/Planter 1.stl
starship-mini|40000|Starship/Starship 4.stl
vw-thing-assembled|45000|VW Thing/V1/Yellow/Thing Body 5.stl:VW Thing/V1/Black/Front Seats 2.stl:VW Thing/V1/Black/Steering Wheel.stl:VW Thing/V1/Black/Bumper - Front.stl:VW Thing/V1/Black/Bumper - Rear.stl
vw-thing-body|25000|VW Thing/V1/Yellow/Thing Body 5.stl
vw-thing-seats|20000|VW Thing/V1/Black/Front Seats 2.stl
vw-thing-steering-wheel|20000|VW Thing/V1/Black/Steering Wheel.stl
vw-thing-tire|20000|VW Thing/V1/Black/Tire (6).stl
vw-thing-rim|20000|VW Thing/V1/White/Rim (6).stl
stubby-rod-assembled|45000|Pencil Car/stl/Yellow Wood.stl:Pencil Car/stl/Tan Wood 2.stl:Pencil Car/stl/Graphite.stl:Pencil Car/stl/Eraser.stl:Pencil Car/stl/Ferrule.stl
stubby-rod-body|22000|Pencil Car/stl/Yellow Wood.stl
stubby-rod-graphite|15000|Pencil Car/stl/Graphite.stl
stubby-rod-eraser|15000|Pencil Car/stl/Eraser.stl
stubby-rod-ferrule|22000|Pencil Car/stl/Ferrule.stl
stubby-rod-tire|20000|Pencil Car/stl/Front Tire (2x).stl
stubby-rod-rim|20000|Pencil Car/stl/Front Rim (2x).stl
cross-shadow-box-box|20000|Cross Box/Cross Box v1.stl
cross-shadow-box-cross|8000|Cross Box/Cross.stl
'

echo "$MODELS" | while IFS='|' read -r name budget sources; do
  [ -z "$name" ] && continue
  args=(); missing=0
  IFS=':' read -ra parts <<< "$sources"
  for part in "${parts[@]}"; do
    if [ -f "$SRC_ROOT/$part" ]; then args+=("$SRC_ROOT/$part")
    else echo "  ! missing: $part"; missing=1; fi
  done
  [ "$missing" = 1 ] && { echo "$name SKIPPED"; continue; }
  "$BLENDER" -b --factory-startup --python "$(dirname "$0")/stl-to-glb.py" -- \
    "$OUT/$name.glb" "$budget" "${args[@]}" >/dev/null 2>&1
  printf '%-26s %s\n' "$name" "$(du -h "$OUT/$name.glb" | cut -f1)"
done
