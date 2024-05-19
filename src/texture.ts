import type { DLump } from "./types/bsp"
import type { TexInfo, DTexData } from "./types/tex"
import type { Vector } from "./types/geom"

export function readTextures(bspArray: Uint8Array, textureInfo: DLump) {
  const textures: TexInfo[] = []
  const texView = new DataView(
    bspArray.buffer,
    textureInfo.fileofs,
    textureInfo.filelen,
  )

  for (let i = 0; i < textureInfo.filelen / 72; i++) {
    const offset = i * 72
    const texVecS = []

    texVecS.push(texView.getFloat32(0, true))
    texVecS.push(texView.getFloat32(offset + 4, true))
    texVecS.push(texView.getFloat32(offset + 8, true))
    texVecS.push(texView.getFloat32(offset + 12, true))

    const texVecT = []
    texVecT.push(texView.getFloat32(offset + 16, true))
    texVecT.push(texView.getFloat32(offset + 20, true))
    texVecT.push(texView.getFloat32(offset + 24, true))
    texVecT.push(texView.getFloat32(offset + 28, true))

    const lightVecS = []

    lightVecS.push(texView.getFloat32(32, true))
    lightVecS.push(texView.getFloat32(offset + 36, true))
    lightVecS.push(texView.getFloat32(offset + 40, true))
    lightVecS.push(texView.getFloat32(offset + 44, true))

    const lightVecT = []

    lightVecT.push(texView.getFloat32(offset + 48, true))
    lightVecT.push(texView.getFloat32(offset + 52, true))
    lightVecT.push(texView.getFloat32(offset + 56, true))
    lightVecT.push(texView.getFloat32(offset + 60, true))

    const flags = texView.getInt32(offset + 64, true)
    const texdata = texView.getInt32(offset + 68, true)

    const texInfo: TexInfo = {
      textureVecs: [texVecS, texVecT],
      lightmapVecs: [lightVecS, lightVecT],
      flags,
      texdata,
    }
    textures.push(texInfo)
  }

  return textures
}

export function readTexData(bspArray: Uint8Array, texDataInfo: DLump) {
  const texData: DTexData[] = []
  const texDataView = new DataView(
    bspArray.buffer,
    texDataInfo.fileofs,
    texDataInfo.filelen,
  )

  for (let i = 0; i < texDataInfo.filelen / 32; i++) {
    const offset = i * 32
    const reflectivity: Vector = {
      x: texDataView.getFloat32(offset, true),
      y: texDataView.getFloat32(offset + 4, true),
      z: texDataView.getFloat32(offset + 8, true),
    }

    const nameStringTableID = texDataView.getInt32(offset + 12, true)
    const width = texDataView.getInt32(offset + 16, true)
    const height = texDataView.getInt32(offset + 20, true)
    const view_width = texDataView.getInt32(offset + 24, true)
    const view_height = texDataView.getInt32(offset + 28, true)

    const texDataInfo: DTexData = {
      reflectivity,
      nameStringTableID,
      width,
      height,
      view_width,
      view_height,
    }
    texData.push(texDataInfo)
  }

  return texData
}

export function readTexDataStringTable(
  bspArray: Uint8Array,
  texDataStringTableInfo: DLump,
) {
  const texTable: number[] = []
  const texTableView = new DataView(
    bspArray.buffer,
    texDataStringTableInfo.fileofs,
    texDataStringTableInfo.filelen,
  )

  for (let i = 0; i < texDataStringTableInfo.filelen / 4; i++) {
    const offset = i * 4
    texTable.push(texTableView.getInt32(offset))
  }

  return texTable
}

export function readTexDataStringData(
  bspArray: Uint8Array,
  texDataStringDataInfo: DLump,
) {
  const decoder = new TextDecoder()

  const strings = decoder.decode(
    bspArray.subarray(
      texDataStringDataInfo.fileofs,
      texDataStringDataInfo.fileofs + texDataStringDataInfo.filelen,
    ),
  )

  const texStrings = strings.split("\0").filter((s) => s !== "")

  return texStrings
}
