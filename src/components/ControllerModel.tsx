import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function ControllerModel(){
  const mount=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!mount.current) return; const el=mount.current; let raf=0; let visible=true;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(40,1,.1,100); camera.position.set(0,.05,1.6);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setClearColor(0,0);
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const pmrem=new THREE.PMREMGenerator(renderer);
    scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;

    const shell=new THREE.MeshPhysicalMaterial({color:0xf2f3f5,metalness:.05,roughness:.3,clearcoat:.65,clearcoatRoughness:.28});
    const core=new THREE.MeshPhysicalMaterial({color:0x17181c,metalness:.15,roughness:.5,clearcoat:.3,clearcoatRoughness:.3});
    const rubber=new THREE.MeshStandardMaterial({color:0x1d1e23,metalness:.05,roughness:.85});
    const padMat=new THREE.MeshPhysicalMaterial({color:0x0e0f12,metalness:.1,roughness:.32,clearcoat:.9,clearcoatRoughness:.12});
    const btnMat=new THREE.MeshPhysicalMaterial({color:0x2b2e35,metalness:.2,roughness:.15,clearcoat:1,clearcoatRoughness:.08});
    const glyph=new THREE.MeshStandardMaterial({color:0xc9cdd4,metalness:.3,roughness:.4});
    const bar=new THREE.MeshStandardMaterial({color:0x9dff25,emissive:0x7ee000,emissiveIntensity:2.6,roughness:.25});

    const root=new THREE.Group(); scene.add(root);
    const add=(geo:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;root.add(m);return m};

    add(new RoundedBoxGeometry(1.52,.52,.48,6,.17),shell,0,.44,0);
    add(new RoundedBoxGeometry(.58,1.08,.46,6,.2),shell,-.66,.14,0,0,0,.13);
    add(new RoundedBoxGeometry(.58,1.08,.46,6,.2),shell,.66,.14,0,0,0,-.13);
    add(new RoundedBoxGeometry(.6,1.34,.44,6,.23),shell,-.74,-.34,-.02,0,0,-.3);
    add(new RoundedBoxGeometry(.6,1.34,.44,6,.23),shell,.74,-.34,-.02,0,0,.3);
    add(new RoundedBoxGeometry(.46,.11,.24,3,.05),shell,-.63,.66,.03,0,0,.1);
    add(new RoundedBoxGeometry(.46,.11,.24,3,.05),shell,.63,.66,.03,0,0,-.1);
    add(new RoundedBoxGeometry(.4,.17,.22,3,.06),core,-.63,.58,-.17,-.35,0,.1);
    add(new RoundedBoxGeometry(.4,.17,.22,3,.06),core,.63,.58,-.17,-.35,0,-.1);

    add(new RoundedBoxGeometry(1.34,.76,.44,6,.18),core,0,.15,.02);
    const panel=.24;

    add(new RoundedBoxGeometry(.76,.3,.05,4,.04),padMat,0,.44,.27,-.1);
    add(new RoundedBoxGeometry(.024,.27,.03,2,.01),bar,-.4,.44,.285,-.1);
    add(new RoundedBoxGeometry(.024,.27,.03,2,.01),bar,.4,.44,.285,-.1);

    add(new RoundedBoxGeometry(.19,.15,.06,2,.028),rubber,-.55,.3,panel);
    add(new RoundedBoxGeometry(.19,.15,.06,2,.028),rubber,-.55,.04,panel);
    add(new RoundedBoxGeometry(.15,.19,.06,2,.028),rubber,-.67,.17,panel);
    add(new RoundedBoxGeometry(.15,.19,.06,2,.028),rubber,-.43,.17,panel);
    const tri=new THREE.Mesh(new THREE.RingGeometry(.03,.048,3),glyph);tri.rotation.z=Math.PI/2;
    const circ=new THREE.Mesh(new THREE.RingGeometry(.03,.048,24),glyph);
    const sq=new THREE.Mesh(new THREE.RingGeometry(.03,.048,4,1,Math.PI/4),glyph);
    const glyphAt=(g:THREE.Mesh,x:number,y:number)=>{g.position.set(x,y,panel+.03);root.add(g)};
    glyphAt(tri,.55,.34);glyphAt(circ,.73,.17);glyphAt(sq,.37,.17);
    const crA=new THREE.Mesh(new THREE.BoxGeometry(.062,.017,.008),glyph);
    const crB=new THREE.Mesh(new THREE.BoxGeometry(.017,.062,.008),glyph);
    crA.position.set(.55,0,panel+.03);crB.position.set(.55,0,panel+.03);root.add(crA,crB);
    [[.55,.34],[.73,.17],[.55,0],[.37,.17]].forEach(([x,y])=>add(new THREE.CylinderGeometry(.073,.075,.05,28),btnMat,x,y,panel-.005,Math.PI/2));

    const stick=(x:number,y:number)=>{add(new THREE.CylinderGeometry(.245,.25,.1,40),rubber,x,y,panel-.05,Math.PI/2);add(new THREE.CylinderGeometry(.14,.15,.2,32),rubber,x,y,panel,Math.PI/2);add(new THREE.TorusGeometry(.155,.032,16,48),rubber,x,y,panel+.1);add(new THREE.CylinderGeometry(.13,.125,.025,40),core,x,y,panel+.11,Math.PI/2)};
    stick(-.26,-.16);stick(.26,-.16);

    add(new THREE.CylinderGeometry(.055,.055,.035,28),padMat,0,-.13,panel,Math.PI/2);
    add(new RoundedBoxGeometry(.24,.016,.012,2,.006),rubber,0,.03,panel+.005);
    add(new RoundedBoxGeometry(.05,.035,.03,2,.012),rubber,0,-.3,panel);
    add(new RoundedBoxGeometry(.028,.09,.05,2,.014),rubber,-.66,.5,panel-.06,0,0,.5);
    add(new RoundedBoxGeometry(.028,.09,.05,2,.014),rubber,.66,.5,panel-.06,0,0,-.5);

    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.4,64),new THREE.ShadowMaterial({opacity:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.5;floor.receiveShadow=true;scene.add(floor);
    scene.add(new THREE.HemisphereLight(0xffffff,0x0d0e12,.9));
    const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(3.5,5,5.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-2.5,right:2.5,top:2.5,bottom:-2.5});scene.add(key);
    const rim=new THREE.PointLight(0x9dff25,14,9);rim.position.set(-3,-.5,2.5);scene.add(rim);
    const fill=new THREE.PointLight(0x1a7a4a,8,8);fill.position.set(3,1.5,-2);scene.add(fill);

    let tx=.2,ty=-.24,px=0,py=0;
    const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5};
    el.addEventListener('pointermove',move);
    const resize=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;const aspect=w/h;camera.aspect=aspect;camera.position.z=1.6+Math.max(0,0.9-aspect)*1.8;camera.updateProjectionMatrix();renderer.setSize(w,h)};
    resize();
    const ro=new ResizeObserver(resize);ro.observe(el);
    const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting},{threshold:0});io.observe(el);
    const render=(t:number)=>{raf=requestAnimationFrame(render);if(!visible)return;tx+=(px*.65-tx)*.045;ty+=(-py*.36-.24-ty)*.045;root.rotation.y=tx+Math.sin(t*.00045)*.08;root.rotation.x=ty;root.rotation.z=Math.sin(t*.0007)*.02;root.position.y=Math.sin(t*.0011)*.05;renderer.render(scene,camera)};
    raf=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();el.removeEventListener('pointermove',move);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose()}});pmrem.dispose();renderer.dispose();el.removeChild(renderer.domElement)};
  },[]);
  return <div className="controller-canvas" ref={mount}/>;
}
