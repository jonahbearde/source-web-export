interface Vector {
  x: number;
  y: number;
  z: number;
}

interface DEdge {
  v: number[];
}

type DSurfEdge = number;

interface DFace {
  planenum: number;
  side: number;
  onNode: number;
  firstedge: number;
  numedges: number;
  texinfo: number;
  dispinfo: number;
  surfaceFogVolumeID: number;
  styles: number[];
  lightofs: number;
  area: number;
  LightmapTextureMinsInLuxels: number[];
  LightmapTextureSizeInLuxels: number[];
  origFace: number;
  numPrims: number;
  firstPrimID: number;
  smoothingGroups: number;
}

interface DPlane {
  normal: Vector;
  dist: number;
  type: number; // plane axis identifier
}
