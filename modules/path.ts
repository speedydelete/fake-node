
export function basename(path: string, suffix?: string): string {
    const parts = path.split('/');
    let out = parts[parts.length - 1];
    if (suffix !== undefined && out.endsWith(suffix)) {
        out = out.slice(0, out.length - suffix.length);
    }
    return out;
}

export const delimiter = ':';

export function dirname(path: string): string {
    const parts = path.split('/');
    return parts.slice(0, parts.length - 1).join('/');
}

export function extname(path: string): string {
    const parts = path.split('.');
    return parts[parts.length - 1];
}

export function isAbsolute(path: string): boolean {
    return path.startsWith('/');
}

export function join(...paths: string[]): string {
    return normalize(paths.join('/'));
}

export function normalize(path: string): string {
    let out: string[] = [];
    const segments = path.split('/');
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if ((segment === '.' && i !== 0) || segment === '') {
            continue;
        } else if (segment === '..') {
            out.pop();
        } else {
            out.push(segment);
        }
    }
    return out.join('');
}

export function resolve(...paths: string[]): string {
    const path = join(...paths);
    if (path.startsWith('/')) {
        return path;
    } else {
        return globalThis.__fakeNode_wd + path;
    }
}

export const sep = '/';
