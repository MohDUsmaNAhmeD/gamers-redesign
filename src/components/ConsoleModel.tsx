import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface ConsoleAPI {
  setPosition: (x: number, y: number, z: number) => void;
  setRotation: (x: number, y: number, z: number) => void;
  setScale: (s: number) => void;
  setOpacity: (v: number) => void;
  getObject: () => THREE.Group | null;
}

export function buildConsole() {
  const group = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xe8e9ed, roughness: .3, metalness: .03, clearcoat: .2, side: THREE.DoubleSide });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x101219, roughness: .28, metalness: .35, clearcoat: .8 });
  const vent = new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: .8 });
  const led = new THREE.MeshStandardMaterial({ color: 0x829dff, emissive: 0x315cff, emissiveIntensity: 2 });
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); group.add(mesh); return mesh;
  };
  const box = (w: number, h: number, d: number, r = .035) => new RoundedBoxGeometry(w, h, d, 3, r);
  add(box(.64, 3.18, 1.03, .09), dark, 0, .04);
  // Parametric flared side plates, with real thickness and curved front edges.
  for (const side of [-1, 1]) {
    const vertices: number[] = [], indices: number[] = [];
    const rows = 32, columns = 12;
    for (let layer = 0; layer < 2; layer++) for (let r = 0; r <= rows; r++) for (let c = 0; c <= columns; c++) {
      const t = r / rows, u = c / columns;
      const y = -1.64 + t * 3.45;
      const x = side * (.34 + .13 * Math.pow(t, 4) + .03 * Math.sin(t * Math.PI) + .045 * Math.sin(u * Math.PI) + layer * .047);
      const z = (u - .5) * (1.13 + .16 * t) + .035 * Math.sin(t * Math.PI);
      vertices.push(x, y + .12 * Math.pow(t, 7) * (u - .5), z);
    }
    const stride = columns + 1, layerSize = (rows + 1) * stride;
    for (let layer = 0; layer < 2; layer++) for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
      const a = layer * layerSize + r * stride + c, b = a + 1, d = a + stride, e = d + 1;
      indices.push(a, b, d, b, e, d);
    }
    const edge = (a: number, b: number) => indices.push(a, a + layerSize, b, b, a + layerSize, b + layerSize);
    for (let r = 0; r < rows; r++) { edge(r * stride, (r + 1) * stride); edge(r * stride + columns, (r + 1) * stride + columns); }
    for (let c = 0; c < columns; c++) { edge(c, c + 1); edge(rows * stride + c, rows * stride + c + 1); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    add(geometry, white);
    add(box(.019, 2.97, .025, .006), led, side * .332, .035, .526);
    for (let i = 0; i < 34; i++) add(box(.046, .037, .85, .005), vent, side * .335, -1.35 + i * .083, -.03);
    add(box(.065, .016, 1.17, .004), dark, side * .407, -.29, .015);
  }
  // Optical-drive housing, narrow disc aperture, buttons and USB-C sockets.
  add(box(.24, 1.09, .20, .095), white, .35, -1.02, .49);
  add(box(.025, .84, .027, .012), vent, .43, -1.01, .599);
  add(box(.08, .019, .02, .007), vent, .19, -1.53, .561);
  add(box(.074, .028, .02, .01), vent, -.09, -.57, .539);
  add(box(.074, .028, .02, .01), vent, -.09, -.73, .539);
  add(box(.045, .015, .008, .004), led, -.09, -.90, .54);
  add(box(1.12, .11, 1.17, .05), dark, 0, -1.76, .03);
  // A concept display/charging dock provides a defined attachment surface.
  const dock = new THREE.Group(); dock.position.set(-.87, -1.57, .64); group.add(dock);
  const platform = new THREE.Mesh(box(1.22, .13, .61, .055), dark); platform.position.set(0, -.10, 0); dock.add(platform);
  for (const x of [-.35, .35]) {
    const cradle = new THREE.Mesh(box(.19, .22, .38, .05), dark); cradle.position.set(x, 0, -.06); dock.add(cradle);
  }
  const dockLight = new THREE.Mesh(box(.43, .015, .013, .004), led); dockLight.position.set(0, -.09, .308); dock.add(dockLight);
  const attachment = new THREE.Object3D(); attachment.position.set(0, .48, .045); dock.add(attachment);
  return { group, attachment, led };
}
