import type { DLump } from "./types/bsp"
import type {
  DPlane,
  DFace,
  DSurfEdge,
  DEdge,
  Triangle,
  Vector,
} from "./types/geom"
import {
  readTextures,
  readTexData,
  readTexDataStringData,
  readTexDataStringTable,
} from "./texture"
import fs from "node:fs/promises"

export async function readGeometry(
  bspArray: Uint8Array,
  planesInfo: DLump,
  facesInfo: DLump,
  surfEdgesInfo: DLump,
  edgesInfo: DLump,
  verticesInfo: DLump,
  texturesInfo: DLump,
  texDataInfo: DLump,
  texDataStringTableInfo: DLump,
  texDataStringDataInfo: DLump,
) {
  const planes = readPlanes(bspArray, planesInfo)
  const faces = readFaces(bspArray, facesInfo)
  const surfEdges = readSurfEdges(bspArray, surfEdgesInfo)
  const edges = readEdges(bspArray, edgesInfo)
  const vertices = readVertices(bspArray, verticesInfo)

  const textures = readTextures(bspArray, texturesInfo)
  const texData = readTexData(bspArray, texDataInfo)
  const texTable = readTexDataStringTable(bspArray, texDataStringTableInfo)
  const texStrings = readTexDataStringData(bspArray, texDataStringDataInfo)

  const lightmappedFaces = faces.filter((face) => face.lightofs !== -1)

  const trianglesExp: Triangle[] = []

  for (let lightmappedFace of lightmappedFaces) {
    const edgesNum = lightmappedFace.numedges
    const firstIndex = lightmappedFace.firstedge

    const texture = textures[lightmappedFace.texinfo]

    const serfEdges = surfEdges.slice(firstIndex, firstIndex + edgesNum)

    const faceVertices = serfEdges
      .map((surfEdge) => {
        const edge = edges[Math.abs(surfEdge)]
        const vertexIndex = edge.v[surfEdge < 0 ? 1 : 0]
        return vertices[vertexIndex]
      })
      // anti-closewise
      .reverse()

    const trianglesVertsGroup: Vector[][] = []
    if (faceVertices.length > 3) {
      // triangulating faces
      for (let i = 1; i < faceVertices.length - 1; i++) {
        const triangle: Vector[] = []

        triangle.push(faceVertices[0])
        triangle.push(faceVertices[i])
        triangle.push(faceVertices[i + 1])

        trianglesVertsGroup.push(triangle)
      }
    } else {
      trianglesVertsGroup.push(faceVertices)
    }

    for (const triangleVerts of trianglesVertsGroup) {
      // attempt to tranform uvs failed, skill issue)
      // const { width, height } = texData[texture.texdata]

      // const texVecS = texture.textureVecs[0]
      // const vecT = texture.textureVecs[1]
      // // valve uses left-to-right top-to-bottom approach for uv, need to flip y?
      // const texVecT = [vecT[0], -vecT[1], vecT[2], vecT[3]]

      // const oldUVs: [number, number][] = []
      // for (let vertex of triangleVerts) {
      //   // console.log("vertex", vertex)

      //   const { x, y, z } = vertex
      //   const ou =
      //     (x * texVecS[0] + y * texVecS[1] + z * texVecS[2] + texVecS[3]) /
      //     width
      //   const ov =
      //     (x * texVecT[0] + y * texVecT[1] + z * texVecT[2] + texVecT[3]) /
      //     height

      //   // console.log("old u v of this vertex", ou, ov)

      //   oldUVs.push([ou, ov])
      // }

      // const farLeftU = Math.min(oldUVs[0][0], oldUVs[1][0], oldUVs[2][0])
      // const farBottomV = Math.min(oldUVs[0][1], oldUVs[1][1], oldUVs[2][1])

      // const moveU = farLeftU < 0 ? -farLeftU : 0
      // const moveV = farBottomV < 0 ? -farBottomV : 0

      // const movedUVs = oldUVs.map((uv) => [uv[0] + moveU, uv[1] + moveV]) as [
      //   number,
      //   number,
      // ][]
      // console.log("moved uvs of this triangle", movedUVs)

      // const farRightU = Math.max(oldUVs[0][0], oldUVs[1][0], oldUVs[2][0])
      // const farUpV = Math.max(oldUVs[0][1], oldUVs[1][1], oldUVs[2][1])

      // const repeatX = farRightU > 1 ? Math.floor(farRightU) : 1
      // const repeatY = farUpV > 1 ? Math.floor(farUpV) : 1
      // const offsetX = farRightU - Math.floor(farRightU)
      // const offsetY = farUpV - Math.floor(farUpV)

      const { x, y, z } = planes[lightmappedFace.planenum].normal

      const triangleExp: Triangle = {
        vertices: triangleVerts.map((vertex) => ({
          position: [vertex.x, vertex.y, vertex.z],
          norm: [x, y, z],
        })),
        // wtf valve
        texName:
          texStrings[texTable[texData[texture.texdata].nameStringTableID]],
      }

      trianglesExp.push(triangleExp)
    }
  }

  await fs.writeFile(
    "D:/cs2kz/source-maps-viewer/src/json/triangles.json",
    JSON.stringify(trianglesExp),
  )
}

