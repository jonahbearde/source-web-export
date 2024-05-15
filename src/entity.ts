import type { DLump } from "./types/bsp";
import type { DEntity } from "./types/entity";

export function readEntities(bspArray: Uint8Array, lumpinfo: DLump) {
  const decoder = new TextDecoder();

  const keyValues = decoder.decode(
    bspArray.subarray(lumpinfo.fileofs, lumpinfo.fileofs + lumpinfo.filelen),
  );

  const entities = readKeyValues(keyValues);

  // console.log(entities);

  return entities;
}

function readKeyValues(keyValues: string): DEntity[] {
  const blockRegex = /{[^{}]*}/g;
  const keyValueRegex = /"([^"]*)"\s*"([^"]*)"/g;

  const entities: DEntity[] = [];

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(keyValues)) !== null) {
    const block = match[0];
    const entity: DEntity = {};

    let keyValMatch: RegExpExecArray | null;
    while ((keyValMatch = keyValueRegex.exec(block)) !== null) {
      const key = keyValMatch[1];
      const value = keyValMatch[2];
      entity[key] = value;
    }

    entities.push(entity);
  }

  return entities;
}
