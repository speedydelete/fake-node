
/// <reference path="./in_fake_node.d.ts" />
import {callbackify} from './util';
import {type BufferEncoding} from './buffer';
import {constants} from './_fs';
import type {PathArg, ModeArg, DataArg, Stats, BigIntStats} from './_fs';


const fs = __fakeNode__.fs;


export {constants} from './_fs';

export {Stats, BigIntStats} from './_fs';

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
    __fakeNode__.fileDescriptors[fd] = null;
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


