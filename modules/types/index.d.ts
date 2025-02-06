
export namespace FakeNode {

}

declare class FakeNode {
    modules: Map<string, any>;
    builtinModules: Map<string, any>;
    globals: {
        [key: string]: any;
    };
    argvs: Map<number, string[]>;
    argv0s: Map<number, string>;
    execArgvs: Map<number, string[]>;
    execArgv0s: Map<number, string>;
    nextPid: number;
    window: Window;
    constructor();
    require(module: string): any;
    setup({ path, argv, module }: {
        path?: string;
        argv?: string[];
        module?: boolean;
    }): object;
    run(code: string, path?: string): void;
    addModule(name: string, code: string): void;
}

declare global {
    var __fakeNode_process__: Process;
}
