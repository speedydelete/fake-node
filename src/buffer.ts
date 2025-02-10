
/// <reference path="./in_fake_node.d.ts" />

const Blob_ = Blob;
export {Blob_ as Blob};

export type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";

export class Buffer extends Uint8Array {

    toString(encoding: BufferEncoding = 'utf-8'): string {
        return (new TextDecoder(encoding)).decode(this);
    }

}
