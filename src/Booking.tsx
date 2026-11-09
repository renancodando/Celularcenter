import {useState} from 'react';
type P={wa?:string;services:{id:string;t:string}[]};
const BRANDS=['Apple','Samsung','Motorola','Xiaomi','Outra'];
export default function Booking({wa,services}:P){
 const [f,setF]=useState({name:'',svc:'',brand:'',model:'',desc:'',date:'',time:''});
 const [done,setDone]=useState(false);const [copied,setCopied]=useState(false);
 const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 const today=new Date().toISOString().slice(0,10);
 const fmt=(d:string)=>d.split('-').reverse().join('/');
 const msg=`Olá, Celular Center! Gostaria de solicitar um atendimento.\nNome: ${f.name}\nServiço: ${f.svc}\nCelular: ${f.brand} ${f.model}\nProblema: ${f.desc||'não informado'}\nPreferência de data: ${f.date?fmt(f.date):'a combinar'}${f.time?' às '+f.time:''}`;
 const copy=async()=>{try{await navigator.clipboard.writeText(msg);setCopied(true)}catch{}};
 if(done)return(<div className="sum" role="status"><p className="eyebrow">Solicitação pronta</p><pre>{msg}</pre>
  <p className="mut">A data e o horário são uma preferência e dependem de confirmação pela assistência.</p>
  <div className="row">{wa?<a className="btn" href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`}>Enviar pelo WhatsApp</a>:<button className="btn" onClick={copy}>{copied?'Mensagem copiada':'Copiar mensagem'}</button>}
  <button className="btn ghost" onClick={()=>setDone(false)}>Editar</button></div>
  {!wa&&<p className="mut">O WhatsApp da empresa ainda não foi configurado, então copie a mensagem e envie pelo canal de contato.</p>}</div>);
 return(<form className="bk" onSubmit={e=>{e.preventDefault();setDone(true)}}>
  <fieldset><legend>1 · Serviço</legend><div className="chipset">{services.map(s=><label key={s.id}><input type="radio" name="svc" required checked={f.svc===s.t} onChange={()=>setF({...f,svc:s.t})}/><span>{s.t}</span></label>)}</div></fieldset>
  <fieldset><legend>2 · Seu celular</legend><div className="chipset">{BRANDS.map(b=><label key={b}><input type="radio" name="brand" required checked={f.brand===b} onChange={()=>setF({...f,brand:b})}/><span>{b}</span></label>)}</div>
   <input required placeholder="Modelo (ex.: Galaxy S23)" aria-label="Modelo" value={f.model} onChange={set('model')}/></fieldset>
  <fieldset><legend>3 · O que aconteceu</legend><textarea rows={3} placeholder="Descreva o problema" aria-label="Descrição do problema" value={f.desc} onChange={set('desc')}/></fieldset>
  <fieldset><legend>4 · Preferência de data e horário</legend><div className="two"><input type="date" min={today} required aria-label="Data" value={f.date} onChange={set('date')}/><input type="time" aria-label="Horário" value={f.time} onChange={set('time')}/></div></fieldset>
  <fieldset><legend>5 · Seu nome</legend><input required placeholder="Nome" aria-label="Nome" value={f.name} onChange={set('name')}/></fieldset>
  <button className="btn" style={{justifySelf:'start'}}>Revisar solicitação</button></form>)}
