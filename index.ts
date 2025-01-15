
import globals from './globals';

import * as module_assert from './modules/assert';
import * as module_buffer from './modules/buffer';
import * as module_fs from './modules/fs';
import * as module_os from './modules/os';
import * as module_path from './modules/path';
import * as module_process from './modules/process';
import * as module_querystring from './modules/querystring';
import * as module_util from './modules/util';

function setup(path?: string, argv: string[] = []): object {
    module_process._argv.argv = argv;
    let scope: {[key: string]: any} = {};
    Object.assign(scope, globals);
    let readonly: {[key: string]: any} = {};
    scope.global = scope;
    scope.globalThis = scope;
    globalThis.__fakeNode_oldWd = globalThis.__fakeNode_wd;
    if (path !== undefined) {
        const splitPath = path.split('/');
        readonly.__dirname = splitPath.slice(0, -1).join('/');
        readonly.__filename = splitPath[splitPath.length - 1];
        scope.__fakeNode_wd = readonly.__dirname;
    }
    Object.defineProperties(scope, Object.fromEntries(Object.entries(readonly).map(([name, value]) => [name, {value: value, writable: false}])));
    return scope;
}

globalThis.__fakeNode_setup = setup;

function cleanup(): void {
    globalThis.__fakeNode_wd = globalThis.__fakeNode_oldWd;
}

globalThis.__fakeNode_cleanup = cleanup;

function run(code: string, argv: string[] = []): void {
    code = `with(window.__fakeNode_setup(undefined,${JSON.stringify(argv)})){(function(){${code}})();window.__fakeNode_cleanup();}`;
    let elt = document.createElement('script');
    elt.textContent = code;
    document.body.appendChild(elt);
}

function addModule(name: string, code: string): void {
    code = `with(window.__fakeNode_setup()){window.__fakeNode_modules.set('${name}',(function(){${code};return module.exports;})();window.__fakeNode_cleanup();}`;
    let elt = document.createElement('script');
    elt.textContent = code;
    document.body.appendChild(elt);
}

function addBuiltinModule(name: string, data: any): void {
    globalThis.__fakeNode_builtinModules.set(name, data);
}

function deleteModule(name: string): void {
    globalThis.__fakeNode_modules.delete(name);
}

function deleteBuiltinModule(name: string): void {
    globalThis.__fakeNode_builtinModules.delete(name);
}

addBuiltinModule('assert', module_assert);
addBuiltinModule('buffer', module_buffer);
addBuiltinModule('fs', module_fs);
addBuiltinModule('os', module_os);
addBuiltinModule('path', module_path);
addBuiltinModule('process', module_process);
addBuiltinModule('querystring', module_querystring);
addBuiltinModule('util', module_util);

export {
    run,
    addModule,
    addBuiltinModule,
    deleteModule,
    deleteBuiltinModule,
}
