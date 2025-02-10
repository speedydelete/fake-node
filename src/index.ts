
import * as baseProcessObject from './process';
import {fileDescriptors, FileSystem, DEFAULT_FILES} from './_fs';
import * as module_os from './os';
import * as module_util from './util';
import * as module_querystring from './querystring';
import * as module_punycode from 'punycode/';
import * as module_path from './path';
import * as module_buffer from './buffer';
import * as module_fs from './fs';
import WEB_ONLY_GLOBALS from './web_only_globals.json';


const IS_BROWSER = (('window' in globalThis && window === globalThis && 'document' in window && 'navigator' in window && 'window' in window && window.window === window) || ('self' in globalThis && self === globalThis && typeof self.postMessage === 'function' && 'self' in self && self.self === self));


type BaseProcessObject = typeof import ('./process');
interface ProcessObject extends BaseProcessObject {
    argv: string[];
    argv0: string;
    env: {[key: string]: string};
    execArgv: string[];
    execPath: string;
    mainModule: string;
    platform: string;
    version: string;
    versions: {[key: string]: string};
}


const BUILTIN_MODULES: [string, any][] = [
    ['os', module_os],
    ['util', module_util],
    ['querystring', module_querystring],
    ['punycode', module_punycode],
    ['path', module_path],
    ['buffer', module_buffer],
    ['fs', module_fs],
];

const DEFAULT_ENV = {
    PATH: '/usr/local/bin:/usr/bin:/bin',
    SHLVL: '1',
    SHELL: '/bin/bash',
    TERM: 'none',
    PS1: '',
    PS2: '> ',
    HISTFILE: '~/.bash_history',
    EDITOR: 'vim',
    VISUAL: 'vim',
    LANG: 'en_US.utf8',
    HOSTNAME: 'fake-node',
    TMPDIR: '/tmp',
};


export class Process {

    fakeNode: FakeNode;

    pid: number;
    priority: number = 0;

    uid: number = 0;
    gid: number = 0;
    groups: number[] = [];
    cwd: string;
    umask: number = 0o6440;

    argv: string[] = [];
    argv0: string = '';
    execArgv: string[] = [];
    execPath: string = '/usr/bin/local/node';

    path: string;
    module: false | string;
    code: string;

    constructor(fakeNode: FakeNode, {path = '', code, module}: {path?: string, code: string, module?: false | string}) {
        this.fakeNode = fakeNode;
        this.pid = fakeNode.nextPid;
        fakeNode.nextPid++;
        fakeNode.processes.set(this.pid, this);
        this.code = code;
        this.path = path;
        this.cwd = path.split('/').slice(0, -1).join('/');
        this.module = module ?? false;
    }

    get env(): {[key: string]: string} {
        return this.fakeNode.getenv(this.pid);
    }

    run(): void {
        let code: string;
        if (this.module) {
            code = `with(${this.fakeNode.globalName}.getGlobals(${this.pid})){__fakeNode__.modules.set('${this.module},(function(){${this.code};return module.exports;})());}`;
        } else {
            code = `with(${this.fakeNode.globalName}.getGlobals(${this.pid})){(function(){${this.code}})();}`;
        }
        let elt = document.createElement('script');
        elt.textContent = code;
        document.body.appendChild(elt);
    }

}


if (!('__fakeNode_next_instance_id__' in globalThis)) {
    // @ts-ignore
    globalThis.__fakeNode_next_instance_id__ = 0;
}


export class FakeNode {

    version: string = '0.3.0';
    versions: {[key: string]: string} = {
        'fake-node': '0.3.0',
        'punycode': '2.3.1',
    };

    id: number;
    globalName: string;

    fs: FileSystem;
    fileDescriptors: (string | null)[] = fileDescriptors;

    processes: Map<number, Process> = new Map();
    nextPid: number = 3;

    globalenv: {[key: string]: string} = DEFAULT_ENV;
    
    modules: Map<string, unknown> = new Map();

    // @ts-ignore
    window: Window;

    errorCallbacks: (Function | undefined)[] = [];

