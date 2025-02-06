
import '@fake-node/types';
import * as process from 'process';
import {resolve} from 'path';
import {Buffer} from 'buffer';


const F_OK = 0;
const X_OK = 1;
const W_OK = 2;
const R_OK = 4;

const COPYFILE_EXCL = 1;
const COPYFILE_FICLONE = 2;
const COPYFILE_FICLONE_FORCE = 4;

const O_RDONLY = 1;
const O_WRONLY = 2;
const O_RDWR = O_RDONLY | O_WRONLY;
const O_CREAT = 4;
const O_EXCL = 8;
const O_NOCTTY = 16;
const O_TRUNC = 32;
const O_APPEND = 64;
const O_DIRECTORY = 128;
const O_NOATIME = 256;
const O_NOFOLLOW = 512;
const O_SYNC = 1024;
const O_DSYNC = 2048;
const O_SYMLINK = 4096;
const O_DIRECT = 8192;
const O_NONBLOCK = 16384;
const UV_FS_O_FILEMAP = 32768;

const S_IMFT = 0xF000;
const S_IFREG = 0x8000;
const S_IFDIR = 0x4000;
const S_IFCHR = 0x2000;
const S_IFBLK = 0x6000;
const S_IFIFO = 0x1000;
const S_IFLNK = 0xA000;
const S_IFSOCK = 0xC000;

const S_IRWXU = 0o700;
const S_IRUSR = 0o400;
const S_IWUSR = 0o200;
const S_IXUSR = 0o100;
const S_IRWXG = 0o070;
const S_IRGRP = 0o040;
const S_IWGRP = 0o020;
const S_IXGRP = 0o010;
const S_IRWXO = 0o007;
const S_IROTH = 0o004;
const S_IWOTH = 0o002;
const S_IXOTH = 0o001;


export const constants = {F_OK, X_OK, W_OK, R_OK, COPYFILE_EXCL, COPYFILE_FICLONE, COPYFILE_FICLONE_FORCE, O_RDONLY, O_WRONLY, O_RDWR, O_CREAT, O_EXCL, O_NOCTTY, O_TRUNC, O_APPEND, O_DIRECTORY, O_NOATIME, O_NOFOLLOW, O_SYNC, O_DSYNC, O_SYMLINK, O_DIRECT, O_NONBLOCK, UV_FS_O_FILEMAP, S_IMFT, S_IFREG, S_IFDIR, S_IFCHR, S_IFBLK, S_IFIFO, S_IFLNK, S_IFSOCK, S_IRWXU, S_IRUSR, S_IWUSR, S_IXUSR, S_IRWXG, S_IRGRP, S_IWGRP, S_IXGRP, S_IRWXO, S_IROTH, S_IWOTH, S_IXOTH};


const encoder = new TextEncoder();

let fileDescriptors: string[] = [];


type PathArg = string | URL | Buffer | number;

function parsePathArg(arg: PathArg): string {
    if (typeof arg === 'string') {
        return resolve(arg);
    } else if (typeof arg === 'number') {
        if (fileDescriptors[arg] === null) {
            throw new TypeError(`file descriptor ${arg} is closed`);
        }
        return fileDescriptors[arg];
    } else if (arg instanceof Buffer) {
        return resolve(arg.toString('utf8'));
    } else if (arg instanceof URL) {
        if (arg.protocol === 'file:') {
            return resolve(arg.pathname);
        } else {
            throw new TypeError(`invalid file URL: ${arg}`);
        }
    } else {
        throw new TypeError(`invalid path: ${arg}`);
    }
}

const flags = {
    'a': O_CREAT | O_APPEND,
    'ax': O_CREAT | O_EXCL | O_APPEND,
    'a+': O_RDONLY | O_CREAT | O_APPEND,
    'ax+': O_RDONLY | O_CREAT | O_EXCL | O_APPEND,
    'as': O_CREAT | O_APPEND | O_SYNC,
    'as+': O_RDONLY | O_CREAT | O_APPEND | O_SYNC,
    'r': O_RDONLY,
    'rs': O_RDONLY | O_SYNC,
    'r+': O_RDONLY | O_WRONLY,
    'rs+': O_RDONLY | O_WRONLY | O_SYNC,
    'w': O_WRONLY | O_CREAT | O_TRUNC,
    'wx': O_WRONLY | O_CREAT | O_EXCL | O_TRUNC,
    'w+': O_RDONLY | O_WRONLY | O_CREAT | O_TRUNC,
    'wx+': O_RDONLY | O_WRONLY | O_CREAT | O_EXCL | O_TRUNC,
}

