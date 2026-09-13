import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** A fully modelled controller, not a textured plane: separate shells, seams,
 * moulded grips, knurled sticks, translucent keys and laser-etched markings. */
export function buildController() {
  const group = new THREE.Group();
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 128;
  const ctx = textureCanvas.getContext('2d')!;
  ctx.fillStyle = '#999'; ctx.fillRect(0, 0, 128, 128);
  let seed = 41;
  for (let i = 0; i < 7000; i++) {
    seed = (seed * 16807) % 2147483647; const x = seed % 128;
    seed = (seed * 16807) % 2147483647; const y = seed % 128;
    ctx.fillStyle = i % 2 ? '#888' : '#aaa'; ctx.fillRect(x, y, 1, 1);
  }
  const grain = new THREE.CanvasTexture(textureCanvas);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(5, 5);
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xe9e8e4, roughness: .38, metalness: .03, clearcoat: .18, bumpMap: grain, bumpScale: .009 });
  const underside = shell.clone(); underside.color.set(0xc8c9cd); underside.roughness = .6;
  const black = new THREE.MeshStandardMaterial({ color: 0x13151a, roughness: .43, metalness: .16, bumpMap: grain, bumpScale: .006 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x101113, roughness: .88, bumpMap: grain, bumpScale: .025 });
  const glossy = new THREE.MeshPhysicalMaterial({ color: 0x24262c, roughness: .22, metalness: .28, clearcoat: 1 });
  const keys = new THREE.MeshPhysicalMaterial({ color: 0xa9aeb8, roughness: .14, metalness: .12, clearcoat: 1, transparent: true, opacity: .92 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x779dff, emissive: 0x335dff, emissiveIntensity: 2.5 });
  const ink = new THREE.MeshBasicMaterial({ color: 0x626873 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); group.add(mesh); return mesh;
  };
  const box = (w: number, h: number, d: number, r = .025) => new RoundedBoxGeometry(w, h, d, 3, r);
  const outline = new THREE.Shape();
  outline.moveTo(-1.06, .64);
  outline.bezierCurveTo(-.78, .85, -.35, .77, 0, .77);
  outline.bezierCurveTo(.35, .77, .78, .85, 1.06, .64);
  outline.bezierCurveTo(1.38, .62, 1.48, .3, 1.55, -.02);
  outline.bezierCurveTo(1.62, -.34, 1.78, -.98, 1.48, -1.13);
  outline.bezierCurveTo(1.15, -1.35, .91, -.95, .68, -.49);
  outline.bezierCurveTo(.51, -.36, .31, -.44, 0, -.44);
  outline.bezierCurveTo(-.31, -.44, -.51, -.36, -.68, -.49);
  outline.bezierCurveTo(-.91, -.95, -1.15, -1.35, -1.48, -1.13);
  outline.bezierCurveTo(-1.78, -.98, -1.62, -.34, -1.55, -.02);
  outline.bezierCurveTo(-1.48, .3, -1.38, .62, -1.06, .64);
  const extrude = (shape: THREE.Shape, depth: number, bevel: number) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 6, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 28 });
  add(extrude(outline, .13, .10), underside, 0, 0, -.27);
  add(extrude(outline, .04, .102), black, 0, 0, -.09);
  add(extrude(outline, .13, .10), shell, 0, 0, -.025);
  const center = new THREE.Shape();
  center.moveTo(-.62, .65); center.quadraticCurveTo(0, .76, .62, .65);
  center.bezierCurveTo(.65, .3, .65, .16, .88, -.06);
  center.bezierCurveTo(1.03, -.23, .9, -.52, .69, -.65);
  center.quadraticCurveTo(.49, -.44, 0, -.44);
  center.quadraticCurveTo(-.49, -.44, -.69, -.65);
  center.bezierCurveTo(-.9, -.52, -1.03, -.23, -.88, -.06);
  center.bezierCurveTo(-.65, .16, -.65, .3, -.62, .65);
  add(extrude(center, .025, .035), black, 0, 0, .20);
  // The touchpad has its own moulded edge, fine texture, and inset light channels.
  add(box(1.24, .63, .07, .085), blue, 0, .43, .256);
  add(box(1.19, .59, .085, .075), black, 0, .43, .285);
  add(box(1.11, .51, .02, .065), new THREE.MeshStandardMaterial({ color: 0x282b33, roughness: .75, bumpMap: grain, bumpScale: .018 }), 0, .43, .335);
  const stick = (x: number) => {
    add(new THREE.CylinderGeometry(.255, .29, .055, 48), glossy, x, -.19, .295, Math.PI / 2);
    add(new THREE.SphereGeometry(.19, 32, 16), black, x, -.19, .34).scale.set(1, 1, .7);
    add(new THREE.CylinderGeometry(.14, .12, .15, 32), glossy, x, -.19, .42, Math.PI / 2);
    add(new THREE.CylinderGeometry(.209, .19, .075, 48), rubber, x, -.19, .52, Math.PI / 2);
    add(new THREE.TorusGeometry(.187, .027, 10, 48), rubber, x, -.19, .561);
    add(new THREE.CircleGeometry(.166, 48), rubber, x, -.19, .56);
    for (let n = 0; n < 48; n++) {
      const a = n / 48 * Math.PI * 2;
      add(box(.009, .014, .028, .002), rubber, x + Math.cos(a) * .204, -.19 + Math.sin(a) * .204, .535, 0, 0, a);
    }
  };
  stick(-.56); stick(.56);
  // Four individually moulded directional keys with recessed arrow marks.
  for (let n = 0; n < 4; n++) {
    const a = n * Math.PI / 2;
    const x = -1.055 + Math.sin(a) * .135, y = .28 + Math.cos(a) * .135;
    add(box(.15, .215, .072, .035), glossy, x, y, .275, 0, 0, -a);
    const triangle = new THREE.Shape(); triangle.moveTo(-.033, 0); triangle.lineTo(.033, 0); triangle.lineTo(0, .035); triangle.closePath();
    add(new THREE.ShapeGeometry(triangle), ink, x, y, .314, 0, 0, -a);
  }
  const line = (points: THREE.Vector3[], material: THREE.Material, radius = .007) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, radius, 5, false), material);
  const positions = [[1.06, .48], [1.27, .27], [1.06, .06], [.85, .27]];
  positions.forEach(([x, y], i) => {
    add(new THREE.CylinderGeometry(.109, .105, .026, 32), glossy, x, y, .234, Math.PI / 2);
    add(new THREE.CylinderGeometry(.098, .103, .069, 32), keys, x, y, .283, Math.PI / 2);
    const z = .322;
    if (i === 0) line([[-.05, -.038], [0, .05], [.05, -.038], [-.05, -.038]].map(([a, b]) => new THREE.Vector3(x + a, y + b, z)), ink);
    if (i === 1) add(new THREE.TorusGeometry(.048, .007, 6, 32), ink, x, y, z);
    if (i === 2) { line([new THREE.Vector3(x - .038, y - .038, z), new THREE.Vector3(x + .038, y + .038, z)], ink); line([new THREE.Vector3(x - .038, y + .038, z), new THREE.Vector3(x + .038, y - .038, z)], ink); }
    if (i === 3) line([[-.04, -.04], [-.04, .04], [.04, .04], [.04, -.04], [-.04, -.04]].map(([a, b]) => new THREE.Vector3(x + a, y + b, z)), ink);
  });
  // Trigger assembly, bumper seams and rear paddles remain visible on rotation.
  [-1, 1].forEach(side => {
    add(box(.59, .18, .28, .065), glossy, side * 1.035, .68, -.025, -.15, 0, side * -.08);
    add(box(.54, .25, .34, .07), black, side * 1.035, .63, -.28, -.3, 0, side * -.1);
    add(box(.055, .14, .044, .02), glossy, side * .737, .5, .255, 0, 0, side * -.1);
    for (let i = 0; i < 3; i++) add(box(.019, .009, .005, .002), ink, side * .737 + (i - 1) * .025, .635, .23);
    add(box(.16, .55, .06, .05), black, side * .95, -.52, -.365, 0, .1, side * -.22);
    [-.2, -.77].forEach(y => { add(new THREE.CylinderGeometry(.031, .031, .012, 16), black, side * 1.25, y, -.38, Math.PI / 2); });
  });
  // Laser drilled speaker grille.
  for (let row = 0; row < 3; row++) for (let col = 0; col < 9 - row * 2; col++) {
    add(new THREE.CircleGeometry(.011, 8), black, (col - (8 - row * 2) / 2) * .042, .057 - row * .035, .253);
  }
  add(box(.13, .08, .029, .021), glossy, 0, -.155, .265);
  add(box(.024, .047, .008, .004), shell, -.022, -.155, .284);
  add(box(.043, .019, .008, .004), shell, .009, -.145, .284);
  add(box(.11, .025, .02, .01), black, 0, -.295, .265);
  add(box(.045, .009, .006, .002), new THREE.MeshBasicMaterial({ color: 0xb9ef63 }), 0, -.32, .277);
  add(box(.2, .08, .013, .035), black, 0, .84, -.04, Math.PI / 2);
  add(box(.12, .024, .015, .008), glossy, 0, .85, -.04, Math.PI / 2);
  // Rear regulatory label, also visible during the scroll roll.
  const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 96;
  const label = labelCanvas.getContext('2d')!; label.fillStyle = '#bfc0c5'; label.fillRect(0, 0, 256, 96);
  label.fillStyle = '#72757d'; label.font = 'bold 18px sans-serif'; label.fillText('WIRELESS CONTROLLER', 16, 28);
  label.font = '11px monospace'; label.fillText('MODEL CFI · USB 5V     CE', 16, 51); label.fillText('GAMERS END / PLAYER EDITION', 16, 70);
  const labelMap = new THREE.CanvasTexture(labelCanvas); labelMap.colorSpace = THREE.SRGBColorSpace;
  add(new THREE.PlaneGeometry(.68, .25), new THREE.MeshBasicMaterial({ map: labelMap }), 0, .12, -.382, 0, Math.PI);
  return { group, shell, textures: [grain, labelMap] };
}
