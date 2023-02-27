How to use
======
>exmple:[**Official Instance**](https://binbashbanana.github.io/webretro/m.html)

way 1
=====
```html
<div id="emu-webretro" class="webretro" style="position: fixed;width:100%;height: 100%;"></div>
<script type="text/javascript" src="https://binbashbanana.github.io/webretro/assets/Mobile/Module.js"></script>

```
way 2
====
```html
<div id="emu-webretro" class="webretro" style="position: fixed;width:100%;height: 100%;"></div>
<script type="text/javascript">
    var emu_system = "";
    var emu_rom = "";
    var emu_bios = [];
</script>
<script type="text/javascript" src="https://binbashbanana.github.io/webretro/assets/Mobile/Module.js"></script>

```

way3
====
```html
<div id="emu-webretro" class="webretro" style="position: fixed;width:100%;height: 100%;"></div>
<script type="text/javascript" src="https://binbashbanana.github.io/webretro/assets/Mobile/Module.js?rom=xx.gbc&system=mgba"></script>

```

way4
====
> yousite/m.html?rom=xx.gbc&system=mgba
