# webretro
[RetroArch](https://github.com/libretro) ported to WASM with emscripten!  
[Demo](https://binbashbanana.github.io/webretro/)

This was initially part of [gfiles](https://github.com/BinBashBanana/gfiles), but I decided to split it off.

These 5 cores are included with the repository (ROMs **NOT** included):
* Genesis Plus GX (Genesis / MD)
* mGBA (GBA, GB, GBC)
* Mupen64plus Next (N64, broken but playable)
* Nestopia (NES)
* Snes9x (SNES)

## How to use

The asset bundle will be fetched from GitHub using jsdelivr by default. You can change this option on line 8 of `assets/base.js` (example alternate value: `"./"`).

Query string options:
* `core` - specify the libretro core to use, i.e. `genesis_plus_gx`, `mgba`, `mupen64plus_next`, `nestopia`, `snes9x` (if not specified, the user will be shown a list of the default cores).
* `rom` - will attempt to fetch a rom from the `./roms/` dir on the server or an absolute url (including protocol), e.g. `mario3.nes` (if not specified, the user will be prompted to upload a rom).
* `nobundle` if this exists, the bundle fetch will be skipped.
* `console` if this exists, the console window will open on load.

Example OK query uris:
* `?core=snes9x&rom=dkc.smc&nobundle&console`
* `?core=mgba&rom=https://example.com/marioadvance2.gba`
* `?core=mupe64plus_next&nobundle`
* `?core=genesis_plus_gx`
* `?`

## Additional

* Importing/Exporting of save states is supported.
* SRAM is saved to localStorage per rom name. (Autosaves every 5 minutes by default)
* The keybindings are remapped so that all the inputs should be supported by a normal keyboard, but can be changed on line 9 of `assets/base.js`:
<img src="./assets/controller_layout.png" alt="Controller Layout Map" width="600" />