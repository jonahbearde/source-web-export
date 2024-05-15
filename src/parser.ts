import { readFile } from "node:fs/promises";
import type { Header, LumpInfo } from "./types/bsp";
import { LumpType } from "./types/bsp";
import { readEntities } from "./entity";

export async function readBsp(bspPath: string) {
  try {
    const bspBuffer = await readFile(bspPath);
    const bspArray = new Uint8Array(bspBuffer);
    readHeader(bspArray);
  } catch (error) {
    console.log(error);
  }
}

function readHeader(bspArray: Uint8Array) {
  const decoder = new TextDecoder();

  const header: Header = {
    ident: decoder.decode(bspArray.subarray(0, 4)),
    version: parseInt(bspArray.subarray(4, 5).toString()),
    lumps: [],
    mapRevision: parseInt(bspArray.subarray(1032, 1033).toString()),
  };

  for (let i = 0; i < 64; i++) {
    const lumpOffset = i * 16 + 8;
    const lumpView = new DataView(bspArray.buffer, lumpOffset, 16);
    const lump: LumpInfo = {
      offset: lumpView.getUint32(0, true),
      length: lumpView.getUint32(4, true),
      version: lumpView.getUint8(8),
      type: lumpView.getUint8(12),
    };
    header.lumps.push(lump);
  }

  readEntities(bspArray, header.lumps[LumpType.ENTITIES]);
}
