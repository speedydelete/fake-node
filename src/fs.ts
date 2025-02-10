
/// <reference path="./in_fake_node.d.ts" />
import {callbackify, type TypedArray} from './util';
import {dirname, filename, resolve} from './path';
import {Buffer, type BufferEncoding} from './buffer';
import {constants, parsePathArg, Directory, FileSystem} from './_fs';
import type {PathArg, ModeArg, DataArg, TimeArg, Flag, Stats, BigIntStats, StatFs, BigIntStatFs} from './_fs';


const fs = __fakeNode__.fs;


export {constants} from './_fs';

export {Stats, BigIntStats, StatFs, BigIntStatFs} from './_fs';

export function accessSync(path: PathArg, mode: number = constants.F_OK) {
    fs.get(path).access(mode);
}

export function appendFileSync(path: PathArg, data: DataArg, {encoding = 'utf8', mode = 0o666, flag = 'a'}: {encoding?: BufferEncoding, mode: number, flag: string}) {
    fs.getRegular(path).append(data, encoding);
}

export function chmodSync(path: PathArg, mode: ModeArg): void {
    fs.get(path).chmod(mode);
}

export function chownSync(path: PathArg, uid: number, gid: number): void {
    fs.get(path).chown(uid, gid);
}

export function closeSync(fd: number): void {
    fs.fileDescriptors[fd] = null;
}

export function copyFileSync(src: PathArg, dest: PathArg, mode: number = 0): void {
    if ((mode & constants.COPYFILE_EXCL) === constants.COPYFILE_EXCL && fs.exists(dest)) {
        throw new TypeError(`${dest} exists`);
    }
    if ((mode & constants.COPYFILE_FICLONE_FORCE) === constants.COPYFILE_FICLONE_FORCE) {
        throw new TypeError('fake-node does not support copy-on-write');
    }
    fs.getRegular(dest).write(fs.getRegular(src).read());
}

export function existsSync(path: PathArg): boolean {
    return fs.exists(path);
}

export function fchmodSync(fd: number, mode: ModeArg): void {
    fs.getfd(fd).chmod(mode);
}

export function fchownsync(fd: number, uid: number, gid: number): void {
    fs.getfd(fd).chown(uid, gid);
}

export function fdatasyncSync(fd: number): void {
    return;
}

export function fstatSync(fd: number): Stats {
    return fs.getfd(fd).stat();
}

export function fsyncSync(fd: number): void {
    return;
}

export function ftruncateSync(fd: number, len: number): void {
    let file = fs.getfdRegular(fd);
    file.data = file.data.slice(0, len);
}

export function futimesSync(fd: number, atime: TimeArg, ctime: TimeArg): void {
    fs.getfd(fd).utimes(atime, ctime);
}

export function globSync(pattern: string | string[]): string[] {
    throw new TypeError('globs are not supported in fake-node');
}

export function lchmodSync(path: PathArg, mode: number): void {
    fs.lget(path).chmod(mode);
}

export function lchownSync(path: PathArg, uid: number, gid: number): void {
    fs.lget(path).chown(uid, gid);
}

export function lutimesSync(path: PathArg, atime: TimeArg, mtime: TimeArg): void {
    fs.lget(path).utimes(atime, mtime);
}

export function linkSync(existingPath: PathArg, newPath: PathArg): void {
    fs.get(dirname(parsePathArg(existingPath))).new(filename(parsePathArg(newPath)), fs.get(existingPath));
}

export function lstatSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: false, throwIfNoEntry: false}): Stats;
export function lstatSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: false, throwIfNoEntry: true}): Stats | undefined;
export function lstatSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: true, throwIfNoEntry: false}): BigIntStats;
export function lstatSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: true, throwIfNoEntry: true}): BigIntStats | undefined;
export function lstatSync(path: PathArg, {bigint = false, throwIfNoEntry = false}: {bigint?: boolean, throwIfNoEntry?: boolean} = {}): Stats | BigIntStats | undefined {
    if (!throwIfNoEntry && !fs.exists(path)) {
        return undefined;
    }
    return fs.lget(path).stat({bigint});
}

export function mkdirSync(path: PathArg, options: {recursive?: boolean, mode?: string | number} | number = 0o777): void {
    fs.mkdir(path, typeof options === 'number' ? {recursive: false, mode: options} : options);
}

export function mkdtempSync(prefix: PathArg, options: {encoding?: string} | string = 'utf8'): void {
    throw new TypeError('fs.mkdtemp is not supported in fake-node');
}

