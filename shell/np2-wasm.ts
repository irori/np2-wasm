import type { MainModule as NP2Module } from "./np2.js";

type NP2Config = {
    canvas: HTMLCanvasElement,
    onDiskChange?: (name: string) => void;
    onExit?: () => void;

    // emulator configurations (src/sdl2/ini.c)
    pc_model?: string,
    clk_base?: number,
    clk_mult?: number,
    DIPswtch?: number[],
    MEMswtch?: number[],
    ExMemory?: number,
    ITF_WORK?: boolean,
    HDD1FILE?: string,
    HDD2FILE?: string,
    fontfile?: string,
    biospath?: string,
    SampleHz?: number,
    Latencys?: number,
    SNDboard?: number,
    BEEP_vol?: number,
    xspeaker?: boolean,
    SND14vol?: number[],
    opt26BRD?: number,
    opt86BRD?: number,
    optSPBRD?: number,
    optSPBVR?: number,
    optSPBVL?: number,
    optSPB_X?: boolean,
    optMPU98?: number,
    volume_F?: number,
    volume_S?: number,
    volume_A?: number,
    volume_P?: number,
    volume_R?: number,
    Seek_Snd?: boolean,
    Seek_Vol?: number,
    btnRAPID?: boolean,
    btn_MODE?: boolean,
    MS_RAPID?: boolean,
    VRAMwait?: number[],
    DispSync?: boolean,
    Real_Pal?: boolean,
    RPal_tim?: number,
    uPD72020?: boolean,
    GRCG_EGC?: number,
    color16b?: boolean,
    skipline?: boolean,
    skplight?: number,
    LCD_MODE?: number,
    BG_COLOR?: number,
    FG_COLOR?: number,
    pc9861_e?: boolean,
    pc9861_s?: number[],
    pc9861_j?: number[],
    calendar?: boolean,
    USE144FD?: boolean,
    s_NOWAIT?: boolean,
    SkpFrame?: number,
    F12_bind?: number,
    e_resume?: boolean,
    jast_snd?: boolean,
    use_menu?: boolean,
    no_mouse?: boolean,
}

const enum IniType { // src/sdl2/ini.h
    STR = 0,
    BOOL,
    BYTEARG,
    SINT8,
    SINT16,
    SINT32,
    UINT8,
    UINT16,
    UINT32,
    HEX8,
    HEX16,
    HEX32,
    USER
};

function applyDefaultConfig(config: NP2Config): NP2Config {
    return Object.assign({
        fontfile: 'font.bmp'
    }, config);
}

export class NP2 {
    #state: 'loading' | 'ready' | 'running' | 'paused' | 'exited' = 'loading';
    private module: NP2Module;
    private config: NP2Config & { [key: string]: any };

