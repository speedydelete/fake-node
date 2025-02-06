
export declare class Process {
    fakeNode: FakeNode;
    pid: number;
    argv: string[];
    argv0: string;
    module: boolean;
    code: string;
    path: string;
    constructor(fakeNode: FakeNode, {path, code, module}: {path?: string, code: string, module?: boolean});
    run(): void;
}

export declare class FakeNode {
    static nextId: number;
    id: number;
    globalName: string;
    modules: Map<string, any>;
    builtinModules: Map<string, any>;
    globals: {[key: string]: any};
    processes: Map<number, Process>;
    nextPid: number;
    window: Window;
    constructor();
    require(module: string): any;
    getGlobals(pid: number): object;
    run(code: string): void;
    addModule(name: string, code: string): void;
}

declare namespace FN {
    var FakeNode: FakeNode;
    var Process: Process;
}

export default FN;

declare global {
    var __fakeNode_process__: Process;
}
