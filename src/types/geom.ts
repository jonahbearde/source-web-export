export interface Vector {
  x: number
  y: number
  z: number
}

export interface DEdge {
  v: number[]
}

export type DSurfEdge = number

export interface DFace {
  planenum: number
  side: number
  onNode: number
  firstedge: number
  numedges: number
  texinfo: number
  dispinfo: number
  surfaceFogVolumeID: number
  styles: number[]
  lightofs: number
  area: number
  LightmapTextureMinsInLuxels: number[]
  LightmapTextureSizeInLuxels: number[]
  origFace: number
  numPrims: number
  firstPrimID: number
  smoothingGroups: number
}

export interface DPlane {
  normal: Vector
  dist: number
  type: number // plane axis identifier
}

export interface Vertex {
  position: [number, number, number]
  norm: [number, number, number]
  // uv: [number, number];
}

export interface Triangle {
  vertices: Vertex[]
  texName: string
}
