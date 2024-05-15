import type { DLump } from "./types/bsp";

export function readGeometry(
  bspArray: Uint8Array,
  planesInfo: DLump,
  facesInfo: DLump,
  surfEdgesInfo: DLump,
  edgesInfo: DLump,
  verticesInfo: DLump,
) {
  const planes = readPlanes(bspArray, planesInfo);
  const faces = readFaces(bspArray, facesInfo);
  const surfEdges = readSurfEdges(bspArray, surfEdgesInfo);
  const edges = readEdges(bspArray, edgesInfo);
  const vertices = readVertices(bspArray, verticesInfo);
}

export function readPlanes(bspArray: Uint8Array, planesInfo: DLump) {
  const planes = [];
  const planesView = new DataView(
    bspArray.buffer,
    planesInfo.fileofs,
    planesInfo.filelen,
  );

  for (let i = 0; i < planesInfo.filelen / 20; i++) {
    const offset = i * 20;
    const normal = {
      x: planesView.getFloat32(0, true),
      y: planesView.getFloat32(offset + 4, true),
      z: planesView.getFloat32(offset + 8, true),
    };
    const dist = planesView.getFloat32(offset + 12, true);
    const type = planesView.getInt32(offset + 16, true);

    planes.push({ normal, dist, type });
  }

  // console.log(planes)

  return planes;
}

export function readFaces(bspArray: Uint8Array, facesInfo: DLump) {
  const faces = [];
  const facesView = new DataView(
    bspArray.buffer,
    facesInfo.fileofs,
    facesInfo.filelen,
  );

  for (let i = 0; i < facesInfo.filelen / 56; i++) {
    const offset = i * 56;
    const face: any = {
      planenum: facesView.getUint16(offset, true),
      side: facesView.getInt8(offset + 2),
      onNode: facesView.getInt8(offset + 3),
      firstedge: facesView.getInt32(offset + 4, true),
      numedges: facesView.getInt16(offset + 8, true),
      texinfo: facesView.getInt16(offset + 10, true),
      dispinfo: facesView.getInt16(offset + 12, true),
      surfaceFogVolumeID: facesView.getInt16(offset + 14, true),
      styles: [
        facesView.getInt8(offset + 16),
        facesView.getInt8(offset + 17),
        facesView.getInt8(offset + 18),
        facesView.getInt8(offset + 19),
      ],
      lightofs: facesView.getInt32(offset + 20, true),
      area: facesView.getFloat32(offset + 24, true),
      LightmapTextureMinsInLuxels: [
        facesView.getInt32(offset + 28, true),
        facesView.getInt32(offset + 32, true),
      ],
      LightmapTextureSizeInLuxels: [
        facesView.getInt32(offset + 36, true),
        facesView.getInt32(offset + 40, true),
      ],
      origFace: facesView.getInt32(offset + 44, true),
      numPrims: facesView.getUint16(offset + 48, true),
      firstPrimID: facesView.getUint16(offset + 50, true),
      smoothingGroups: facesView.getUint32(offset + 52, true),
    };

    faces.push(face);
  }

  // console.log(faces.length)

  return faces;
}

export function readSurfEdges(bspArray: Uint8Array, surfEdgesInfo: DLump) {
  const surfEdges = [];
  const surfEdgesView = new DataView(
    bspArray.buffer,
    surfEdgesInfo.fileofs,
    surfEdgesInfo.filelen,
  );

  for (let i = 0; i < surfEdgesInfo.filelen / 4; i++) {
    const offset = i * 4;
    surfEdges.push(surfEdgesView.getInt32(offset, true));
  }

  // console.log(surfEdges)

  return surfEdges;
}

export function readEdges(bspArray: Uint8Array, edgesInfo: DLump) {
  const edges = [];
  const edgesView = new DataView(
    bspArray.buffer,
    edgesInfo.fileofs,
    edgesInfo.filelen,
  );

  for (let i = 0; i < edgesInfo.filelen / 4; i++) {
    const offset = i * 4;
    const v = [];
    v.push(edgesView.getUint16(offset, true));
    v.push(edgesView.getUint16(offset + 2, true));
    edges.push(v);
  }

  // console.log(edges);

  return edges;
}

export function readVertices(bspArray: Uint8Array, verticesInfo: DLump) {
  const vertices = [];
  const verticesView = new DataView(
    bspArray.buffer,
    verticesInfo.fileofs,
    verticesInfo.filelen,
  );

  for (let i = 0; i < verticesInfo.filelen / 12; i++) {
    const offset = i * 12;
    const vertex = {
      x: verticesView.getFloat32(offset, true),
      y: verticesView.getFloat32(offset + 4, true),
      z: verticesView.getFloat32(offset + 8, true),
    };
    vertices.push(vertex);
  }

  // console.log(vertices);
}
