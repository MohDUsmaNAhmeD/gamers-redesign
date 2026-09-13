import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export default function ControllerModel(){
  const mount=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!mount.current) return; const el=mount.current; let raf=0;
    const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(32,el.clientWidth/el.clientHeight,.1,100); camera.position.set(0,.15,6.1);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(el.clientWidth,el.clientHeight); renderer.setClearColor(0,0); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.35; renderer.shadowMap.enabled=true; el.appendChild(renderer.domElement);
    const root=new THREE.Group(); scene.add(root);
    const shell=new THREE.MeshPhysicalMaterial({color:0xeaeae5,metalness:.12,roughness:.18,clearcoat:1,clearcoatRoughness:.12});
    const black=new THREE.MeshPhysicalMaterial({color:0x15161a,metalness:.42,roughness:.28,clearcoat:.7});
    const glow=new THREE.MeshStandardMaterial({color:0xb9ff38,emissive:0x7ee000,emissiveIntensity:2.2,roughness:.2});
    const glass=new THREE.MeshPhysicalMaterial({color:0x32343b,metalness:.4,roughness:.12,transmission:.05,clearcoat:1});
    const add=(geo:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;root.add(m);return m};
    add(new RoundedBoxGeometry(1.65,1.15,.5,6,.18),black,0,0,0);
    add(new RoundedBoxGeometry(1.05,1.55,.52,6,.23),shell,-.98,-.22,.05,0,-.08,.32);
    add(new RoundedBoxGeometry(1.05,1.55,.52,6,.23),shell,.98,-.22,.05,0,.08,-.32);
    add(new RoundedBoxGeometry(1.55,.58,.54,6,.16),shell,0,.46,.04);
    add(new RoundedBoxGeometry(.86,.42,.07,4,.06),glass,0,.3,.31);
    add(new RoundedBoxGeometry(.92,.035,.035,3,.01),glow,0,.53,.35);
    const stick=(x:number,y:number)=>{add(new THREE.CylinderGeometry(.23,.25,.12,32),black,x,y,.3,Math.PI/2);add(new THREE.CylinderGeometry(.17,.16,.09,32),glass,x,y,.41,Math.PI/2);add(new THREE.TorusGeometry(.16,.018,12,36),glow,x,y,.47)}; stick(-.48,-.15);stick(.48,-.15);
    add(new RoundedBoxGeometry(.48,.15,.09,3,.035),black,-.83,.22,.34);add(new RoundedBoxGeometry(.15,.48,.09,3,.035),black,-.83,.22,.34);
    [[.82,.38],[1.0,.21],[.82,.04],[.64,.21]].forEach(([x,y],i)=>add(new THREE.CylinderGeometry(.075,.075,.06,24),i===2?glow:glass,x,y,.36,Math.PI/2));
    add(new THREE.CylinderGeometry(.055,.055,.04,24),glow,0,-.04,.36,Math.PI/2);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.4,64),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.45;floor.receiveShadow=true;scene.add(floor);
    scene.add(new THREE.HemisphereLight(0xffffff,0x101116,1.7)); const key=new THREE.DirectionalLight(0xffffff,5);key.position.set(4,5,6);key.castShadow=true;scene.add(key); const rim=new THREE.PointLight(0x9dff25,18,9);rim.position.set(-3,-1,3);scene.add(rim); const violet=new THREE.PointLight(0x725cff,12,8);violet.position.set(3,2,-2);scene.add(violet);
    let tx=.2,ty=-.28,px=0,py=0; const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;}; el.addEventListener('pointermove',move);
    const render=(t:number)=>{tx+=(px*.65-tx)*.045;ty+=(-py*.38-.28-ty)*.045;root.rotation.y=tx+Math.sin(t*.00045)*.08;root.rotation.x=ty;root.rotation.z=Math.sin(t*.0007)*.025;root.position.y=Math.sin(t*.0011)*.055;renderer.render(scene,camera);raf=requestAnimationFrame(render)};raf=requestAnimationFrame(render);
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);el.removeEventListener('pointermove',move);renderer.dispose();el.removeChild(renderer.domElement)};
  },[]);
  return <div className="controller-canvas" ref={mount}/>;
}