export type Flag = number | keyof typeof flags;

function parseFlag(flag: Flag): number {
    if (typeof flag === 'string') {
        return flags[flag];
    } else {
        return flag;
    }
}

export type TimeArg = number | string | bigint | Date;

function parseTimeArg(time: TimeArg): bigint {
    if (typeof time === 'bigint') {
        return time;
    } else if (typeof time === 'number') {
        return BigInt(time * 1000000000);
    } else if (typeof time === 'string') {
        let timestamp = Date.parse(time);
        if (Number.isNaN(timestamp)) {
            timestamp = parseInt(time);
            if (Number.isNaN(timestamp)) {
                throw new TypeError(`invalid time argument ${time}`);
            } else {
                return BigInt(timestamp * 1000000);
            }
        } else {
            return BigInt(timestamp * 1000000);
        }
    } else if (time instanceof Date) {
        return BigInt(time.valueOf() * 1000000);
    } else {
        throw new TypeError(`invalid time value: ${time}`);
    }
}

type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

type BufferEncoding = "ascii" | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "latin1"
  | "binary"
  | "hex"


type DataArg = string | TypedArray | DataView | Iterable<any>;

function parseDataArg(data: DataArg, encoding: BufferEncoding = 'utf8'): Uint8Array {
    if (typeof data === 'string') {
        if (encoding === 'utf8') {
            return encoder.encode(data);
        } else {
            // @ts-ignore
            return new Uint8Array(Buffer.from(data, encoding));
        }
    } else if (data instanceof DataView || data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Int16Array || data instanceof Uint16Array || data instanceof Int32Array || data instanceof Uint32Array || data instanceof Float32Array || data instanceof Float64Array || data instanceof BigInt64Array || data instanceof BigUint64Array) {
        return new Uint8Array(data.buffer);
    } else if (data !== null && typeof data[Symbol.iterator] === 'function') {
        return new Uint8Array(data);
    } else {
        throw new TypeError(`invalid binary data: ${data}`);
    }
}

export type ModeArg = string | number;

const STRING_MODE_ARG_REGEX = /^([r-][w-][x-]){3}$/;

function parseModeArg(mode: ModeArg): number {
    if (typeof mode === 'number') {
        return mode;
    } else {
        if (!mode.match(STRING_MODE_ARG_REGEX)) {
            throw new TypeError(`invalid chmod mode: ${mode}`)
        }
        // @ts-ignore
        return parseInt('0b' + mode.replaceAll('-', '0').replace(/[rwx]/g, '1'));
    }
}


abstract class BaseStats {

    abstract mode: number | bigint;

    isBlockDevice() {
        return (Number(this.mode) & S_IFBLK) === S_IFBLK;
    }

    isCharacterDevice() {
        return (Number(this.mode) & S_IFCHR) === S_IFCHR;
    }

    isDirectory() {
        return (Number(this.mode) & S_IFDIR) === S_IFDIR;
    }

    isFIFO() {
        return (Number(this.mode) & S_IFIFO) === S_IFIFO;
    }

    isFile() {
        return (Number(this.mode) & S_IFREG) === S_IFREG;
    }

    isSocket() {
        return (Number(this.mode) & S_IFSOCK) === S_IFSOCK;
    }

    isSymbolicLink() {
        return (Number(this.mode) & S_IFLNK) === S_IFLNK;
    }

}

export class Stats extends BaseStats {

    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;

}

export class BigIntStats extends BaseStats {

