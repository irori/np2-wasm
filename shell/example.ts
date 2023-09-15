import {NP2, NP21} from "./index.js";

const canvas = document.getElementById('canvas')!;
const droparea = document.getElementById('droparea')!;

droparea.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
});

droparea.addEventListener('drop', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    droparea.parentElement!.removeChild(droparea);
    canvas.classList.remove('hidden');

    const files = e.dataTransfer!.files;
    let np2 = await NP21.create({
        canvas: document.getElementById('canvas') as HTMLCanvasElement,
        clk_mult: 8,
        Latencys: 120,
        onDiskChange: (name) => console.log(name + ' changed'),
    });
    for (const file of files) {
        np2.addDiskImage(file.name, new Uint8Array(await file.arrayBuffer()));
    }
    if (files[0].name.match(/\.(hdi|nhd)$/i)) {
        np2.setHdd(0, files[0].name);
    } else {
        np2.setFdd(0, files[0].name);
    }
    np2.run();
})
