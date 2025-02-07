
import * as module_os from './os';
import * as module_process from './process';
import * as module_punycode from 'punycode/';
import * as module_querystring from './querystring';
import WEB_ONLY_GLOBALS from './web_only_globals.json';


const DEFAULT_GLOBALS = Object.defineProperties({}, Object.fromEntries(WEB_ONLY_GLOBALS.map((name: string) => [name, {get(): void {throw new ReferenceError(`${name} is not defined`);}}])));

const BUILTIN_MODULES: [string, any][] = [
    ['os', module_os],
    ['process', module_process],
    ['querystring', module_querystring],
    ['punycode', module_punycode],
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
    execArgv0: string = '/usr/bin/local/node';

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


export class FakeNode {

    version: string = '0.3.0';

    static nextId: number = 0;
    id: number;
    globalName: string;

    globalenv: {[key: string]: string} = DEFAULT_ENV;
    
    modules: Map<string, unknown> = new Map();
    
    globals: {[key: string]: unknown};

    processes: Map<number, Process> = new Map();
    nextPid: number = 3;

    window: Window = window;

    errorCallbacks: (Function | undefined)[] = [];

    constructor() {
        this.id = FakeNode.nextId;
        FakeNode.nextId++;
        this.globalName = '__fakeNode_' + this.id + '__';
        // @ts-ignore
        globalThis[this.globalName] = this;
        this.globals = {__fakeNode__: this};
        Object.assign(this.globals, DEFAULT_GLOBALS);
        window.addEventListener('error', ({error}) => this.onError(error));
        window.addEventListener('unhandledrejection', ({reason}) => reason instanceof Error ? this.onError(reason) : this.onError(new Error(String(reason))));
        for (const [name, module] of BUILTIN_MODULES) {
            this.addModuleFromValue(name, module);
            this.addModuleFromValue('node:' + name, module);
            this.addModuleFromValue('fake-node:' + name, module);
        }
    }

    require(module: string): unknown {
        if (this.modules.has(module)) {
            return this.modules.get(module);
        } else {
            throw new Error(`cannot find module '${module}'`);
        }
    }

    getGlobals(pid: number): object {
        const process = this.processes.get(pid);
        if (process === undefined) {
            throw new TypeError(`nonexistent PID in FakeNode.getGlobals call: ${pid}. If you do not know why this occured, it is probably a bug in fake-node. Please report it at https://github.com/speedydelete/fake-node/issues.`);
        }
        let scope: {[key: string]: unknown} = {};
        Object.assign(scope, this.globals);
        scope.global = scope;
        scope.globalThis = scope;
        scope.__fakeNode_process__ = process;
        scope.require = Object.create(this.require);
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
