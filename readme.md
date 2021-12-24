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

The asset bundle will be fetched from GitHub using jsdelivr by default. You can change this option on line 10 and 11 of `assets/base.js` (example alternate value: `"./"`).

Query string options:
* `core` - specify the libretro core to use, i.e. `genesis_plus_gx`, `mgba`, `mupen64plus_next`, `nestopia`, `snes9x`. `autodetect` can also be used, which attempts to find the correct core for the ROM (slower to load because the core is loaded after the ROM) (if not specified, the user will be shown a list of the default cores).
* `system` - same as above, but will attempt to detect the core based on the specified system, i.e. `gba`, `genesis`, `nes`, `nintendo 64`, `snes`. If both `core` and `system` are specified, `core` will override `system`.
* `rom` - will attempt to fetch a ROM from the `./roms/` directory on the server, or an absolute url (including protocol), e.g. `mario3.nes` (if not specified, the user will be prompted to upload a ROM).
* `nobundle` if this exists, the bundle fetch will be skipped.
* `console` if this exists, the console window will open on load.

Example OK query uris:
* `?core=snes9x&rom=dkc.smc&nobundle&console`
* `?core=mgba&rom=https://example.com/marioadvance3.zip`
* `?core=autodetect&rom=supermarioworld.sfc`
* `?core=autodetect&nobundle`
* `?core=genesis_plus_gx`
* `?`

## Embed API

You can easily embed webretro on your site by using the api provided in `embed/embed.js`. You can see an example of it [here](https://binbashbanana.github.io/webretro/embed/embed-example.html).

How to use: `webretroEmbed(domNodeToAppendTo, webretroPath, queries)` (returns the new iframe node that it creates)
* `domNodeToAppendTo` - the element that you want webretro to appear in.
* `webretroPath` - the path to the index of the webretro instance.
* `queries` - object containing the query string options shown above.

## Additional

* The user can upload their ROM directly, or using Google Drive/Dropbox/OneDrive.
* Importing/Exporting of save states and SRAM is supported.
* States and SRAM are saved to indexedDB per ROM name. (SRAM autosaves every 5 minutes by default)
* ROMs can be inside of zip files (The ROM file name is used in this case, instead of the zip file name).
* Users can take screenshots, and download them individually, or all at once.
* Users can recover saves or states from roms that were lost or renamed.
* Cheat codes are supported.
* SMAS brick fix should automatically be softpatched to SMAS ROMs.
* The keybinds are remapped so that all the inputs should be supported by a normal keyboard, but can be changed by the user. The default keybinds can be changed on line 12 of `assets/base.js`:
<img src="./assets/controller_layout.png" alt="Controller Layout Map" width="600" />