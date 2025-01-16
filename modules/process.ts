
import {join} from './path';
import {platform as _platform} from './os';

export function abort(): void {
    window.close();
}
    
export const allowedNodeEnvironmentFlags = new Set<never>();
    
export let _argv: {argv: string[]} = {argv: []};
export const argv = _argv.argv;

export const argv0 = '/usr/bin/local/node';

export const channel = undefined;

export function chdir(directory: string): void {
    globalThis.__fakeNode_wd = join(globalThis.__fakeNode_wd, directory);
}

export const config = {};

export const connected = undefined;

export function constrainedMemory(): number {
    return 0;
}

export function availableMemory(): number {
    // @ts-ignore
    return navigator.deviceMemory * 2**30;
}

export function cwd(): string {
    return globalThis.__fakeNode_wd;
}

export const env = {
    SHELL: '/usr/local/bin/bash',
    USER: 'root',
    PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
    PWD: '/home/root',
    EDITOR: 'vim',
    SHLVL: '1',
    HOME: '/home/root',
    LOGNAME: 'root',
    _: '/usr/local/bin/node'
}; 

export const execPath = '/usr/bin/local/node';

export function exit(code: number = 0): void {
    console.log('Exit code', code);
    window.close();
}

export const exitCode = undefined;

export const features = {
    cached_builtins: true,
    debug: false,
    inspector: false,
    ipv6: true,
    require_module: true,
    tls: false,
    tls_alpn: false,
    tls_ocsp: false,
    tls_sni: false,
    typescript: false,
    uv: false,
};

export function getBuiltinModule(id: string): any {
    return globalThis.__fakeNode_builtinModules[id];
}

export const platform = _platform();
