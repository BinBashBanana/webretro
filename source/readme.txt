Core building instructions
----------------------------------------

Per-core:

Core repository:
emmake make -f Makefile.libretro platform="emscripten"
OR
(sometimes omit this) cd libretro
emmake make -f Makefile platform="emscripten"

Copy the .bc file into RetroArch/dist-scripts

RetroArch repository (batch of multiple is ok):
cd dist-scripts
emmake ./dist-cores.sh emscripten

Output will be in RetroArch/pkg/emscripten/

----------------------------------------

You should merge the files from overrides/ into the RetroArch repository and some cores if they need it.