    get state() { return this.#state; }

    static create(config: NP2Config): Promise<NP2> {
        return new Promise(async (resolve, reject) => {
            const factory = (await import('./np2.js')).default;
            new NP2(applyDefaultConfig(config), factory, resolve, reject);
        });
    }

    protected constructor(
        config: NP2Config,
        createModule: (moduleArg: any) => Promise<any>,
        resolveReady: (np2: NP2) => void,
        rejectReady: (reason: any) => void)
    {
        this.config = config;
        const module = this.module = {
            canvas: this.config.canvas,
            preRun: [
                () => {
                    const url = new URL(config.fontfile!, import.meta.url).href;
                    module.FS.createPreloadedFile('/', config.fontfile, url, true, false);
                },
            ],
            onReady: () => {
                module.pauseMainLoop();
                document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
                this.#state = 'ready';
                resolveReady(this);
            },
            onExit: this.onExit.bind(this),
            getConfig: this.getConfig.bind(this),
            setConfig: this.setConfig.bind(this),
            onDiskChange: this.onDiskChange.bind(this),
        } as any;
        createModule(module).catch(rejectReady);
    }

    run() {
        if (this.#state === 'ready' || this.#state === 'paused') {
            this.#state = 'running';
            this.module._np2_resume();
        }
    }

    private pause() {
        if (this.#state === 'running') {
            this.#state = 'paused';
            this.module._np2_pause();
        }
    }

    reset() {
        if (this.#state === 'exited') {
            this.#state = 'running';
            this.module._np2_resume();
        }
        this.module._np2_reset();
    }

    addDiskImage(name: string, bytes: Uint8Array) {
        this.module.FS.writeFile(name, bytes);
    }

    getDiskImage(name: string): Uint8Array {
        return this.module.FS.readFile(name, { encoding: 'binary' });
    }

    setFdd(drive: number, name: string | null) {
        if (!name) {
            // Eject.
            this.module.ccall('diskdrv_setfddex', undefined, ['number', 'number', 'number', 'number'], [drive, 0, 0, 0]);
            return;
        }
        try {
            this.module.FS.stat(name, undefined);
        } catch (err) {
            throw new Error(`${name}: Invalid disk image name`)
        }
        this.module.ccall('diskdrv_setfddex', undefined, ['number', 'string', 'number', 'number'], [drive, name, 0, 0]);
    }

    setHdd(drive: number, name: string | null) {
        if (!name) {
            // Disconnect.
            this.module.ccall('diskdrv_setsxsi', undefined, ['number', 'number'], [drive, 0]);
        } else {
            try {
                this.module.FS.stat(name, undefined);
            } catch (err) {
                throw new Error(`${name}: Invalid disk image name`)
            }
            this.module.ccall('diskdrv_setsxsi', undefined, ['number', 'string'], [drive, name]);
        }
        if (this.#state === 'ready') {
            this.reset();
        } else {
            console.log('setHdd() called after boot. It will not take effect until reset.')
        }
    }

    private getConfig(pName:number, type:number, pValue:number, size:number) {
        var value = this.config[this.module.UTF8ToString(pName)];
        switch (type) {
            case IniType.STR:
                if (typeof value === 'string')
                    this.module.stringToUTF8(value, pValue, size);
                break;
            case IniType.BOOL:
                if (typeof value === 'boolean')
                    this.module.HEAP8[pValue] = value ? 1 : 0;
                break;
            case IniType.BYTEARG:
                if (Array.isArray(value) && value.length == size) {
                    for (var i = 0; i < size; i++)
                        this.module.HEAPU8[pValue + i] = value[i];
                }
                break;
            case IniType.SINT8:
                if (typeof value === 'number')
                    this.module.HEAP8[pValue] = value;
                break;
            case IniType.UINT8:
            case IniType.HEX8:
                if (typeof value === 'number')
                    this.module.HEAPU8[pValue] = value;
                break;
            case IniType.SINT16:
                if (typeof value === 'number')
                    this.module.HEAP16[pValue >> 1] = value;
                break;
            case IniType.UINT16:
            case IniType.HEX16:
                if (typeof value === 'number')
                    this.module.HEAPU16[pValue >> 1] = value;
                break;
            case IniType.SINT32:
                if (typeof value === 'number')
                    this.module.HEAP32[pValue >> 2] = value;
                break;
            case IniType.UINT32:
            case IniType.HEX32:
                if (typeof value === 'number')
                    this.module.HEAPU32[pValue >> 2] = value;
                break;
            default:
                console.warn('getConfig: unknown type ' + type);
                break;
        }
    }

    private setConfig(pName:number, type:number, pValue:number, size:number) {
        const name = this.module.UTF8ToString(pName);
        switch (type) {
            case IniType.STR:
                this.config[name] = this.module.UTF8ToString(pValue);
                break;
            case IniType.BOOL:
                this.config[name] = this.module.HEAP8[pValue] ? true : false;
                break;
            case IniType.BYTEARG:
                var a: number[] = [];
                for (var i = 0; i < size; i++)
                    a[i] = this.module.HEAPU8[pValue + i];
                this.config[name] = a;
                break;
            case IniType.SINT8:
                this.config[name] = this.module.HEAP8[pValue];
                break;
            case IniType.UINT8:
            case IniType.HEX8:
                this.config[name] = this.module.HEAPU8[pValue];
                break;
            case IniType.SINT16:
                this.config[name] = this.module.HEAP16[pValue >> 1];
                break;
            case IniType.UINT16:
            case IniType.HEX16:
                this.config[name] = this.module.HEAPU16[pValue >> 1];
                break;
            case IniType.SINT32:
                this.config[name] = this.module.HEAP32[pValue >> 2];
                break;
            case IniType.UINT32:
            case IniType.HEX32:
                this.config[name] = this.module.HEAPU32[pValue >> 2];
                break;
            default:
                console.warn('setConfig: ' + name + ' has unknown type ' + type);
                break;
        }
    }

    private onExit() {
        // This is called deep inside pccore, so do the actual work asynchronously.
        setTimeout(() => {
            this.pause();
            this.#state = 'exited';
            if (this.config.onExit) {
                this.config.onExit();
            }
        }, 0);
    }

    private onDiskChange(pName: number) {
        if (this.config.onDiskChange) {
            this.config.onDiskChange(this.module.UTF8ToString(pName));
        }
    }

    private onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            if (this.#state === 'running')
                this.pause();
        } else {
            if (this.#state === 'paused')
                this.run();
        }
    }
}

export class NP21 extends NP2 {
    static create(config: NP2Config): Promise<NP21> {
        return new Promise(async (resolve, reject) => {
            const factory = (await import('./np21.js')).default;
            new NP21(applyDefaultConfig(config), factory, resolve, reject);
        });
    }
}
