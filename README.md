# np2-wasm

English | [日本語](README_ja.md)

This is a PC-9801 / PC-9821 emulator based on [Neko Project II](http://www.yui.ne.jp/np2/) that runs in a web browser.

## Demo

https://irori.github.io/np2-wasm/

## Custom Element API

`elements.js` defines two custom elements, `<PC-9801>` and `<PC-9821>`.

### Example

The following example embeds a PC-9801 emulator with a CPU clock of 12.5MHz and 2MB of memory into the page, and boots it with `image.d88` set in floppy disk drive 1.

```html
<!DOCTYPE html>
<html>
 <body>
  <script src="https://unpkg.com/np2-wasm/dist/elements.js" type="module"></script>
  <!-- Use <PC-9821> instead of <PC-9801> for PC-9821 emulation -->
  <PC-9801 cpu-clock="12.5MHz" memory="2MB" fdd1="image.d88"></PC-9801>
 </body>
</html>
```

### Attributes

#### `cpu-clock`
Specifies the CPU clock frequency in MHz. You can specify it as `12.5MHz` or `12.5`, both mean the same.

#### `memory`
Specifies the memory size in MB. You can specify it as `2MB` or `2`, both mean the same.

#### `fdd1`, `fdd2`
Specifies the URL of the disk image to be set in the floppy disk drive. Due to the
[same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy),
disk images from other sites cannot be loaded.

#### `hdd1`, `hdd2`
Specifies the URL of the disk image to be set in the hard disk drive. Due to the
[same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy),
disk images from other sites cannot be loaded.

#### `no-mouse`
Disables the mouse and prevents pointer lock when clicked on the emulator screen.

## JavaScript API

### Example

example.html:

```html
<!DOCTYPE html>
<html>
 <body>
  <canvas id="canvas"></canvas> <!-- The screen will be drawn on this canvas -->
  <script type="module" src="example.js"></script>
 </body>
</html>
```

example.js:

```js
import { NP2, NP21 } from "https://unpkg.com/np2-wasm/dist/np2-wasm.js";

// Create an NP2 instance specifying a canvas
const canvas = document.getElementById('canvas');
// Change this to NP21.create() if i386 emulation is needed
const np2 = await NP2.create({ canvas });

// Load a floppy disk image
const resp = await fetch('image.d88');
const data = new Uint8Array(await resp.arrayBuffer());
np2.addDiskImage('image.d88', data);

// Set the disk image to FD drive 0
np2.setFdd(0, 'image.d88');

// Run the emulator
np2.run();
```

### Reference
#### NP2.create(config: NP2Config): Promise\<NP2>
Creates a new instance of `NP2`. `config` is an object that has the following attributes:

##### canvas: HTMLCanvasElement
The `<canvas>` element that displays the screen of the emulator.

##### onDiskChange: (name: string) => void
A callback function that is called when a write operation is performed to the disk image.
The modified image can be retrieved with the `getDiskImage()` method.

##### onExit: () => void
A callback called when the emulator is powered off.
After exit, you can restart the emulator with `reset()`.

##### clk_base: number (default=2457600)
Specifies the base clock (Hz) of the CPU. Either 1996800 or 2457600 can be specified.

##### clk_mult: number (default=4)
Specifies the multiplication factor for the CPU. The actual CPU speed will be the product of this value and the base clock.

##### ExMemory: number (default=1)
Specifies the capacity of the extended memory in MB.

##### Latencys: number (default=250)
Specifies the output buffer size for the sound emulator in milliseconds. Please specify a number between 20 and 1000 ms.
A smaller value will shorten the delay of the sound, but it will require more CPU power.

##### use_menu: boolean (default=true)
Show the Neko Project II menu on middle-click or F11.

##### no_mouse: boolean (default=false)
Disables mouse emulation.

#### NP21.create(config: NP2Config): Promise\<NP21>
Same as `NP2.create()`, but this will create an instance of the PC-9821 emulator `NP21`.

#### state: 'ready' | 'running' | 'paused' | 'exited'
Returns the current state of the emulator.

#### run(): void
Starts the emulator.

#### reset(): void
Resets the emulator.

#### addDiskImage(name: string, bytes: Uint8Array): void
Adds a disk image to the emulator.

#### getDiskImage(name: string): Uint8Array
Returns the current content of the disk image.

#### setFdd(drive: number, name: string | null): void
Sets a disk image to the floppy disk drive of the emulator.
`drive` is the drive number (0 or 1).
`name` is the disk name specified in `addDiskImage`, or `null` to eject the disk.

#### setHdd(drive: number, name: string | null): void
Sets a disk image to the hard disk drive of the emulator.
`drive` is the drive number (0 or 1).
`name` is the disk name specified in `addDiskImage`, or `null` to eject the disk.
If this method is called after running `run()`, the effect is not reflected until `reset()` is called.