export function readPlanes(bspArray: Uint8Array, planesInfo: DLump) {
  const planes: DPlane[] = []
  const planesView = new DataView(
    bspArray.buffer,
    planesInfo.fileofs,
    planesInfo.filelen,
  )

  for (let i = 0; i < planesInfo.filelen / 20; i++) {
    const offset = i * 20
    const normal = {
      x: planesView.getFloat32(0, true),
      y: planesView.getFloat32(offset + 4, true),
      z: planesView.getFloat32(offset + 8, true),
    }
    const dist = planesView.getFloat32(offset + 12, true)
    const type = planesView.getInt32(offset + 16, true)

    planes.push({ normal, dist, type })
  }

  return planes
}

export function readFaces(bspArray: Uint8Array, facesInfo: DLump) {
  const faces: DFace[] = []
  const facesView = new DataView(
    bspArray.buffer,
    facesInfo.fileofs,
    facesInfo.filelen,
  )

  for (let i = 0; i < facesInfo.filelen / 56; i++) {
    const offset = i * 56
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
    }

    faces.push(face)
  }

  return faces
}

export function readSurfEdges(bspArray: Uint8Array, surfEdgesInfo: DLump) {
  const surfEdges: DSurfEdge[] = []
  const surfEdgesView = new DataView(
    bspArray.buffer,
    surfEdgesInfo.fileofs,
    surfEdgesInfo.filelen,
  )

  for (let i = 0; i < surfEdgesInfo.filelen / 4; i++) {
    const offset = i * 4
    surfEdges.push(surfEdgesView.getInt32(offset, true))
  }

  return surfEdges
}

export function readEdges(bspArray: Uint8Array, edgesInfo: DLump) {
  const edges: DEdge[] = []
  const edgesView = new DataView(
    bspArray.buffer,
    edgesInfo.fileofs,
    edgesInfo.filelen,
  )

  for (let i = 0; i < edgesInfo.filelen / 4; i++) {
    const offset = i * 4
    const v: number[] = []
    v.push(edgesView.getUint16(offset, true))
    v.push(edgesView.getUint16(offset + 2, true))
    edges.push({ v })
  }

  return edges
}

export function readVertices(bspArray: Uint8Array, verticesInfo: DLump) {
  const vertices: Vector[] = []
  const verticesView = new DataView(
    bspArray.buffer,
    verticesInfo.fileofs,
    verticesInfo.filelen,
  )

  for (let i = 0; i < verticesInfo.filelen / 12; i++) {
    const offset = i * 12
    const vertex: Vector = {
      x: verticesView.getFloat32(offset, true),
      y: verticesView.getFloat32(offset + 4, true),
      z: verticesView.getFloat32(offset + 8, true),
    }
    vertices.push(vertex)
  }

  return vertices
}