export function opendirSync(path: PathArg, {encoding = 'utf8', bufferSize = 32, recursive = false}: {encoding?: string, bufferSize?: number, recursive?: boolean} = {}): void {
    throw new TypeError('fs.opendir is not supported in fake-node');
}

export function openSync(path: PathArg, flags: Flag, mode: ModeArg = 'r'): void {
    return fs.open(path, flags, mode);
}

export function readdirSync(path: PathArg, options: {encoding?: string, withFileTypes?: boolean, recursive?: boolean} | string = 'utf8') {
    throw new TypeError('fs.readdir is not supported in fake-node');
}

export function readFileSync(path: PathArg, options: {encoding?: null | 'buffer', flag?: string} | 'buffer'): Buffer;
export function readFileSync(path: PathArg, options: {encoding: string, flag?: string} | string): string;
export function readFileSync(path: PathArg, options: {encoding?: string | null, flag?: string} | string = {encoding: null, flag: 'r'}): string | Buffer {
    return fs.getRegular(path).read(typeof options === 'string' ? options : options.encoding ?? 'buffer');
}

export function readlinkSync(path: PathArg, options: {encoding?: string} | string = 'utf8'): string | Buffer {
    throw new TypeError('fs.readlink is not supported in fake-node');
}

export function readSync(fd: number, buffer: Buffer | TypedArray | DataView, offset: number, length: number, position: number | bigint | null = null): number {
    position = Number(position ?? 0);
    const data = fs.getfdRegular(fd).read('uint8array', offset, length);
    if (buffer instanceof DataView) {
        for (let i = position; i < data.length; i++) {
            buffer.setUint8(i, data[i]);
        }
    } else {
        buffer.set(data, position);
    }
    return length;
}

export function readvSync(fd: number, buffers: ArrayBufferView[], position: number | null = null): number {
    throw new TypeError('fs.readv is not supported in fake-node');
}

export function realpathSync(path: PathArg, {encoding}: {encoding: string} = {encoding: 'utf8'}): string {
    return resolve(path);
}
realpathSync.native = realpathSync;

export function renameSync(oldPath: PathArg, newPath: PathArg): void {
    const parsedOldPath = parsePathArg(oldPath);
    const parsedNewPath = parsePathArg(newPath);
    const file = fs.get(dirname(parsedOldPath)).unlink(filename(parsedOldPath));
    fs.get(dirname(parsedNewPath)).link(filename(parsedNewPath), file);
}

export function rmdirSync(path: PathArg): void {
    const file = fs.get(path);
    if (!(file instanceof Directory)) {
        throw new TypeError(`cannot remove directory ${path}: is not a directory`);
    } else if (!(file.files.length === 0)) {
        throw new TypeError(`cannot remove directory ${path}: is not empty`);
    }
    fs.unlink(path);
}

export function rmSync(path: PathArg, {recursive = false}: {recursive?: boolean} = {}) {
    fs.rm(path, recursive);
}

export function statSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: false, throwIfNoEntry: false}): Stats;
export function statSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: false, throwIfNoEntry: true}): Stats | undefined;
export function statSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: true, throwIfNoEntry: false}): BigIntStats;
export function statSync(path: PathArg, {bigint, throwIfNoEntry}: {bigint?: true, throwIfNoEntry: true}): BigIntStats | undefined;
export function statSync(path: PathArg, {bigint = false, throwIfNoEntry = false}: {bigint?: boolean, throwIfNoEntry?: boolean} = {}): Stats | BigIntStats | undefined {
    if (!throwIfNoEntry && !fs.exists(path)) {
        return undefined;
    }
    return fs.get(path).stat({bigint});
}

export function statfsSync(path: PathArg, {bigint}: {bigint?: false}): StatFs;
export function statfsSync(path: PathArg, {bigint}: {bigint?: true}): BigIntStatFs;
export function statfsSync(path: PathArg, {bigint = false}: {bigint?: boolean} = {}): StatFs | BigIntStatFs {
    let file = fs.get(path);
    if (!(file instanceof FileSystem)) {
        throw new TypeError(`cannot get fs stat for ${path}: is not a file system`);
    }
    return file.statfs(bigint);
}

export function symlinkSync(target: PathArg, path: PathArg): void {
    fs.symlink(target, path);
}

export function truncateSync(path: PathArg, len: number = 0): void {
    let file = fs.getRegular(path);
    file.data = file.data.slice(0, len);
}

export function unlinkSync(path: PathArg): void {
    fs.unlink(path);
}

export function utimesSync(path: PathArg, atime: TimeArg, mtime: TimeArg) {
    fs.get(path).utimes(atime, mtime);
}