    dev: bigint;
    ino: bigint;
    mode: bigint;
    nlink: bigint;
    uid: bigint;
    gid: bigint;
    rdev: bigint;
    size: bigint;
    blksize: bigint;
    blocks: bigint;
    atimeMs: bigint;
    mtimeMs: bigint;
    ctimeMs: bigint;
    birthtimeMs: bigint;
    atimeNs: bigint;
    mtimeNs: bigint;
    ctimeNs: bigint;
    birthtimeNs: bigint;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;

}


export class StatFs {

    bavail: number;
    bfree: number;
    blocks: number;
    bsize: number;
    ffree: number;
    files: number;
    type: number;

}


export class BigIntStatFs {

    bavail: bigint;
    bfree: bigint;
    blocks: bigint;
    bsize: bigint;
    ffree: bigint;
    files: bigint;
    type: bigint;

}


export interface FileParams {
    mode?: number;
    uid?: number;
    gid?: number;
}

export class FileObject {

    mode: number;
    uid: number;
    gid: number;
    links: Directory[];
    birthtime: bigint;
    atime: bigint;
    mtime: bigint;
    ctime: bigint;
    rdev: number = -1;

    constructor({mode, uid, gid}: FileParams) {
        this.mode = mode ?? (S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH);
        this.uid = uid ?? __fakeNode_process__.uid;
        this.gid = gid ?? __fakeNode_process__.gid;
        this.birthtime = process.hrtime.bigint();
        this.atime = this.birthtime;
        this.mtime = this.birthtime;
        this.ctime = this.birthtime;
    }

    setAtime() {
        this.atime = process.hrtime.bigint();
    }

    setMtime() {
        this.mtime = process.hrtime.bigint();
    }

    setCtime() {
        this.ctime = process.hrtime.bigint();
    }

    access(mode: number = F_OK): void {
        const chmodInfo = (this.mode >> 3) & 0o777;
        let perms: number;
        if (process.getuid() === this.uid) {
            perms = (chmodInfo >> 6) & 7;
        } else if (process.getgid() === this.gid) {
            perms = (chmodInfo >> 3) & 7;
        } else {
            perms = chmodInfo & 7;
        }
        if ((((mode & X_OK) === X_OK) && !((perms & X_OK) === X_OK)) || (((mode & W_OK) === W_OK) && !((perms & W_OK) === W_OK)) || (((mode & R_OK) === R_OK) && !((perms & R_OK) === R_OK))) {
            throw new Error(`mode ${mode} and permissions ${chmodInfo} are not compatible`);
        }
    }

    chmod(mode: string | number): void {
        mode = parseModeArg(mode);
        this.mode &= 0o170007;
        this.mode |= mode << 3;
        this.setCtime();
    }

    chown(uid: string | number, gid: string | number): void {
        this.uid = __fakeNode__.getUIDFromUser(uid);
        this.gid = __fakeNode__.getGIDFromGroup(gid);
        this.setCtime();
    }

    cp(): FileObject {
        return new FileObject({mode: this.mode, uid: this.uid, gid: this.gid});
    }

    cpr(): FileObject {
        return this.cp();
    }

    get size(): number {
        return -1;
    }

    utimes(atime: TimeArg, mtime: TimeArg) {
        this.atime = parseTimeArg(atime);
        this.mtime = parseTimeArg(mtime);
    }

