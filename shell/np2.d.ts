export interface NP2Module extends EmscriptenModule {
    FS: typeof FS & { filesystems: { IDBFS: typeof IDBFS } };
    ccall: typeof ccall;
    UTF8ToString: typeof UTF8ToString;
    stringToUTF8: typeof stringToUTF8;
    pauseMainLoop: () => void;
    resumeMainLoop: () => void;
    canvas: HTMLCanvasElement;
}

declare function createNp2(moduleArg: any): Promise<NP2Module>;
export default createNp2;