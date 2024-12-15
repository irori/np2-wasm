import type { NP2Config } from './np2-wasm.js';

const BASECLOCK25 = 2457600;
const BASECLOCK20 = 1996800;

class PC9801 extends HTMLElement {
    protected module: Promise<typeof import('./np2-wasm.js')>;

    constructor() {
        super();
        this.module = import('./np2-wasm.js');
    }

    async connectedCallback() {
        // Create shadow DOM
        const shadow = this.attachShadow({mode: 'open'});
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (min-resolution: 2dppx) {
                canvas { image-rendering: pixelated; image-rendering: -moz-crisp-edges; }
            }
        `;
        shadow.appendChild(style);
        const canvas = document.createElement('canvas');
        canvas.classList.add('emscripten');
        canvas.width = 640;
        canvas.height = 400;
        if (!this.hasAttribute('no-mouse')) {
            canvas.addEventListener('contextmenu', e => e.preventDefault());
        }
        shadow.appendChild(canvas);

        // Draw initial loading screen
        this.drawInitialScreen(canvas);

        // Initiate fetches for disk images
        const fetchImage = (url: string | null): Promise<ArrayBuffer> | null => {
            if (!url) return null;
            return fetch(url).then(response => response.arrayBuffer());
        };
        const fdd1 = fetchImage(this.getAttribute('fdd1'));
        const fdd2 = fetchImage(this.getAttribute('fdd2'));
        const hdd1 = fetchImage(this.getAttribute('hdd1'));
        const hdd2 = fetchImage(this.getAttribute('hdd1'));

        // Configure NP2
        const config: NP2Config = { canvas };
        this.setConfigFromAttributes(config);
        const np2 = await this.createNP2(config);

        // Load disk images into NP2
        if (fdd1) {
            np2.addDiskImage('fdd1', new Uint8Array(await fdd1));
            np2.setFdd(0, 'fdd1');
        }
        if (fdd2) {
            np2.addDiskImage('fdd2', new Uint8Array(await fdd2));
            np2.setFdd(1, 'fdd2');
        }
        if (hdd1) {
            np2.addDiskImage('hdd1', new Uint8Array(await hdd1));
            np2.setHdd(0, 'hdd1');
        }
        if (hdd2) {
            np2.addDiskImage('hdd2', new Uint8Array(await hdd2));
            np2.setHdd(1, 'hdd2');
        }

        // Boot NP2
        np2.run();
    }

    private drawInitialScreen(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.font = '20px Arial';
        const text = 'loading...';
        const textWidth = ctx.measureText(text).width;
        const x = (canvas.width - textWidth) / 2;
        const y = canvas.height / 2;
        ctx.fillStyle = window.getComputedStyle(canvas).color;
        ctx.fillText(text, x, y);
    }

    private setConfigFromAttributes(config: NP2Config) {
        const attr_cpu_clock = this.getAttribute('cpu-clock');
        if (attr_cpu_clock) {
            const match = attr_cpu_clock.match(/^(\d+(\.\d+)?)(MHz)?$/i);
            if (match) {
                const clock = parseFloat(match[1]) * 1000000;
                const mult_bc25 = Math.round(clock / BASECLOCK25);
                const mult_bc20 = Math.round(clock / BASECLOCK20);
                const error_bc25 = Math.abs(clock - mult_bc25 * BASECLOCK25);
                const error_bc20 = Math.abs(clock - mult_bc20 * BASECLOCK20);
                if (error_bc25 <= error_bc20) {
                    config.clk_base = BASECLOCK25;
                    config.clk_mult = mult_bc25;
                } else {
                    config.clk_base = BASECLOCK20;
                    config.clk_mult = mult_bc20;
                }
            } else {
                console.warn('Invalid CPU clock:', attr_cpu_clock);
            }
        }
        const attr_memory = this.getAttribute('memory');
        if (attr_memory) {
            const match = attr_memory.match(/^(\d+)(MB)?$/i);
            if (match) {
                config.ExMemory = parseInt(match[1]) - 1;
            } else {
                console.warn('Invalid memory size:', attr_memory);
            }
        }
        config.no_mouse = this.hasAttribute('no-mouse');
        config.use_menu = this.hasAttribute('use-menu');
    }

    protected async createNP2(config: NP2Config) {
        const { NP2 } = await this.module;
        return await NP2.create(config);
    }
}

class PC9821 extends PC9801 {
    protected async createNP2(config: NP2Config) {
        const { NP21 } = await this.module;
        return await NP21.create(config);
    }
}

window.customElements.define('pc-9801', PC9801);
window.customElements.define('pc-9821', PC9821);
