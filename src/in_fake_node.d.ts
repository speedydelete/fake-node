
import {FakeNode, Process} from './index';

declare global {
    var __fakeNode__: FakeNode;
    var __fakeNode_process__: Process;
    var module: {
        exports: {[key: string]: any},
    };
    var exports: {[key: string]: any};
    var require: typeof FakeNode.prototype.require;
}
