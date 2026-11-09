import {lazy,Suspense,useEffect,useState} from 'react';import gsap from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';import {S} from './store';import Booking from './Booking';
const Scene=lazy(()=>import('./Scene'));
const WA=((import.meta.env.VITE_WHATSAPP as string|undefined)||'5522992565429').replace(/\D/g,'');
const SVC=[
 {id:'screen',t:'Troca de tela',d:'Substituição da tela e verificação de toque, vidro e display.'},
 {id:'battery',t:'Bateria',d:'Troca de bateria e conferência de consumo e carregamento.'},
 {id:'board',t:'Reparo de placa',d:'Análise da placa para identificar falhas elétricas e de componentes.'},
 {id:'diag',t:'Diagnóstico',d:'Avaliação completa para descobrir a causa antes de qualquer reparo.'}];
const CAP=['Por fora, intacto.','Por dentro, tudo à mostra.','Escolha uma peça.','E ele volta inteiro.'];
export default function App(){
 const [sel,setSel]=useState('none');const [ph,setPh]=useState(0);
 const pick=(id:string)=>{const v=sel===id?'none':id;setSel(v);S.sel=v};
 useEffect(()=>{gsap.registerPlugin(ScrollTrigger);
  const a=ScrollTrigger.create({trigger:'#story',start:'top top',end:'bottom bottom',onUpdate:s=>{S.p=s.progress;setPh(s.progress<.14?0:s.progress<.4?1:s.progress<.66?2:3)}});
  const b=ScrollTrigger.create({trigger:'#servicos',start:'top 85%',end:'bottom top',onToggle:s=>{S.free=s.isActive}});
  return()=>{a.kill();b.kill()}},[]);
 const cur=SVC.find(s=>s.id===sel);
 const cta=<a className="btn" href="#agendar">Pedir orçamento</a>;
 return(<>
 <a className="skip" href="#servicos">Ir para os serviços</a>
 <Suspense fallback={null}><Scene/></Suspense>
 <header className="top"><span className="logo">CELULAR CENTER</span><span>Assistência Técnica</span></header>
 <main>
  <section className="hero"><div><p className="eyebrow">Conserto de celulares</p>
   <h1>Seu celular<br/><b>sempre em ação.</b></h1>
   <div className="row">{cta}<a className="btn ghost" href="#servicos">Serviços</a></div></div></section>
  <section id="story"><div className="stick">
   <p className="cap" key={ph} aria-live="polite">{CAP[ph]}</p>
   <div className={'chips'+(ph===2?' on':'')} role="group" aria-label="Componentes do celular">
    {SVC.map(s=><button key={s.id} aria-pressed={sel===s.id} onClick={()=>pick(s.id)} tabIndex={ph===2?0:-1}>{s.t}</button>)}</div>
   {ph===2&&cur&&<p className="desc">{cur.d}</p>}
  </div></section>
  <section id="servicos" className="pad"><div className="side"><p className="eyebrow">Serviços</p><h2>Cada peça, um cuidado.</h2>
   <div className="cards">{SVC.map(s=><button key={s.id} className="card" aria-pressed={sel===s.id} onClick={()=>pick(s.id)} onMouseEnter={()=>{setSel(s.id);S.sel=s.id}} onFocus={()=>{setSel(s.id);S.sel=s.id}}>
    <h3>{s.t}</h3><p>{s.d}</p></button>)}</div></div></section>
  <section id="agendar" className="pad"><div className="side wide"><p className="eyebrow">Celular Center · Atendimento</p><h2>Conte o que aconteceu.</h2><p className="mut">R. Ten.-Cel. Cardoso, 743 · Centro · Campos dos Goytacazes, RJ. <a href="https://www.instagram.com/celular.center/" target="_blank" rel="noopener noreferrer">@celular.center</a></p><Booking wa={WA} services={SVC.map(({id,t})=>({id,t}))}/></div></section>
 </main></>)}
