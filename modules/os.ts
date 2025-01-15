
export const EOL = '\r\n';

export function availableParallelism(): number {
    return navigator.hardwareConcurrency;
}

export function arch(): string {
    return 'web';
}

export const constants = {

};

export function cpus(): {model: string, speed: number, times: {user: number, nice: number, sys: number, idle: number, irq: number}}[] {
    return [];
}

export const devNull = '/dev/null';

export function endianness(): string {
    return 'LE';
}

export function freemem(): number {
    // @ts-ignore
    return navigator.deviceMemory * 2**30;
}

export function homedir(): string {
    return '/home/root';
}

export function hostname(): string {
    return 'fake-node';
}

export function loadavg(): [number, number, number] {
    return [0, 0, 0];
}

export function machine(): string {
    return 'fake';
}

export function platform(): string {
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

export function tmpdir(): string {
    return '/tmp';
}

export function totalmem(): number {
    // @ts-ignore
    return navigator.deviceMemory * 2**30;
}

export function type(): string {
    const data = navigator.userAgent.slice('Mozilla/5.0 ('.length, navigator.userAgent.indexOf(')'));
    if (data.includes('Windows NT')) {
        return 'Windows_NT';
    } else if (data.includes('Linux')) {
        return 'Linux';
    } else if (data.includes('Mac')) {
        return 'Darwin';
    } else {
        return 'unknown';
    }
}

