import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildController } from './ControllerModel';
import { buildConsole } from './ConsoleModel';

gsap.registerPlugin(ScrollTrigger);
const finishes = [0xe9e8e4, 0x282a30, 0xa8d746];
export function ThreeScene({ finish = 0, paused = false, onReady, onError }: { finish?: number; paused?: boolean; onReady?: () => void; onError?: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const material = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const pausedRef = useRef(paused);
  const finishRef = useRef(finish);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { finishRef.current = finish; material.current?.color.set(finishes[finish]); }, [finish]);
  useEffect(() => {
    const el = mount.current;
    const experience = el?.closest<HTMLElement>('.experience');
    if (!el || !experience) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { onError?.(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.35 : 1.7));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-7, 7, 4, -4, .1, 100);
    camera.position.set(0, 0, 20);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .72;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdce8ff, 0x282a32, 1.7));
    const key = new THREE.DirectionalLight(0xfff6e9, 4.0); key.position.set(-3, 6, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0xd1d9ff, 2.4); fill.position.set(6, 1, 5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8495ed, 4); rim.position.set(1, 4, -3); scene.add(rim);
    const { group: controller, shell, textures } = buildController();
    const { group: consoleModel, attachment, led } = buildConsole();
    material.current = shell; shell.color.set(finishes[finishRef.current]);
    scene.add(controller, consoleModel);
    const progress = { value: 0 };
    let width = 1, height = 1, mobile = false, visible = true, dirty = true;
    let last = 0, elapsed = 0, ready = false;
    let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
    let heroScale = 1, consoleScale = 1;
    const heroPosition = new THREE.Vector3();
    const dockPosition = new THREE.Vector3();
    const controlPosition = new THREE.Vector3();
    const heroRotation = new THREE.Quaternion();
    const dockRotation = new THREE.Quaternion();
    const dockLocalRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.15, 0, 0));
    const travelRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(.18, -.85, .10));
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    const resize = () => {
      width = el.clientWidth; height = el.clientHeight; mobile = width < 768;
      camera.left = -width / 200; camera.right = width / 200;
      camera.top = height / 200; camera.bottom = -height / 200;
      camera.updateProjectionMatrix(); renderer.setSize(width, height);
      heroScale = mobile ? Math.min(width * .89 / 350, 1.4) : Math.min(width * .47 / 350, 1.85);
      consoleScale = mobile ? Math.min(height * .43 / 350, 1.15) : Math.min(height * .73 / 350, 1.7);
      heroPosition.set(mobile ? .05 : width * .237 / 100, mobile ? -height * .235 / 100 : .20, 0);
      dirty = true;
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el); resize();
    const ctx = gsap.context(() => {
      gsap.to(progress, { value: 1, ease: 'none', scrollTrigger: {
        trigger: experience, start: 'top top', end: () => `+=${experience.querySelector('.hero')!.clientHeight + 110}`,
        scrub: .85, invalidateOnRefresh: true, onUpdate: () => { dirty = true; },
      }});
    }, experience);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; dirty = true; }, { rootMargin: '80px' });
    observer.observe(experience);
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = (event.clientX / width - .5) * 2;
      pointerY = (event.clientY / window.innerHeight - .5) * 2;
      dirty = true;
    };
    const leave = () => { pointerX = pointerY = 0; };
    experience.addEventListener('pointermove', pointer, { passive: true }); experience.addEventListener('pointerleave', leave);
    const motionChange = () => { reduced = motionQuery.matches; dirty = true; };
    motionQuery.addEventListener('change', motionChange);
    const contextLost = (event: Event) => { event.preventDefault(); visible = false; onError?.(); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    let frame = 0;
    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      if (document.hidden || !visible || (mobile && time - last < 1000 / 32)) return;
      const delta = Math.min((time - last) / 1000, .05); last = time;
      if (!pausedRef.current && !reduced) elapsed += delta;
      // No continuous animation in reduced-motion mode; the scroll pose is static.
      if (reduced && !dirty && ready && shell.color.getHex() === finishes[finishRef.current]) return;
      dirty = false;
      const p = progress.value;
      const travel = reduced ? (p > .48 ? 1 : 0) : THREE.MathUtils.smoothstep(p, .10, .89);
      const entrance = reduced ? (p > .48 ? 1 : 0) : THREE.MathUtils.smoothstep(p, .17, .61);
      consoleModel.visible = entrance > .001;
      consoleModel.scale.setScalar(consoleScale);
      consoleModel.position.set(mobile ? width * .16 / 100 : width * .285 / 100, (mobile ? -height * .23 / 100 : -.08) - (1 - entrance) * 6, -.9);
      consoleModel.rotation.set(.035, -.42, .012);
      consoleModel.updateMatrixWorld(true);
      attachment.getWorldPosition(dockPosition);
      attachment.getWorldQuaternion(dockRotation); dockRotation.multiply(dockLocalRotation);
      smoothX = THREE.MathUtils.damp(smoothX, pointerX, 4, delta);
      smoothY = THREE.MathUtils.damp(smoothY, pointerY, 4, delta);
      const idle = reduced || pausedRef.current ? 0 : 1 - travel;
      heroRotation.setFromEuler(new THREE.Euler(-.22 + smoothY * .09 * idle, -.27 + smoothX * .12 * idle, -.17 + Math.sin(elapsed * .38) * .018 * idle));
      controlPosition.lerpVectors(heroPosition, dockPosition, travel);
      // A shallow lift leaves room for the console, followed by exact anchor alignment.
      controlPosition.y += Math.sin(travel * Math.PI) * (mobile ? .65 : 1.15);
      controlPosition.x -= Math.sin(travel * Math.PI) * (mobile ? .3 : .65);
      controller.position.copy(controlPosition);
      controller.position.y += Math.sin(elapsed * .85) * .045 * idle;
      if (travel < .5) controller.quaternion.slerpQuaternions(heroRotation, travelRotation, travel * 2);
      else controller.quaternion.slerpQuaternions(travelRotation, dockRotation, (travel - .5) * 2);
      controller.scale.setScalar(THREE.MathUtils.lerp(heroScale, consoleScale * .34, travel));
      led.emissiveIntensity = travel > .97 ? 3.5 : 1.8;
      experience.dataset.phase = travel > .97 ? 'connected' : p > .2 ? 'pairing' : 'hero';
      renderer.render(scene, camera);
      if (!ready) { ready = true; onReady?.(); }
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame); ctx.revert(); observer.disconnect(); resizeObserver.disconnect();
      experience.removeEventListener('pointermove', pointer); experience.removeEventListener('pointerleave', leave);
      motionQuery.removeEventListener('change', motionChange); renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m)); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      environment.dispose(); renderer.dispose(); renderer.domElement.remove(); material.current = null;
    };
  }, [onReady, onError]);
  return <div className="controller-canvas" ref={mount} role="img" aria-label="Detailed interactive 3D controller, which docks next to a PlayStation 5 as you scroll" />;
}
export default ThreeScene;
