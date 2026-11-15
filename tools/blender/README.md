# Blender pipeline for the scroll footage

The hero loop, the push into the laptop and the pull back out are rendered in Blender (Cycles)
and played on the site as scroll-scrubbed frames.

| File | What it does |
| --- | --- |
| `scene-export/day.ts` + `day.html` | Draws the laptop/phone screen animations and defines the camera paths (`clipData`). |
| `export.js` | Opens `day.html` in a headless browser and writes screens, textures and `anim.json` per clip. |
| `polyhaven_get.py` | Downloads the CC0 Poly Haven assets (plant, vase, armchair, wood, plaster, HDRI) into `assets/`. |
| `gen_window.py` | Makes the window-light texture. |
| `build.py` | Builds the scene and renders: `blender -b -P build.py -- <clip dir> <out dir> all 32 67`. |
| `denoise.py` | Cleans each frame with Intel Open Image Denoise (`pip install oidn`). |

Assets used (all CC0, polyhaven.com): `photo_studio_loft_hall`, `modern_arm_chair_01`,
`potted_plant_02`, `ceramic_vase_02`, `cherry_veneer`, `painted_plaster_wall`.

Notes: needs Blender 4.0+, `numpy` for Blender's Python (glTF import), and about 40 s per frame on 4 CPU cores.
This folder is a record of how the footage was made; it still needs tidying into one command.
