import {NP2, NP21} from "../dist/np2-wasm.js";

const canvas = document.getElementById('canvas');
const droparea = document.getElementById('droparea');
const fddSelects = ['fdd1', 'fdd2'].map((id) => document.getElementById(id));

let np2;
async function create_np2() {
    if (np2) return;
    np2 = await NP21.create({
        canvas: document.getElementById('canvas'),
        clk_mult: 8,
        Latencys: 120,
        onDiskChange: (name) => console.log(name + ' changed'),
        onExit: () => { np2.reset(); }
    });
}

function drawInitialContent() {
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Arial';

    const text = 'Drag & drop FDD/HDD disk images here!';
    const textWidth = ctx.measureText(text).width;

    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height / 2;

    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y);
}

async function addImage(file, is_fdd) {
    np2.addDiskImage(file.name, new Uint8Array(await file.arrayBuffer()));
    if (is_fdd) {
        for (const select of fddSelects) {
            let option = document.createElement('option');
            option.setAttribute('value', file.name);
            option.textContent = file.name;
            select.appendChild(option);
        }
        if (np2.state === 'ready' && fddSelects[0].value === '') {
            fddSelects[0].value = file.name;
            np2.setFdd(0, file.name);
        }
    } else {
        np2.setHdd(0, file.name);
    }
}

droparea.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

droparea.addEventListener('drop', async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const files = e.dataTransfer.files;
    let readyToRun = false;
    for (const file of files) {
        if (file.name.match(/\.(d88|88d|d98|98d|fdi|xdf|hdm|dup|2hd|tfd|img)$/i)) {
            await create_np2();
            await addImage(file, true);
            readyToRun = true;
        } else if (file.name.match(/\.(thd|nhd|hdi)$/i)) {
            await create_np2();
            await addImage(file, false);
            readyToRun = true;
        } else {
            console.log(`unrecognized image type: ${file.name}`);
        }
    }
    if (np2.state === 'ready' && readyToRun) {
        np2.run();
    }
})

for (let i = 0; i < fddSelects.length; i++) {
    const select = fddSelects[i];
    select.addEventListener('change', (async (ev) => {
        np2.setFdd(i, ev.target.value === '' ? null : ev.target.value);
    }));
}

drawInitialContent();
