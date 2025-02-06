
import '@fake-node/types';

export const EOL = '\n';

export function availableParallelism(): number {
    return __fakeNode_process__.fakeNode.window.navigator.hardwareConcurrency;
}

export function arch(): string {
    return 'web';
}

enum signals {
    SIGHUP = 1,
    SIGINT,
    SIGQUIT,
    SIGILL,
    SIGTRAP,
    SIGABRT,
    SIGIOT = SIGABRT,
    SIGBUS,
    SIGFPE,
    SIGKILL,
    SIGUSR1,
    SIGUSR2,
    SIGSEGV,
    SIGPIPE,
    SIGALRM,
    SIGTERM,
    SIGCHLD,
    SIGSTKFLT,
    SIGCONT,
    SIGSTOP,
    SIGTSTP,
    SIGBREAK,
    SIGTTIN,
    SIGTTOU,
    SIGURG,
    SIGXCPU,
    SIGXFSZ,
    SIGVTALRM,
    SIGPROF,
    SIGWINCH,
    SIGIO,
    SIGPOLL = SIGIO,
    SIGLOST,
    SIGPWR,
    SIGINFO = SIGPWR,
    SIGSYS,
    SIGUNUSED = SIGSYS,
}

enum errno {
    E2BIG,
    EACCES,
    EADDRINUSE,
    EADDRNONOTAVAIL,
    EAFNOSUPPORT,
    EAGAIN,
    EALREADY,
    EBADF,
    EBADMSG,
    EBUSY,
    ECANCELED,
    ECHILD,
    ECONNABORTED,
    ECONNREFUSED,
    ECONNRESET,
    EDEADLK,
    EDESTADDRREQ,
    EDOM,
    EDQUOT,
    EEXIST,
    EFAULT,
    EFBIG,
    EHOSTUNREACH,
    EIDRM,
    EILSEQ,
    EINPROGRESS,
    EINTR,
    EINVAL,
    EIO,
    EISCONN,
    EISDIR,
    ELOOP,
    EMFILE,
    EMLINK,
    EMGSIZE,
    EMULTIHOP,
    ENAMETOOLONG,
    ENETDOWN,
    ENETRESET,
    ENETUNREACH,
    ENFILE,
    ENOBUFS,
    ENODATA,
    ENODEV,
    ENOENT,
    ENOEXEC,
    ENOLCK,
    ENOLINK,
    ENOMEM,
    ENOMSG,
    ENOPROTOOPT,
    ENOSPC,
    ENOSR,
    ENOSTR,
    ENOSYS,
    ENOTCONN,
    ENOTDIR,
    ENOTEMPTY,
    ENOTSOCK,
    ENOTSUP,
    ENOTTY,
    ENXIO,
    EOPNOTSUPP,
    EOVERFLOW,
    EPERM,
    EPIPE,
    EPROTO,
    EPROTONOSUPPORT,
    EPROTOTYPE,
    ERANGE,
    EROFS,
    ESPIPE,
    ESRCH,
    ESTALE,
    ETIME,
    ETIMEDOUT,
    ETXTBSY,
    EWOULDBLOCK,
    EXDEV,
}

enum dlopen {
    RTLD_LAZY = 1,
    RTLD_NOW,
    RTLD_GLOBAL,
    RTLD_LOCAL,
    RTLD_DEEPBIND,
}

enum priority {
    PRIORITY_LOW = 1,
    PRIORITY_BELOW_NORMAL,
    PRIORITY_NORMAL,
    PRIORITY_ABOVE_NORMAL,
    PRIORITY_HIGH,
    PRIORITY_HIGHEST,
}

export const constants = {signals, errno, dlopen, priority};

export function cpus(): {model: string, speed: number, times: {user: number, nice: number, sys: number, idle: number, irq: number}}[] {
    return [];
}

export const devNull = '/dev/null';

export function endianness(): string {
    return 'LE';
}

export function freemem(): number {
    throw new TypeError('os.freemem is not supported in fake-node');
}

export function getPriority(pid: number = 0): number {
    return -1;
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
    return 'fake-node';
}

export function networkInterfaces(): {[key: string]: {address: string, netmask: string, family: 'IPV4' | 'IPV6', mac: string, internal: boolean, scopeid: number, cidr: string}} {
    throw new TypeError('os.networkInterfaces is not supported in fake-node');
}

export function platform(): string {
    const data = window.navigator.userAgent.slice('Mozilla/5.0 ('.length, navigator.userAgent.indexOf(')'));
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

export function release(): string {
    return platform();
}

export function setPriority(pid_or_priority: number, priority?: number): void {
    throw new TypeError('os.setPriority is not supported in fake-node');
}

export function tmpdir(): string {
    return '/tmp';
}

export function totalmem(): number {
    throw new TypeError('os.totalmem is not supported in fake-node');
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

export function uptime(): number {
    return window.performance.timeOrigin / 1000;
}

export function userInfo(): {username: string, uid: number, gid: number, shell: string, homedir: string} {
    return {
        username: __fakeNode_process__.fakeNode.getUserFromUID(__fakeNode_process__.getuid()),
        uid: __fakeNode_process__.getuid(),
        gid: __fakeNode_process__.getgid(),
        shell: '/bin/sh',
        homedir: homedir(),
    }
}

export function version(): string {
    return '0.1.0';
}
