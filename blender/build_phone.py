# Uso: blender -b -P blender/build_phone.py   (OUT=caminho.glb, PREVIEW=caminho.png opcional)
import bpy,bmesh,math,os,random
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
OUT=os.environ.get('OUT','public/models/phone.glb');PREV=os.environ.get('PREVIEW')
import numpy as np
def img(n,a):
    h,w,_=a.shape;im=bpy.data.images.new(n,w,h,alpha=True);r=np.ones((h,w,4),np.float32);r[...,:3]=a;im.pixels.foreach_set(r.ravel());im.pack();return im
def blur(a,k):
    c=np.cumsum(np.concatenate([a,a[:,:k]],1),1);return (c[:,k:]-c[:,:-k])/k
N=512;rg=np.random.default_rng(3);b=.7*blur(rg.random((N,N),dtype=np.float32),48)+.3*blur(rg.random((N,N),dtype=np.float32),8)
b=(b-b.min())/(b.max()-b.min());o=np.ones_like(b)
ORM=img('titanio_orm',np.stack([o,.3+.1*b,o],-1))
dy=np.roll(b,-1,0)-np.roll(b,1,0);dx=np.roll(b,-1,1)-np.roll(b,1,1);nn=np.stack([-dx*8,-dy*8,o],-1);nn/=np.linalg.norm(nn,axis=-1,keepdims=True)
NRM=img('titanio_normal',nn*.5+.5)
yy,xx=np.mgrid[0:1024,0:512];yy=yy/1023.;xx=xx/511.
bl=np.array([.1,.35,1.]);g1=np.exp(-((xx-.2)**2+(yy-.78)**2)/.06)[...,None];g2=np.exp(-((xx-.85)**2+(yy-.15)**2)/.1)[...,None]
ring=np.exp(-((np.hypot(xx-.2,yy-.78)-.45)**2)/.0008)[...,None]
wl=np.array([.008,.016,.04])+g1*bl*.8+g2*bl*.25+ring*bl*.3
WALL=img('wallpaper',np.clip(wl,0,1).astype(np.float32))
def mat(n,c,metal=0,rough=.5,coat=0,emit=None,es=0,orm=None,nrm=None,wall=None):
    m=bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    def s(k,v):
        try:b.inputs[k].default_value=v
        except Exception:pass
    s('Base Color',(*c,1));s('Metallic',metal);s('Roughness',rough);s('Coat Weight',coat);s('Coat Roughness',.04)
    if emit:s('Emission Color',(*emit,1));s('Emission Strength',es)
    nt=m.node_tree;nd=nt.nodes;ln=nt.links
    def tx(im,nc=True):
        t=nd.new('ShaderNodeTexImage');t.image=im;im.colorspace_settings.name='Non-Color' if nc else 'sRGB';return t
    if orm:
        t=tx(orm);sp=nd.new('ShaderNodeSeparateColor');ln.new(t.outputs['Color'],sp.inputs['Color']);ln.new(sp.outputs['Green'],b.inputs['Roughness']);ln.new(sp.outputs['Blue'],b.inputs['Metallic'])
    if nrm:
        t=tx(nrm);nm=nd.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.35;ln.new(t.outputs['Color'],nm.inputs['Color']);ln.new(nm.outputs['Normal'],b.inputs['Normal'])
    if wall:
        t=tx(wall,False);ln.new(t.outputs['Color'],b.inputs['Base Color']);ln.new(t.outputs['Color'],b.inputs['Emission Color'])
    return m
