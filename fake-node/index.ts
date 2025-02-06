
import module_assert from 'assert';
import * as module_buffer from 'buffer';
// @ts-ignore
import * as module_path from 'path';
import * as module_punycode from 'punycode';
import * as module_querystring from 'querystring';
// @ts-ignore
import * as module_readline from 'readline';
// @ts-ignore
import * as module_stream from 'stream';
// @ts-ignore
import * as module_string_decoder from 'string_decoder';
import * as module_test from 'test';
// @ts-ignore
import * as module_url from 'url';
// @ts-ignore
import * as module_util from 'util';
import WEB_ONLY_GLOBALS from './web_only_globals.json';


// todo: properly implement eval
const DEFAULT_GLOBALS = {Infinity, NaN, undefined, eval, isFinite, isNaN, parseFloat, parseInt, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, escape, unescape, Object, Function, Boolean, Symbol, Error, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, Number, BigInt, Math, Date, String, RegExp, Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, BigInt64Array, BigUint64Array, Float32Array, Float64Array, Map, Set, WeakMap, WeakSet, ArrayBuffer, SharedArrayBuffer, DataView, Atomics, JSON, WeakRef, FinalizationRegistry, Promise, Reflect, Proxy, Intl, AbortController, Blob, ByteLengthQueuingStrategy, atob, BroadcastChannel, btoa, clearInterval, clearTimeout, CloseEvent, CompressionStream, console, CountQueuingStrategy, Crypto, crypto, CryptoKey, CustomEvent, DecompressionStream, Event, EventSource, EventTarget, fetch, FormData, Headers, localStorage, MessageChannel, MessageEvent, MessagePort, Navigator, navigator, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceObserver, PerformanceObserverEntryList, performance, queueMicrotask, ReadableByteStreamController, Response, Request, sessionStorage, setInterval, setTimeout, Storage, structuredClone, SubtleCrypto, DOMException, TextDecoder, TextDecoderStream, TextEncoder, TextEncoderStream, TransformStreamDefaultController, URL, URLSearchParams, WebAssembly, WebSocket, WritableStream, WritableStreamDefaultController, WritableStreamDefaultWriter};
for (const name of WEB_ONLY_GLOBALS) {
    Object.defineProperty(DEFAULT_GLOBALS, name, {get: () => {throw new ReferenceError(`${name} is not defined`)}});
}


export class Process {

    fakeNode: FakeNode;
    pid: number;
    argv: string[] = [];
    argv0: string = '';
    module: false | string;
    code: string;
    path: string;

    constructor(fakeNode: FakeNode, {path = '', code, module}: {path?: string, code: string, module?: false | string}) {
        this.fakeNode = fakeNode;
        this.pid = fakeNode.nextPid;
        fakeNode.nextPid++;
        fakeNode.processes.set(this.pid, this);
        this.code = code;
        this.path = path;
        this.module = module ?? false;
    }

    run(): void {
        let code: string;
        if (this.module) {
            code = `with(${this.fakeNode.globalName}.getGlobals(${this.pid})){__fakeNode_process__.fakeNode.modules.set('${this.module},(function(){${this.code};return module.exports;})());}`;
        } else {
            code = `with(${this.fakeNode.globalName}.getGlobals(${this.pid})){(function(){${this.code}})();}`;
        }
        let elt = document.createElement('script');
        elt.textContent = code;
        document.body.appendChild(elt);
    }

}


export class FakeNode {

    static nextId: number = 0;
    id: number;
    globalName: string;
    
    modules: Map<string, any> = new Map();
    builtinModules: Map<string, any> = new Map<string, any>([
        ['assert', module_assert],
        ['buffer', module_buffer],
        ['path', module_path],
        ['punycode', module_punycode],
        ['querystring', module_querystring],
        ['readline', module_readline],
        ['stream', module_stream],
        ['string_decoder', module_string_decoder],
        ['test', module_test],
        ['url', module_url],
        ['util', module_util],
    ]);
    
    globals: {[key: string]: any};

    processes: Map<number, Process> = new Map();
    nextPid: number = 3;

    window: Window = window;

    constructor() {
        this.id = FakeNode.nextId;
        FakeNode.nextId++;
        this.globalName = '__fakeNode_' + this.id + '__';
        // @ts-ignore
        globalThis[this.globalName] = this;
        this.globals = Object.create(DEFAULT_GLOBALS);
        Object.assign(this.globals, {require: this.require, Buffer: module_buffer.Buffer});
    }

    require(module: string): any {
        if (module.startsWith('fake-node:')) {
            module = module.slice('fake-node:'.length);
        } else if (module.startsWith('node:')) {
            module = module.slice('node:'.length);
        }
        if (this.modules.has(module)) {
            return this.modules.get(module);
        } else if (this.builtinModules.has(module)) {
            return this.builtinModules.get(module);
        } else {
            throw new Error(`cannot find module '${module}'`);
        }
    }

    getGlobals(pid: number): object {
        const process = this.processes.get(pid);
        if (process === undefined) {
            throw new TypeError(`nonexistent PID in FakeNode.getGlobals call: ${pid}. If you do not know why this occured, it is probably a bug in fake-node. Please report it at https://github.com/speedydelete/fake-node/issues.`);
        }
        let scope: {[key: string]: any} = Object.create(this.globals);
        scope.global = scope;
        scope.globalThis = scope;
        scope.__fakeNode_process__ = process;
        if (process.path !== '') {
            const pathParts = process.path.split('/');
            scope.__dirname = pathParts.slice(0, -1).join('/');
            scope.__filename = pathParts[pathParts.length - 1];
        }
        if (process.module !== false) {
            scope.module = {
                exports: {}
            };
            scope.exports = scope.module.exports;
        }
        return scope;
    }

    run(code: string): void {
        (new Process(this, {code, path: '/'})).run();
    }

    addModule(name: string, code: string): void {
        (new Process(this, {code, path: '/', module: name})).run();
    }

}
