
import {type FileSystem} from './_fs';

export {constants} from './_fs';

export class module_fs {

    fs: FileSystem;

    constructor(fs: FileSystem) {
        this.fs = fs;
    }

}