ti=mat('titanio',(.56,.57,.6),1,.32,orm=ORM);glass=mat('vidro',(.025,.03,.045),.3,.06,1)
disp=mat('display',(.01,.015,.03),0,.2,0,(1,1,1),.9,wall=WALL);pcb=mat('pcb',(.04,.1,.1),.3,.5)
chip=mat('chip',(.75,.78,.82),1,.28);chipd=mat('chip_escuro',(.02,.02,.025),.2,.4)
batt=mat('bateria',(.1,.11,.14),.5,.5);lab=mat('etiqueta',(.62,.66,.72),.6,.42)
lens=mat('lente',(.01,.012,.02),.2,.02,1);gold=mat('ouro',(.8,.6,.2),1,.3);flash=mat('flash',(.9,.85,.7),0,.3)
def pts(w,h,r,n=10):
    o=[]
    for cx,cy,a0 in[(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(n+1):
            a=math.radians(a0+90*i/n);o.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    return o
def slab(n,w,h,r,d,loc,m,bev=0):
    r=min(r,w/2*.9,h/2*.9);bm=bmesh.new();f=bm.faces.new([bm.verts.new((x,y,-d/2)) for x,y in pts(w,h,r)])
    g=bmesh.ops.extrude_face_region(bm,geom=[f])['geom']
    bmesh.ops.translate(bm,vec=(0,0,d),verts=[v for v in g if isinstance(v,bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    uv=bm.loops.layers.uv.new('UV')
    for f2 in bm.faces:
        for l in f2.loops:l[uv].uv=(l.vert.co.x/w+.5,l.vert.co.y/h+.5)
    me=bpy.data.meshes.new(n);bm.to_mesh(me);bm.free()
    ob=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(ob);ob.location=loc;me.materials.append(m)
    if bev:
        b=ob.modifiers.new('bev','BEVEL');b.width=bev;b.segments=4;b.limit_method='ANGLE';b.angle_limit=math.radians(35)
    return ob
def prim(kind,n,loc,m,**k):
    getattr(bpy.ops.mesh,'primitive_%s_add'%kind)(location=loc,**k);o=bpy.context.active_object;o.name=n;o.data.materials.append(m);return o
kids=[]
def ch(p,*o):
    for x in o:kids.append((x,p))
# aro de titânio
rim=slab('rim',1.6,3.3,.24,.12,(0,0,0),ti);cut=slab('cut',1.5,3.2,.19,.4,(0,0,0),ti)
b=rim.modifiers.new('bool','BOOLEAN');b.operation='DIFFERENCE';b.object=cut;b.solver='EXACT'
with bpy.context.temp_override(object=rim,active_object=rim):bpy.ops.object.modifier_apply(modifier='bool')
bpy.data.objects.remove(cut);b=rim.modifiers.new('bev','BEVEL');b.width=.016;b.segments=4;b.limit_method='ANGLE'
ch(rim,slab('botao_power',.04,.45,.02,.05,(.81,.4,0),ti,.008),slab('vol_1',.04,.28,.02,.05,(-.81,.6,0),ti,.008),
 slab('vol_2',.04,.28,.02,.05,(-.81,.2,0),ti,.008),slab('porta_usbc',.34,.08,.035,.05,(0,-1.655,0),chipd))
for i in range(5):
    for sx in(-1,1):ch(rim,prim('cylinder','grade',(sx*(.26+.06*i),-1.652,0),chipd,radius=.016,depth=.03,rotation=(math.pi/2,0,0),vertices=16))
# tela
screen=slab('screen',1.5,3.2,.17,.03,(0,0,.1),glass,.006)
ch(screen,slab('display',1.44,3.14,.15,.006,(0,0,.118),disp),prim('cylinder','camera_frontal',(0,1.48,.12),chipd,radius=.035,depth=.004,vertices=32))
# placa
board=slab('board',1.3,1.0,.03,.035,(0,1,-.03),pcb)
for dx,dy,w,h,m in[(-.35,.15,.4,.3,chip),(.2,-.15,.3,.22,chip),(.35,.28,.24,.2,chipd),(-.3,-.25,.22,.16,chip),(-.1,.3,.2,.14,chipd)]:
    ch(board,slab('chip',w,h,.012,.04,(dx,1+dy,.0075),m,.004))
for i in range(26):
    ch(board,slab('smd',random.uniform(.04,.1),random.uniform(.03,.06),.005,.02,(random.uniform(-.55,.55),1+random.uniform(-.42,.42),-.0025),random.choice([chipd,gold])))
# bateria
battery=slab('battery',1.1,1.6,.04,.07,(0,-.55,-.03),batt,.01)
ch(battery,slab('etiqueta',1.0,1.5,.03,.01,(0,-.55,.007),lab),slab('conector',.3,.08,.01,.02,(0,.29,-.03),gold))
# traseira
back=slab('back',1.58,3.28,.22,.03,(0,0,-.09),glass,.006)
mod=slab('modulo_camera',.78,.78,.16,.03,(-.38,1.2,-.12),glass,.006);ch(back,mod)
for dx,dy in[(-.17,.17),(.17,.17),(0,-.17)]:
    x,y=-.38+dx,1.2+dy
    ch(back,prim('torus','aro_lente',(x,y,-.15),ti,major_radius=.145,minor_radius=.022,major_segments=48,minor_segments=12),
     prim('cylinder','vidro_lente',(x,y,-.15),lens,radius=.13,depth=.04,vertices=48))
ch(back,prim('cylinder','flash',(-.14,1.0,-.14),flash,radius=.045,depth=.02,vertices=32))
bpy.ops.object.text_add(location=(0,-.25,-.108),rotation=(0,math.pi,0));t=bpy.context.active_object;t.name='logo_LSS'
t.data.body='LSS';t.data.align_x='CENTER';t.data.size=.3;t.data.extrude=.003;t.data.materials.append(ti);ch(back,t)
bpy.context.view_layer.update()
for c,p in kids:c.parent=p;c.matrix_parent_inverse=p.matrix_world.inverted()
for o in bpy.data.objects:
    if o.type=='MESH':
        for q in o.data.polygons:q.use_smooth=True
        try:o.data.use_auto_smooth=True;o.data.auto_smooth_angle=math.radians(40)
        except Exception:pass
# animação "explodir" (frames 1→61, linear: o ease é feito pela rolagem)
sc=bpy.context.scene;sc.frame_start=1;sc.frame_end=61;sc.render.fps=30
for o,dz in[(screen,1.3),(board,-.45),(battery,-.9),(back,-1.6)]:
    o.keyframe_insert('location',index=2,frame=1);o.location.z+=dz;o.keyframe_insert('location',index=2,frame=61)
    o.animation_data.action.name='explodir_'+o.name
    for fc in o.animation_data.action.fcurves:
        for k in fc.keyframe_points:k.interpolation='LINEAR'
    o.location.z-=dz
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_yup=False,export_apply=True,export_animations=True,export_materials='EXPORT',export_image_format='JPEG',export_jpeg_quality=85,export_cameras=False,export_lights=False)
print('GLB',OUT,os.path.getsize(OUT))
if PREV:
    sc.frame_set(int(os.environ.get('FR','1')));sc.render.engine='CYCLES';sc.cycles.samples=40;sc.cycles.use_denoising=False
    sc.render.resolution_x=560;sc.render.resolution_y=720;sc.render.filepath=PREV
    w=bpy.data.worlds.new('w');w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(.004,.005,.009,1);sc.world=w
    def look(o,tgt=(0,0,0)):
        from mathutils import Vector,Matrix;f=(Vector(tgt)-o.location).normalized();r=f.cross(Vector((0,1,0))).normalized();u=r.cross(f);o.rotation_euler=Matrix((r,u,-f)).transposed().to_euler()
    cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam'));cam.data.lens=75;cam.location=(3.4,1.4,9);bpy.context.collection.objects.link(cam);look(cam);sc.camera=cam
    for loc,col,en in[((-5,1,3),(.2,.45,1),900),((5,2,-3),(.2,.45,1),700),((0,5,5),(1,1,1),500)]:
        l=bpy.data.objects.new('l',bpy.data.lights.new('l','AREA'));l.data.color=col;l.data.energy=en;l.data.size=4;l.location=loc;bpy.context.collection.objects.link(l);look(l)
    bpy.ops.render.render(write_still=True)
