const nav:any=navigator;
export const S={p:0,cur:0,f:0,intro:0,sel:'none',free:false,
 reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
 lowPower:(nav.hardwareConcurrency||8)<=4||(nav.deviceMemory||8)<=4};
