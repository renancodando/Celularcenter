import {Suspense} from 'react';import {Canvas} from '@react-three/fiber';import {useProgress,Sparkles} from '@react-three/drei';
import {EffectComposer,DepthOfField,Bloom,Vignette,Noise} from '@react-three/postprocessing';import Phone from './Phone';import {S} from './store';
function Loader(){const {progress,active}=useProgress();return <div className="load" style={{transform:`scaleX(${progress/100})`,opacity:active?1:0}}/>}
export default function Scene(){return(<>
<Canvas className="cv" aria-hidden="true" dpr={S.lowPower?[1,1]:[1,2]} camera={{fov:30,position:[0,0,9.6],near:.1,far:20}}
 gl={{antialias:false,powerPreference:'high-performance'}} eventSource={document.getElementById('root')!} eventPrefix="client">
<color attach="background" args={['#040609']}/>
<Suspense fallback={null}><Phone/>
 {!S.lowPower&&<Sparkles count={70} scale={[14,9,7]} size={5} speed={.25} opacity={.5} color="#ffae70"/>}</Suspense>
{!S.lowPower&&<EffectComposer multisampling={4}>
 <DepthOfField focusDistance={.33} focalLength={.09} bokehScale={3} height={480}/>
 <Bloom intensity={.55} luminanceThreshold={.7} mipmapBlur/>
 <Noise opacity={.035}/><Vignette offset={.25} darkness={.75}/></EffectComposer>}
</Canvas><Loader/></>)}
