export interface NP2Module extends EmscriptenModule {
    FS: typeof FS & { filesystems: { IDBFS: typeof IDBFS } };
    addRunDependency: typeof addRunDependency;
    removeRunDependency: typeof removeRunDependency;
    canvas: HTMLCanvasElement;
}

declare function createNp2(moduleArg: any): Promise<NP2Module>;
export default createNp2;