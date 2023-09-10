import {NP2} from "./index.js";

let np2 = new NP2({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    clk_mult: 8,
    Latencys: 120,
});
np2.run();
