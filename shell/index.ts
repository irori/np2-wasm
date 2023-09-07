import createModule, {NP2Module} from "./np2.js"

type NP2Config = {
    canvas: HTMLCanvasElement,
}

export class NP2 {
    private module: NP2Module;
    private moduleReady: Promise<NP2Module>;
    private config: NP2Config & { [key: string]: any };
    private preRunCalled = false;
    private runCalled = false;

    constructor(config: NP2Config) {
        this.config = config;
        this.module = {
            canvas: this.config.canvas,
            preRun: [this.preRun.bind(this)],
        } as any;
        this.moduleReady = createModule(this.module);
    }

    private preRun() {
        this.preRunCalled = true;
        if (!this.runCalled) {
            this.module.addRunDependency('NP2.run');
        }
    }

    async run() {
        this.runCalled = true;
        if (this.preRunCalled) {
            this.module.removeRunDependency('NP2.run');
        }
    }
}
