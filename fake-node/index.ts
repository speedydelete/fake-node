
import * as module_assert from 'assert';
import * as module_buffer from 'buffer';
import * as module_path from 'path';
import * as module_punycode from 'punycode';
import * as module_querystring from 'querystring';
import * as module_readline from 'readline';
import * as module_stream from 'stream';
import * as module_string_decoder from 'string_decoder';
import * as module_test from 'test';
import * as module_url from 'url';
import * as module_util from 'util';
import WEB_ONLY_GLOBALS from './web_only_globals.json';


// todo: properly implement eval
const ES_GLOBALS = {Infinity, NaN, undefined, eval, isFinite, isNaN, parseFloat, parseInt, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, escape, unescape, Object, Function, Boolean, Symbol, Error, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, Number, BigInt, Math, Date, String, RegExp, Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, BigInt64Array, BigUint64Array, Float32Array, Float64Array, Map, Set, WeakMap, WeakSet, ArrayBuffer, SharedArrayBuffer, DataView, Atomics, JSON, WeakRef, FinalizationRegistry, Promise, Reflect, Proxy, Intl};

const NODE_AND_WEB_GLOBALS = {AbortController, Blob, ByteLengthQueuingStrategy, atob, BroadcastChannel, btoa, clearInterval, clearTimeout, CloseEvent, CompressionStream, console, CountQueuingStrategy, Crypto, crypto, CryptoKey, CustomEvent, DecompressionStream, Event, EventSource, EventTarget, fetch, FormData, Headers, localStorage, MessageChannel, MessageEvent, MessagePort, Navigator, navigator, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceObserver, PerformanceObserverEntryList, performance, queueMicrotask, ReadableByteStreamController, Response, Request, sessionStorage, setInterval, setTimeout, Storage, structuredClone, SubtleCrypto, DOMException, TextDecoder, TextDecoderStream, TextEncoder, TextEncoderStream, TransformStreamDefaultController, URL, URLSearchParams, WebAssembly, WebSocket, WritableStream, WritableStreamDefaultController, WritableStreamDefaultWriter};


export class Process {

    fakeNode: FakeNode;
    pid: number;
    argv: string[] = [];
    argv0: string = '';
    path?: string;
    code: string;

    constructor(fakeNode: FakeNode, {path, code}: {path?: string, code?: string}) {
        this.fakeNode = fakeNode;
        fakeNode.nextPid++;
    }

}


export class FakeNode {
    
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
        this.globals = {require: this.require, Buffer: module_buffer.Buffer};
        Object.assign(this.globals, ES_GLOBALS);
        for (const name of WEB_ONLY_GLOBALS) {
            Object.defineProperty(this.globals, name, {get: () => {throw new ReferenceError(`${name} is not defined`)}});
        }
        Object.assign(this.globals, NODE_AND_WEB_GLOBALS);
    }

    require(module: string): any {
        if (this.modules.has(module)) {
            return this.modules.get(module);
        } else if (this.builtinModules.has(module)) {
            return this.builtinModules.get(module);
        } else {
            throw new Error(`cannot find module '${name}'`);
        }
    }

    setup({path, argv, module}: {path?: string, argv?: string[], module?: boolean}): object {
        let scope: {[key: string]: any} = Object.create(this.globals);
        scope.global = scope;
        scope.globalThis = scope;
        let process = new Process(this, path, argv);
        scope.__fakeNode_process__ = process;
        if (path !== undefined) {
            const splitPath = path.split('/');
            scope.__dirname = splitPath.slice(0, -1).join('/');
            scope.__filename = splitPath[splitPath.length - 1];
        }
        if (argv !== undefined) {
            
        }
        if (module !== undefined) {

        }
        return scope;
    }

    run(code: string) {
        new Process()
    }

    run(code: string, path?: string): void {
        code = `with(__fakeNode__.setup(${JSON.stringify(path)}){(function(){${code}})();}`;
        let elt = document.createElement('script');
        elt.textContent = code;
        document.body.appendChild(elt);
    }

    addModule(name: string, code: string): void {
        code = `with(window.__fakeNode__.setup()){__fakeNode__.modules.set('${name}',(function(){${code};return module.exports;})();window.__fakeNode_cleanup();}`;
        let elt = document.createElement('script');
        elt.textContent = code;
        document.body.appendChild(elt);
    }

}