    constructor() {
        // @ts-ignore
        this.id = globalThis.__fakeNode_next_instance_id;
        // @ts-ignore
        globalThis.__fakeNode_next_instance_id++;
        this.globalName = '__fakeNode_' + this.id + '__';
        // @ts-ignore
        globalThis[this.globalName] = this;
        if (IS_BROWSER) {
            this.window = window;
        } else {
            Object.defineProperty(this, 'window', {get() {throw new ReferenceError('fake-node is not running in a browser')}});
        }
        this.fs = new FileSystem(DEFAULT_FILES, {uid: 0, gid: 0});
        window.addEventListener('error', ({error}) => this.onError(error));
        window.addEventListener('unhandledrejection', ({reason}) => reason instanceof Error ? this.onError(reason) : this.onError(new Error(String(reason))));
        for (const [name, module] of BUILTIN_MODULES) {
            this.addModuleFromValue(name, module);
            this.addModuleFromValue('node:' + name, module);
            this.addModuleFromValue('fake-node:' + name, module);
        }
    }

    require(module: string, pid: number): unknown {
        if (this.modules.has(module)) {
            return this.modules.get(module);
        } else if (module === 'process' || module === 'node:process' || module === 'fake-node:process') {
            return this.getProcessObject(pid);
        } else {
            throw new Error(`cannot find module '${module}'`);
        }
    }

    getPlatform(): string {
        const data = navigator.userAgent.slice('Mozilla/5.0 ('.length, navigator.userAgent.indexOf(')'));
        if (data.includes('Windows')) {
            return 'win32';
        } else if (data.includes('Linux')) {
            return 'linux';
        } else if (data.includes('Mac')) {
            return 'darwin';
        } else {
            return 'unknown';
        }
    }

    getProcessObject(pid: number): ProcessObject {
        let out = Object.create(baseProcessObject);
        const process = this.processes.get(pid);
        if (process === undefined) {
            throw new TypeError(`nonexistent PID in FakeNode.getProcessObject call: ${pid}. If you do not know why this occured, it is probably a bug in fake-node.`);
        }
        out.argv = process.argv;
        out.argv0 = process.argv0;
        out.env = process.env;
        out.execArgv = process.execArgv;
        out.execPath = process.execPath;
        out.mainModule = '';
        out.platform = this.getPlatform();
        out.version = this.version;
        out.versions = this.versions;
        return out;
    }

    getGlobals(pid: number): object {
        const process = this.processes.get(pid);
        if (process === undefined) {
            throw new TypeError(`nonexistent PID in FakeNode.getGlobals call: ${pid}. If you do not know why this occured, it is probably a bug in fake-node.`);
        }
        let scope = Object.assign({
            __fakeNode__: this,
            __fakeNode_process__: process,
            require: ((module: string) => this.require(module, pid)).bind(this)
        }, Object.defineProperties({}, Object.fromEntries(WEB_ONLY_GLOBALS.map((name: string) => [name, {get(): void {throw new ReferenceError(`${name} is not defined`);}}]))));
        scope.global = scope;
        scope.globalThis = scope;
        if (process.path !== '') {
            const pathParts = process.path.split('/');
            scope.__dirname = pathParts.slice(0, -1).join('/');
            scope.__filename = pathParts[pathParts.length - 1];
        }
        if (process.module !== false) {
            scope.module = {
                exports: {},
            };
            // @ts-ignore
            scope.exports = scope.module.exports;
        }
        return scope;
    }

    getenv(pid: number): {[key: string]: string} {
        let env = Object.create(this.globalenv);
        const process = this.processes.get(pid);
        if (process === undefined) {
            throw new TypeError(`invalid PID: ${pid}`);
        }
        env.USER = this.getUserFromUID(process.uid);
        return env;
    }

    run(code: string): void {
        (new Process(this, {code, path: '/'})).run();
    }

    addModule(name: string, code: string): void {
        (new Process(this, {code, path: '/', module: name})).run();
    }

    addModuleFromValue(name: string, module: unknown): void {
        this.modules.set(name, module);
    }

    getUserFromUID(uid: number | string): string {
        if (typeof uid === 'string') {
            return uid;
        } else {
            return 'root';
        }
    }

    getUserFromGID(gid: number | string): string {
        if (typeof gid === 'string') {
            return gid;
        } else {
            return 'root';
        }
    }

    getUIDFromUser(user: string | number): number {
        if (typeof user === 'number') {
            return user;
        } else {
            return 0;
        }
    }

    getGIDFromGroup(group: string | number): number {
        if (typeof group === 'number') {
            return group;
        } else {
            return 0;
        }
    }

    onError(error: Error): void {
        for (const callback of this.errorCallbacks) {
            if (callback !== undefined) {
                callback(error);
            }
        }
    }

    addErrorCallback(callback: Function): number {
        this.errorCallbacks.push(callback);
        return this.errorCallbacks.length - 1;
    }

    removeErrorCallback(callbackID: number): void {
        this.errorCallbacks[callbackID] = undefined;
    }

}
