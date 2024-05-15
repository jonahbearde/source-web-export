import type { LumpInfo } from "./types/bsp";
import type { Entity } from "./types/entity";

export function readEntities(bspArray: Uint8Array, lumpinfo: LumpInfo) {
  const decoder = new TextDecoder();

  const keyValues = decoder.decode(
    bspArray.subarray(lumpinfo.offset, lumpinfo.offset + lumpinfo.length),
  );

  const entities = readKeyValues(keyValues);

  console.log(entities);
}

function readKeyValues(keyValues: string): Entity[] {
  const blockRegex = /{[^{}]*}/g;
  const keyValueRegex = /"([^"]*)"\s*"([^"]*)"/g;

  const entities: Entity[] = [];

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(keyValues)) !== null) {
    const block = match[0];
    const entity: Entity = {};

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