    stat({bigint}: {bigint?: false}): Stats;
    stat({bigint}: {bigint: true}): BigIntStats;
    stat({bigint}: {bigint?: boolean}): Stats | BigIntStats {
        if (bigint) {
            let out = new BigIntStats();
            out.dev = 0n;
            out.ino = 0n;
            out.mode = BigInt(this.mode);
            out.nlink = BigInt(this.links.length);
            out.uid = BigInt(this.uid);
            out.gid = BigInt(this.gid);
            out.rdev = BigInt(this.rdev);
            out.size = BigInt(this.size);
            out.blksize = 4096n;
            out.blocks = BigInt(Math.ceil(this.size / 4096));
            out.atimeMs = this.atime / 1000000n;
            out.mtimeMs = this.mtime / 1000000n;
            out.ctimeMs = this.ctime / 1000000n;
            out.birthtimeMs = this.birthtime / 1000000n;
            out.atimeNs = this.atime;
            out.mtimeNs = this.mtime;
            out.ctimeNs = this.ctime;
            out.birthtimeNs = this.birthtime;
            out.atime = new Date(Number(this.atime / 1000000n));
            out.mtime = new Date(Number(this.mtime / 1000000n));
            out.ctime = new Date(Number(this.ctime / 1000000n));
            out.birthtime = new Date(Number(this.birthtime / 1000000n));
            return out;
        } else {
            let out = new Stats();
            out.dev = 0;
            out.ino = 0;
            out.mode = this.mode;
            out.nlink = this.links.length;
            out.uid = this.uid;
            out.gid = this.gid;
            out.rdev = this.rdev;
            out.size = this.size;
            out.blksize = 4096;
            out.blocks = Math.ceil(this.size / 4096);
            out.atimeMs = Number(this.atime / 1000000n);
            out.mtimeMs = Number(this.mtime / 1000000n);
            out.ctimeMs = Number(this.ctime / 1000000n);
            out.birthtimeMs = Number(this.birthtime / 1000000n);
            out.atime = new Date(Number(this.atime / 1000000n));
            out.mtime = new Date(Number(this.mtime / 1000000n));
            out.ctime = new Date(Number(this.ctime / 1000000n));
            out.birthtime = new Date(Number(this.birthtime / 1000000n));
            return out;
        }
    }

}


export class RegularFile extends FileObject {

    data: Uint8Array;

    constructor(data: DataArg, {mode = 0o6440, encoding, ...params}: FileParams & {encoding?: string}) {
        super({mode: mode | S_IFREG, ...params});
        this.write(data);
    }

    cp(): RegularFile {
        return new RegularFile(new Uint8Array(this.data), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

    read(encoding: BufferEncoding, start: number, length: number): string;
    read(encoding: 'uint8array', start: number, length: number): Uint8Array;
    read(encoding: 'buffer', start: number, length: number): Buffer;
    read(encoding: BufferEncoding | 'uint8array' | 'buffer' = 'utf8', start: number = 0, length: number = -1): string | Uint8Array | Buffer {
        if (encoding === 'uint8array') {
            return this.data;
        } else if (encoding === 'buffer') {
            return Buffer.from(this.data);
        } else {
            return (new TextDecoder(encoding)).decode(this.data);
        }
    }

    write(data: string, position?: number, encoding?: BufferEncoding): void;
    write(data: TypedArray | DataView | Iterable<any>, offset?: number, length?: number): void;
    write(data: DataArg, position?: number, encoding_or_length?: number | BufferEncoding): void {
        const encoding = typeof encoding_or_length === 'string' ? encoding_or_length : 'utf8';
        const length = typeof encoding_or_length === 'number' ? encoding_or_length : -1;
        const array = parseDataArg(data, encoding);
        if (position === 0 && length === -1) {
            this.data = array;
        } else if (length === -1) {
            this.data.set(array, position);
        } else {
            this.data.set(array.slice(0, length), position);
        }
    }

}


export class Directory extends FileObject {

    files: Map<string, FileObject>;

    constructor(files: Map<string, FileObject>, {mode, ...params}: FileParams);
    constructor(files: {[key: string]: FileObject}, {mode, ...params}: FileParams);
    constructor(files: MapIterator<[string, FileObject]>, {mode, ...params}: FileParams);
    constructor(files: Map<string, FileObject> | {[key: string]: FileObject} | MapIterator<[string, FileObject]> = new Map(), {mode = 0o6440, ...params}: FileParams) {
        super({mode: mode | S_IFDIR, ...params});
        if (files instanceof Map) {
            this.files = files;
        } else {
            this.files = new Map(Object.entries(files));
        }
    }

    get(path: PathArg): FileObject {
        const file = this.files.get(parsePathArg(path));
        if (file === undefined) {
            throw new TypeError(`file ${path} does not exist`);
        }
        return file;
    }

    cp(): Directory {
        return new Directory(this.files.entries(), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

    cpr(): Directory {
        return new Directory(new Map(Array.from(this.files.entries()).map(([name, file]) => [name, file.cpr()])), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

}
