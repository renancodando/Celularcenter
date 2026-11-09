import {useEffect,useRef} from 'react';import {useFrame} from '@react-three/fiber';
import {useGLTF,useAnimations,Environment,Lightformer} from '@react-three/drei';import * as THREE from 'three';import {S} from './store';
const sm=(a:number,b:number,x:number)=>{const t=Math.min(Math.max((x-a)/(b-a),0),1);return t*t*(3-2*t)};
const URL=import.meta.env.BASE_URL+'models/phone.glb';useGLTF.preload(URL);
const IDS=['rim','screen','board','battery','back'];const E='#ff812e';
export default function Phone(){
 const g=useRef<THREE.Group>(null);const hl=useRef<Record<string,number>>({});
 const {scene,animations}=useGLTF(URL);const {actions,mixer}=useAnimations(animations,scene);
 useEffect(()=>{
  scene.traverse((o:any)=>{if(o.isMesh){const m=o.material.clone();const base=m.emissive.getHex()!==0?m.emissiveIntensity:0;if(!base)m.emissive.set(E);m.userData.ei=base;o.material=m}});
  Object.values(actions).forEach((a:any)=>{a.play();a.paused=true})},[scene,actions]);
 useFrame((st,dt)=>{
  const k=S.reduced?1:1-Math.exp(-dt*5);S.cur+=(S.p-S.cur)*k;const p=S.cur;
  let e=sm(.14,.4,p)-sm(.66,.92,p);S.f+=((S.free&&S.sel!=='none'?.75:0)-S.f)*k;e=Math.max(e,S.f);
  S.intro=Math.min(1,S.intro+dt/(S.reduced?.01:3.5));const ie=1-Math.pow(1-S.intro,3);
  const t=st.clock.elapsedTime,asp=st.size.width/st.size.height,wide=asp>1.15;
  const cz=6.6+2.4*e+(1-ie)*3;st.camera.position.set(0,0,cz);
  const half=Math.tan(THREE.MathUtils.degToRad(15))*cz;
  const o=g.current!;o.position.set(wide?half*asp*.42:0,(wide?0:half*.32)+(S.reduced?0:Math.sin(t*.8)*.05),0);
  o.scale.setScalar(wide?1:Math.min(.95,asp*1.55));
  const sp=Math.sin(p*Math.PI*2);
  o.rotation.set(-.35*e-st.pointer.y*.18,.9*sp+st.pointer.x*.28+(1-ie)*.8,.08*sp);
  Object.values(actions).forEach((a:any)=>{a.time=e*a.getClip().duration});mixer.update(0);
  const pulse=.6+.4*Math.sin(t*3);
  for(const id of IDS){const n=scene.getObjectByName(id);if(!n)continue;
   const on=S.sel===id||S.sel==='diag'?1:0;hl.current[id]=(hl.current[id]||0)+(on-(hl.current[id]||0))*k;
   n.traverse((m:any)=>{if(m.isMesh)m.material.emissiveIntensity=(m.material.userData.ei||0)+hl.current[id]*pulse*1.4})}
 });
 return(<>
 <Environment resolution={256} frames={1}>
  <Lightformer intensity={3} position={[0,5,3]} scale={[8,1.2,1]} rotation-x={Math.PI/2}/>
  <Lightformer intensity={7} color={E} position={[-6,0,-2]} scale={[1,8,1]} rotation-y={Math.PI/2}/>
  <Lightformer intensity={5} color={E} position={[6,1,-3]} scale={[1,6,1]} rotation-y={-Math.PI/2}/>
  <Lightformer form="ring" intensity={4} position={[0,0,6]} scale={3}/>
  <Lightformer intensity={1.5} position={[0,-5,2]} scale={[8,1,1]} rotation-x={-Math.PI/2}/>
 </Environment>
 <ambientLight intensity={.04}/><pointLight position={[-3,2,3]} color={E} intensity={25}/>
 <group ref={g}><primitive object={scene}/></group></>)}
