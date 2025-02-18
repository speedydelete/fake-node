
/// <reference path="./in_fake_node.d.ts" />
import {Buffer, type BufferEncoding} from './buffer';


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


// functions copied over from path module so they can be used outside of fake-node

export function normalize(path: string): string {
    let out: string[] = [];
    for (const segment of path.split('/')) {
        if (segment === '' || segment === '.') {
            continue;
        } else if (segment === '..') {
            out.pop();
        } else {
            out.push(segment);
        }
    }
    return out.join('/');
}

export let cwdGetter = () => __fakeNode_process__.cwd;
export let uidGetter = () => __fakeNode_process__.uid;
export let gidGetter = () => __fakeNode_process__.gid;
export function setCwdGetter(newGetter: () => string) {
    cwdGetter = newGetter;
}
export function setUidGetter(newGetter: () => number) {
    uidGetter = newGetter;
}
export function setGidGetter(newGetter: () => number) {
    gidGetter = newGetter;
}

export function resolve(...paths: string[]): string {
    let out = '';
    for (let i = paths.length - 1; i >= 0; i--) {
        out += paths[i];
        if (out.startsWith('/')) {
            return out;
        }
    }
    return cwdGetter() + out;
}


export type PathArg = string | URL | Buffer;

export function parsePathArg(arg: PathArg): string {
    let out: string;
    if (typeof arg === 'string') {
        out = arg;
    } else if (arg instanceof Buffer) {
        out = arg.toString('utf-8');
    } else if (arg instanceof URL) {
        if (arg.protocol === 'file:') {
            out = arg.pathname;
            return normalize(resolve(arg.pathname));
        } else {
            throw new TypeError(`invalid file URL: ${arg}`);
        }
    } else {
        throw new TypeError(`invalid path: ${arg}`);
    }
    return resolve(normalize(out));
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

export function parseFlag(flag: Flag): number {
    if (typeof flag === 'string') {
        return flags[flag];
    } else {
        return flag;
    }
}

export type TimeArg = number | string | bigint | Date;

export function parseTimeArg(time: TimeArg): bigint {
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

export type DataArg = string | TypedArray | DataView | Iterable<any>;

export function parseDataArg(data: DataArg, encoding: BufferEncoding = 'utf8'): Uint8Array {
    if (typeof data === 'string') {
        if (encoding === 'utf8') {
            return (new TextEncoder()).encode(data);
        } else {
            // @ts-ignore
            return new Uint8Array(Buffer.from(data, encoding));
        }
    } else if (data instanceof DataView || data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Int16Array || data instanceof Uint16Array || data instanceof Int32Array || data instanceof Uint32Array || data instanceof Float32Array || data instanceof Float64Array || data instanceof BigInt64Array || data instanceof BigUint64Array) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } else if (data !== null && typeof data[Symbol.iterator] === 'function') {
        return new Uint8Array(data);
    } else {
        throw new TypeError(`invalid binary data: ${data}`);
    }
}

export type ModeArg = string | number;

const STRING_MODE_ARG_REGEX = /^([r-][w-][x-]){3}$/;

export function parseModeArg(mode: ModeArg): number {
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

    dev: number = -1;
    ino: number = -1;
    mode: number = -1;
    nlink: number = -1;
    uid: number = -1;
    gid: number = -1;
    rdev: number = -1;
    size: number = -1;
    blksize: number = -1;
    blocks: number = -1;
    atimeMs: number = -1;
    mtimeMs: number = -1;
    ctimeMs: number = -1;
    birthtimeMs: number = -1;
    atime: Date = new Date(0);
    mtime: Date = new Date(0);
    ctime: Date = new Date(0);
    birthtime: Date = new Date(0);

}

export class BigIntStats extends BaseStats {

    dev: bigint = -1n;
    ino: bigint = -1n;
    mode: bigint = -1n;
    nlink: bigint = -1n;
    uid: bigint = -1n;
    gid: bigint = -1n;
    rdev: bigint = -1n;
    size: bigint = -1n;
    blksize: bigint = -1n;
    blocks: bigint = -1n;
    atimeMs: bigint = -1n;
    mtimeMs: bigint = -1n;
    ctimeMs: bigint = -1n;
    birthtimeMs: bigint = -1n;
    atimeNs: bigint = -1n;
    mtimeNs: bigint = -1n;
    ctimeNs: bigint = -1n;
    birthtimeNs: bigint = -1n;
    atime: Date = new Date(0);
    mtime: Date = new Date(0);
    ctime: Date = new Date(0);
    birthtime: Date = new Date(0);

}


export class StatFs {

    bavail: number = -1;
    bfree: number = -1;
    blocks: number = -1;
    bsize: number = -1;
    ffree: number = -1;
    files: number = -1;
    type: number = -1;

}

export class BigIntStatFs {

    bavail: bigint = -1n;
    bfree: bigint = -1n;
    blocks: bigint = -1n;
    bsize: bigint = -1n;
    ffree: bigint = -1n;
    files: bigint = -1n;
    type: bigint = -1n;

}


export type ExportFormatVersion = 1;
export const currentExportFormatVersion: ExportFormatVersion = 1;

export interface FileParams {
    mode?: number;
    uid: number;
    gid: number;
}

export interface FileMetadata {
    mode: number;
    uid: number;
    gid: number;
    size: number;
    birthtime: bigint;
    atime: bigint;
    mtime: bigint;
    ctime: bigint;
}

export class FileObject implements FileMetadata {

    mode: number;
    uid: number;
    gid: number;
    birthtime: bigint;
    atime: bigint;
    mtime: bigint;
    ctime: bigint;
    rdev: number = -1;

    constructor({mode, uid, gid}: FileParams) {
        this.mode = mode ?? 0o6440;
        this.uid = uid;
        this.gid = gid;;
        this.birthtime = BigInt(Math.round(performance.now() * 1e9));
        this.atime = this.birthtime;
        this.mtime = this.birthtime;
        this.ctime = this.birthtime;
    }

    setAtime() {
        this.atime = BigInt(Math.round(performance.now() * 1e9));
    }

    setMtime() {
        this.mtime = BigInt(Math.round(performance.now() * 1e9));
    }

    setCtime() {
        this.ctime = BigInt(Math.round(performance.now() * 1e9));
    }

    access(mode: ModeArg = F_OK): void {
        const parsed = parseModeArg(mode);
        const chmodInfo = (this.mode >> 3) & 0o777;
        let perms: number;
        if (uidGetter() === this.uid) {
            perms = (chmodInfo >> 6) & 7;
        } else if (gidGetter() === this.gid) {
            perms = (chmodInfo >> 3) & 7;
        } else {
            perms = chmodInfo & 7;
        }
        if ((((parsed & X_OK) === X_OK) && !((perms & X_OK) === X_OK)) || (((parsed & W_OK) === W_OK) && !((perms & W_OK) === W_OK)) || (((parsed & R_OK) === R_OK) && !((perms & R_OK) === R_OK))) {
            throw new Error(`mode ${mode} and permissions ${chmodInfo} are not compatible`);
        }
    }

    chmod(mode: string | number): void {
        mode = parseModeArg(mode);
        this.mode &= 0o170007;
        this.mode |= mode << 3;
        this.setCtime();
    }

    chown(uid: number, gid: number): void {
        this.uid = uid;
        this.gid = gid;
        this.setCtime();
    }

    cp(): FileObject {
        return new FileObject({mode: this.mode, uid: this.uid, gid: this.gid});
    }

    cpr(): FileObject {
        return this.cp();
    }

    get size(): number {
        return 0;
    }

    utimes(atime: TimeArg, mtime: TimeArg) {
        this.atime = parseTimeArg(atime);
        this.mtime = parseTimeArg(mtime);
    }

    stat(bigint?: false): Stats;
    stat(bigint: true): BigIntStats;
    stat(bigint: boolean = false): Stats | BigIntStats {
        if (bigint) {
            let out = new BigIntStats();
            out.dev = 0n;
            out.ino = 0n;
            out.mode = BigInt(this.mode);
            out.nlink = -1n;
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
            out.nlink = -1;
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

    _export(): Uint8Array {
        let buffer = new ArrayBuffer(10);
        let view = new DataView(buffer);
        view.setUint16(0, this.mode, true);
        view.setUint16(2, this.uid, true);
        view.setUint16(4, this.gid, true);
        view.setUint32(6, this.size, true);
        return new Uint8Array(buffer);
    }

    static _import(data: Uint8Array, version: ExportFormatVersion = currentExportFormatVersion): FileMetadata {
        let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        return {
            mode: view.getUint16(0, true),
            uid: view.getUint16(2, true),
            gid: view.getUint16(4, true),
            size: view.getUint32(6, true),
            birthtime: 0n,
            atime: 0n,
            mtime: 0n,
            ctime: 0n,
        };
    }

    export(): Uint8Array {
        return this._export();
    }

}


export class RegularFile extends FileObject {

    data: Uint8Array;

    constructor(data: DataArg, {mode = 0o6440, encoding, ...params}: FileParams & {encoding?: BufferEncoding}) {
        super({mode: mode | S_IFREG, ...params});
        this.data = parseDataArg(data, encoding);
    }

    cp(): RegularFile {
        return new RegularFile(new Uint8Array(this.data), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

    read(encoding?: BufferEncoding, start?: number, length?: number): string;
    read(encoding: 'uint8array', start?: number, length?: number): Uint8Array;
    read(encoding: 'buffer', start?: number, length?: number): Buffer;
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
        this.setMtime();
    }

    append(data: DataArg, encoding: BufferEncoding = 'utf8'): void {
        const array = parseDataArg(data, encoding);
        let newData = new Uint8Array(this.data.length + array.length);
        newData.set(this.data, 0);
        newData.set(array, this.data.length);
        this.data = newData;
        this.setMtime();
    }

    get size(): number {
        return this.data.length;
    }

    export(): Uint8Array {
        let out = new Uint8Array(10 + this.size);
        out.set(this._export(), 0);
        out.set(this.data, 10);
        return out;
    }

    static import(data: Uint8Array, version: ExportFormatVersion = currentExportFormatVersion): RegularFile {
        const info = this._import(data, version);
        let out = new RegularFile(data.slice(10, 10 + info.size), info);
        out.atime = info.atime;
        out.mtime = info.mtime;
        out.ctime = info.ctime;
        out.birthtime = info.birthtime;
        return out;
    }

}


export class Directory extends FileObject {

    files: Map<string, FileObject>;

    constructor(files: Map<string, FileObject>, {mode, ...params}: FileParams);
    constructor(files: {[key: string]: FileObject}, {mode, ...params}: FileParams);
    constructor(files: MapIterator<[string, FileObject]>, {mode, ...params}: FileParams);
    constructor(files: Map<string, FileObject> | {[key: string]: FileObject} | MapIterator<[string, FileObject]> = new Map(), {mode = 0o7770, ...params}: FileParams) {
        super({mode: mode | S_IFDIR, ...params});
        if (files instanceof Map) {
            this.files = files;
        } else {
            this.files = new Map(Object.entries(files));
        }
    }

    cp(): Directory {
        return new Directory(this.files.entries(), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

    cpr(): Directory {
        return new Directory(new Map(Array.from(this.files.entries()).map(([name, file]) => [name, file.cpr()])), {mode: this.mode, uid: this.uid, gid: this.gid});
    }

    get size(): number {
        return this.files.size;
    }

    get recursiveSize(): number {
        let out = this.files.size;
        for (let file of this.files.values()) {
            if (file instanceof Directory) {
                out += file.recursiveSize;
            }
        }
        return out;
    }

    get(path: PathArg): FileObject {
        const segments = parsePathArg(path).slice(1).split('/');
        let file: FileObject = this;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (file instanceof Directory) {
                const newFile = file.files.get(segment);
                if (newFile === undefined) {
                    throw new TypeError(`${segments.slice(0, i + 1).join('/')} does not exist`);
                }
                file = newFile;
            } else {
                throw new TypeError(`${segments.slice(0, i).join('/')} is not a directory`);
            }
        }
        return file;
    }

    getRegular(path: PathArg): RegularFile {
        const file = this.get(path);
        if (!(file instanceof RegularFile)) {
            throw new TypeError(`${path} is not a regular file`);
        }
        return file as RegularFile;
    }

    getDir(path: PathArg): Directory {
        const file = this.get(path);
        if (!(file instanceof Directory)) {
            throw new TypeError(`${path} is not a directory`);
        }
        return file as Directory;
    }

    lget(path: PathArg): FileObject {
        return this.get(path);
    }

    exists(path: PathArg): boolean {
        const segments = parsePathArg(path).split('/');
        let file: FileObject = this;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (file instanceof Directory) {
                const newFile = file.files.get(segment);
                if (newFile === undefined) {
                    return false;
                }
            } else {
                throw new TypeError(`${segments.slice(0, i).join('/')} is not a directory`);
            }
        }
        return true;
    }

    link(path: PathArg, file: FileObject): void {
        this.files.set(parsePathArg(path), file);
    }

    unlink(path: PathArg): FileObject {
        const parsed = parsePathArg(path);
        let file = this.files.get(parsePathArg(parsed));
        if (file === undefined) {
            throw new TypeError(`${path} does not exist`);
        }
        this.files.delete(parsed);
        return file;
    }

    symlink(target: PathArg, path: PathArg): void {
        throw new TypeError('symlinks are not supported in fake-node');
    }

    mkdir(path: PathArg, recursive: boolean = false, mode: ModeArg = 0o7770): Directory {
        const parsed = parsePathArg(path);
        if (recursive) {
            const segments = parsed.split('/');
            let file: Directory = this;
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (file.exists(segment)) {
                    throw new TypeError(`cannot create ${path}: ${segments.slice(0, i).join('/')} exists`);
                }
                file = file.mkdir(path);
            }
            return file;
        } else {
            let file = new Directory(new Map(), {uid: this.uid, gid: this.gid, mode: parseModeArg(mode)});
            this.files.set(parsed, file);
            return file;
        }
    }

    readFrom(path: PathArg, encoding?: BufferEncoding, start?: number, length?: number): string;
    readFrom(path: PathArg, encoding: 'uint8array', start?: number, length?: number): Uint8Array;
    readFrom(path: PathArg, encoding: 'buffer', start?: number, length?: number): Buffer;
    readFrom(path: PathArg, encoding: BufferEncoding | 'uint8array' | 'buffer' = 'utf8', start: number = 0, length: number = -1): string | Uint8Array | Buffer {
        // @ts-ignore
        return this.getRegular(path).read(encoding, start, length);
    }

    writeTo(path: PathArg, data: string, position?: number, encoding?: BufferEncoding): void;
    writeTo(path: PathArg, data: TypedArray | DataView | Iterable<any>, offset?: number, length?: number): void;
    writeTo(path: PathArg, data: DataArg, position?: number, encoding_or_length?: number | BufferEncoding): void {
        if (this.exists(path)) {
            // @ts-ignore
            this.getRegular(path).write(data, position, encoding_or_length);
        } else {
            this.files.set(parsePathArg(path).slice(1), new RegularFile(data, {uid: this.uid, gid: this.gid}));
        }
    }

    export(): Uint8Array {
        const encoder = new TextEncoder();
        let entries = Array.from(this.files.entries().map(([name, data]) => [encoder.encode(name), data.export()]));
        let size = entries.map(([name, data]) => 1 + name.length + data.length).reduce((x, y) => x + y);
        let out = new Uint8Array(10 + size);
        out.set(this._export(), 0);
        let offset = 10;
        for (const [name, data] of entries) {
            out[offset] = name.length;
            out.set(name, offset + 1);
            offset += 1 + name.length;
            out.set(data, offset);
            offset += data.length;
        }
        return out;
    }

    static import(data: Uint8Array, version: ExportFormatVersion = currentExportFormatVersion): Directory {
        const decoder = new TextDecoder();
        const info = this._import(data, version);
        let offset = 10;
        let entries: [string, FileObject][] = [];
        for (let i = 0; i < info.size; i++) {
            const nameLength = data[offset];
            offset++;
            const name = decoder.decode(data.slice(offset, offset + nameLength));
            offset += nameLength;
            const meta = this._import(data.slice(offset, offset + 10), version);
            const fileData = data.slice(offset, offset + 10 + meta.size);
            offset += 10 + meta.size;
            let file: FileObject;
            if ((meta.mode & S_IFREG) === S_IFREG) {
                file = RegularFile.import(fileData);
            } else if ((meta.mode & S_IFDIR) === S_IFDIR) {
                file = Directory.import(fileData);
            } else {
                throw new TypeError(`invalid file mode: ${meta.mode}`);
            }
            entries.push([name, file]);
        }
        let out = new Directory(new Map(entries), info);
        out.atime = info.atime;
        out.mtime = info.mtime;
        out.ctime = info.ctime;
        out.birthtime = info.birthtime;
        return out;
    }

}


export class FileSystem extends Directory {

    fileDescriptors: (FileObject | null)[] = [];

    constructor(files: Map<string, FileObject> = DEFAULT_FILES) {
        super(files, {uid: 0, gid: 0});
    }

    getfd(fd: number): FileObject {
        const out = this.fileDescriptors[fd];
        if (out === null) {
            throw new TypeError(`file descriptor ${fd} is not accessible`);
        }
        return out;
    }

    getfdRegular(fd: number): RegularFile {
        const out = this.fileDescriptors[fd];
        if (out === null) {
            throw new TypeError(`file descriptor ${fd} is not accessible`);
        } else if (!(out instanceof RegularFile)) {
            throw new TypeError(`file descriptor ${fd} is not a regular file`);
        }
        return out;
    }

    open(path: PathArg, flags: Flag, mode: ModeArg = 'r'): number {
        return this.fileDescriptors.push(this.get(path));
    }

    statfs(bigint?: false): StatFs;
    statfs(bigint: true): BigIntStatFs;
    statfs(bigint?: boolean): StatFs | BigIntStatFs {
        if (bigint) {
            let out = new BigIntStatFs();
            out.bavail = -1n;
            out.bfree = -1n;
            out.blocks = -1n;
            out.bsize = -1n;
            out.ffree = -1n;
            out.files = BigInt(this.recursiveSize);
            out.type = 61267n;
            return out;
        } else {
            let out = new StatFs();
            out.bavail = Infinity;
            out.bfree = Infinity;
            out.blocks = Infinity;
            out.bsize = Infinity;
            out.ffree = Infinity;
            out.files = this.recursiveSize;
            out.type = 61267;
            return out;
        }
    }
    
    fsExport(): Uint8Array {
        const data = this.export();
        let out = new Uint8Array(1 + data.length);
        out[0] = currentExportFormatVersion;
        out.set(data, 1);
        return out;
    }

    static fsImport(data: Uint8Array): FileSystem {
        return new FileSystem(Directory.import(data.slice(1), (data[0] as ExportFormatVersion)).files);
    }

}


export const DEFAULT_FILES = new Map();
