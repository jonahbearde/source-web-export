import type { Vector } from "./geom"

export interface TexInfo {
  textureVecs: number[][]
  lightmapVecs: number[][]
  flags: number
  texdata: number
}

export interface DTexData {
  reflectivity: Vector
  nameStringTableID: number
  width: number
  height: number
  view_width: number
  view_height: number
}
