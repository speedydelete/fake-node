
export interface GlobalsPrototype {
    AbortController: typeof AbortController;
    Blob: typeof Blob;
    ByteLengthQueuingStrategy: typeof ByteLengthQueuingStrategy;
    atob(data: string): string;
    BroadcastChannel: typeof BroadcastChannel;
    btoa(data: string): string;
    clearInterval(id: number): void;
    clearTimeout(id: number): void;
    CloseEvent: typeof CloseEvent;
    CompressionStream: typeof CompressionStream;
    console: Console;
    CountQueuingStrategy: typeof CountQueuingStrategy;
    Crypto: typeof Crypto;
    crypto: Crypto;
    CryptoKey: typeof CryptoKey;
    CustomEvent: typeof CustomEvent;
    DecompressionStream: typeof DecompressionStream;
    Event: typeof Event;
    EventSource: typeof EventSource;
    EventTarget: typeof EventTarget;
    fetch: typeof fetch;
    FormData: typeof FormData;
    Headers: typeof Headers;
    localStorage: Storage;
    MessageChannel: typeof MessageChannel;
    MessageEvent: typeof MessageEvent;
    MessagePort: typeof MessagePort;
    Navigator: typeof Navigator;
    navigator: Navigator;
    PerformanceEntry: typeof PerformanceEntry;
    PerformanceMark: typeof PerformanceMark;
    PerformanceMeasure: typeof PerformanceMeasure;
    PerformanceObserver: typeof PerformanceObserver;
    PerformanceObserverEntryList: typeof PerformanceObserverEntryList;
    performance: typeof performance;
    queueMicrotask(callback: () => void): void;
    ReadableByteStreamController: typeof ReadableByteStreamController;
    Response: typeof Response;
    Request: typeof Request;
    sessionStorage: Storage;
    setInterval(code: string, delay?: number): number;
    setInterval(func: Function, delay?: number, ...args: unknown[]): number;
    setTimeout(code: string, delay?: number): number;
    setTimeout(func: Function, delay?: number, ...args: unknown[]): number;
    Storage: typeof Storage;
    structuredClone(value: unknown, options?: {transfer: unknown[]}): unknown;
    SubtleCrypto: typeof SubtleCrypto;
    DOMException: typeof DOMException;
    TextDecoder: typeof TextDecoder;
    TextDecoderStream: typeof TextDecoderStream;
    TextEncoder: typeof TextEncoder;
    TextEncoderStream: typeof TextEncoderStream;
    TransformStreamDefaultController: typeof TransformStreamDefaultController;
    URL: typeof URL;
    URLSearchParams: typeof URLSearchParams;
    WebAssembly: typeof WebAssembly;
    WebSocket: typeof WebSocket;
    WritableStream: typeof WritableStream;
    WritableStreamDefaultController: typeof WritableStreamDefaultController;
    WritableStreamDefaultWriter: typeof WritableStreamDefaultWriter;
}

export class Process {
    fakeNode: FakeNode;
    pid: number;
    priority: number;
    uid: number;
    gid: number;
    groups: number[];
    cwd: string;
    umask: number;
    argv: string[];
    argv0: string;
    execArgv: string[];
    execPath: string;
    path: string;
    code: string;
    module: boolean;
    constructor(fakeNode: FakeNode, options: {path?: string, code: string, module?: boolean});
    run(): void;
    get env(): {[key: string]: string};
}

export class FakeNode {
    version: string;
    static nextId: number;
    id: number;
    globalName: string;
    globalenv: {[key: string]: string};
    modules: Map<string, unknown>;
    globals: GlobalsPrototype;
    processes: Map<number, Process>;
    nextPid: number;
    window: Window;
    errorCallbacks: (Function | undefined)[];
    constructor();
    require(module: string): unknown;
    getGlobals(pid: number): Global;
    getenv(pid: number): {[key: string]: string};
    run(code: string): void;
    addModule(name: string, code: string): void;
    addModuleFromValue(name: string, module: unknown): void;
    getUserFromUID(uid: number | string): string;
    getGroupFromGID(gid: number | string): string;
    getUIDFromUser(user: string | number): number;
    getGIDFromGroup(group: string | number): number;
    addErrorCallback(callback: Function): number;
    removeErrorCallback(callbackID: number): void;
}

declare global {
    var __fakeNode__: FakeNode;
    var __fakeNode_process__: Process;
    var module: {
        exports: {[key: string]: any},
    };
    var exports: {[key: string]: any};
}

export type Global = typeof globalThis;
