import { readFile } from "node:fs/promises";
import type { DHeader, DLump } from "./types/bsp";
import { LumpType } from "./types/bsp";
import { readEntities } from "./entity";
import { readGeometry } from "./geometry";

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
  const headerView = new DataView(bspArray.buffer, 0, 8);

  const header: DHeader = {
    ident: headerView.getInt32(0, true),
    version: headerView.getInt8(4),
    lumps: [],
    mapRevision: 1,
  };

  for (let i = 0; i < 64; i++) {
    const lumpOffset = i * 16 + 8;
    const lumpView = new DataView(bspArray.buffer, lumpOffset, 16);
    const lump: DLump = {
      fileofs: lumpView.getInt32(0, true),
      filelen: lumpView.getInt32(4, true),
      version: lumpView.getInt8(8),
      type: lumpView.getInt8(12),
    };
    header.lumps.push(lump);
  }

  // console.log(header)

  const entities = readEntities(bspArray, header.lumps[LumpType.ENTITIES]);

  const geometry = readGeometry(
    bspArray,
    header.lumps[LumpType.PLANES],
    header.lumps[LumpType.FACES],
    header.lumps[LumpType.SURFEDGES],
    header.lumps[LumpType.EDGES],
    header.lumps[LumpType.VERTEXES],
  );
}
