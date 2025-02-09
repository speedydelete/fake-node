
/// <reference path="./in_fake_node.d.ts" />

const Blob_ = Blob;
export {Blob_ as Blob};

export class Buffer extends Uint8Array {

    toString(encoding: string = 'utf-8'): string {
        return (new TextDecoder(encoding)).decode(this);
    }

}
