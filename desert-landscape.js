// Carte 3D du complexe désertique : zone industrielle compacte au nord-ouest,
// laboratoire au sud-ouest, grand plateau ouvert à l'est et bunker au sud.
// Les éléments sont des décors de jeu fictifs, sans fonctions opérationnelles.
export function createDesertLandscape(THREE, site, mat, layout={pointZero:{x:28,z:-3},bunker:{x:28,z:997}}) {
  const world = new THREE.Group();
  world.name = 'DesertResearchSite';
  site.add(world);

  const box=(p,w,h,d,x,y,z,m,cast=true)=>{
    const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
    o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;p.add(o);return o;
  };
  const cyl=(p,rt,rb,h,x,y,z,m,n=16)=>{
    const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);
    o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;
  };
  const sand=mat('#c99a62',1), pale=mat('#dfbd89',1), ochre=mat('#b98553',1);
  const rock=mat('#89543d',1), cliff=mat('#704536',1);
  const concrete=mat('#777970',.92), roof=mat('#343b3a',.8);
  const metal=mat('#59615d',.62,.45), dark=mat('#252d2d',.78);
  const glass=new THREE.MeshStandardMaterial({color:'#8eaaa5',metalness:.2,roughness:.3});

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(220,3150),sand);
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-.06,1497);floor.receiveShadow=true;world.add(floor);

  // Désert du Jornada del Muerto : horizon dégagé, sans falaises ni rochers.
  for(let i=0;i<125;i++){
    const x=(Math.random()-.5)*150,z=(Math.random()-.5)*130;
    const patch=new THREE.Mesh(new THREE.CircleGeometry(.35+Math.random()*1.1,6),i%5? pale:ochre);
    patch.rotation.x=-Math.PI/2;patch.position.set(x,.002,z);
    patch.scale.set(1.8,.7,.6);world.add(patch);
  }

  // ROUTES : pistes sableuses larges et courbes entre les quartiers.
  const roadMat=mat('#a98259',1);
  const road=(x,z,w,d,angle=0)=>{
    const r=box(world,w,.045,d,x,.006,z,roadMat,false);r.rotation.y=angle;
  };
  road(-7,-9,46,4,-.32);
  road(-1,7,4,35,.12);
  road(17,20,39,4,-.22);
  road(4,38,28,3,.12);
  // Liaison piétonne visible : axe mesuré du centre de la tour au centre du bunker.
  const siteDistance=Math.hypot(layout.bunker.x-layout.pointZero.x,layout.bunker.z-layout.pointZero.z);
  if(Math.abs(siteDistance-1000)>.001)throw new Error('Tour et bunker doivent être séparés de 1 000 mètres.');
  road(layout.pointZero.x,(layout.pointZero.z+layout.bunker.z)/2,6,siteDistance,Math.atan2(layout.bunker.x-layout.pointZero.x,layout.bunker.z-layout.pointZero.z));

  // ZONE INDUSTRIELLE / MINIÈRE — compacte, dans le quadrant supérieur gauche.
  const plant=new THREE.Group();plant.position.set(-28,0,-22);world.add(plant);
  box(plant,27,.28,21,0,.12,0,mat('#77796f'));
  box(plant,27.5,.12,21.5,0,.27,0,mat('#9a9a89'));
  for(const x of [-7,-2.5]){
    const stack=new THREE.Group();stack.position.set(x,0,-3.7);plant.add(stack);
    const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.35,2.0,18,24,true),concrete);
    shell.position.y=9;shell.castShadow=true;shell.receiveShadow=true;stack.add(shell);
    cyl(stack,1.48,1.48,.3,0,18.05,0,roof,24);
    cyl(stack,1.15,1.15,.22,0,.12,0,dark,24);
    // Cerclages extérieurs décoratifs.
    for(const y of [3,8,13,17.2]) cyl(stack,1.62-(y/18)*.55,1.68-(y/18)*.55,.16,0,y,0,metal,24);
  }
  const hall=new THREE.Group();hall.position.set(3.5,0,-3);plant.add(hall);
  box(hall,8,3,6,0,1.5,0,concrete);
  box(hall,8.4,.28,6.4,0,3.14,0,roof);
  box(hall,3.6,1.4,.12,0,1.9,3.08,glass,false);
  for(let x=-1.5;x<=1.51;x+=1)box(hall,.08,1.5,.16,x,1.9,3.16,dark);
  const annex=new THREE.Group();annex.position.set(4,0,5.5);plant.add(annex);
  box(annex,5.5,2.2,4.5,0,1.1,0,mat('#8a8c80'));
  box(annex,5.8,.22,4.8,0,2.3,0,roof);
  box(plant,3.2,1.6,2.8,-9,.8,5,mat('#8a8c80'));
  box(plant,3.4,.2,3,-9,1.7,5,roof);
  for(const x of [-10,10])box(plant,.85,1.5,.85,x,.75,0,metal);


  // Fumée décorative animée au-dessus des deux tours de la centrale.
  const smokePuffs=[];
  for(const sx of [-35,-30.5]){
    for(let i=0;i<9;i++){
      const puff=new THREE.Mesh(
        new THREE.SphereGeometry(.55+(i%3)*.18,10,8),
        new THREE.MeshStandardMaterial({color:'#8a8b86',transparent:true,opacity:.2,depthWrite:false,roughness:1})
      );
      puff.position.set(sx+(Math.random()-.5)*.5,18.8+i*2.0,-25.7+(Math.random()-.5)*.5);
      puff.scale.set(1,1.15,1);
      world.add(puff);
      smokePuffs.push({mesh:puff,baseY:18.8+i*2.0,phase:i*.7+(sx+40)*.3,baseX:sx});
    }
  }
  world.userData.smokePuffs=smokePuffs;

  // Le terrain minier jouable est géré séparément par game.js.

  // LABORATOIRE — quartier inférieur gauche, style béton années 1940-50.
  const lab=new THREE.Group();lab.position.set(-30,0,22);world.add(lab);
  box(lab,19,.12,17,0,.06,0,mat('#77776c'));
  const mainLab=new THREE.Group();mainLab.position.set(-2,0,0);lab.add(mainLab);
  // Murs séparés avec une véritable ouverture pour la porte d'entrée.
  box(mainLab,12,3.8,.22,0,1.9,-3.9,concrete);
  box(mainLab,.22,3.8,8,-5.9,1.9,0,concrete);
  box(mainLab,.22,3.8,8,5.9,1.9,0,concrete);
  box(mainLab,.48,3.8,.22,-5.76,1.9,3.9,concrete);
  box(mainLab,10.02,3.8,.22,.99,1.9,3.9,concrete);
  box(mainLab,12.5,.32,8.5,0,3.95,0,roof);
  box(mainLab,6.4,2,.12,0,2.05,4.08,glass,false);
  for(let x=-2.8;x<=2.81;x+=1.4)box(mainLab,.1,2.05,.18,x,2.05,4.16,dark);
  box(mainLab,1.55,.18,.24,-4.8,.12,4.16,dark);
  box(mainLab,.16,2.4,.22,-5.55,1.2,4.16,roof);
  box(mainLab,.16,2.4,.22,-4.05,1.2,4.16,roof);
  const annexLab=new THREE.Group();annexLab.position.set(6,0,-4);lab.add(annexLab);
  box(annexLab,6,2.7,5,0,1.35,0,mat('#8c9187'));
  box(annexLab,6.3,.25,5.3,0,2.78,0,roof);
  const service=new THREE.Group();service.position.set(5,0,5);lab.add(service);
  box(service,5,2.4,4,0,1.2,0,mat('#8c9187'));
  box(service,5.3,.25,4.3,0,2.52,0,roof);
  for(const [x,z] of [[-8,-5],[8,-5],[-8,6],[8,6]]){
    box(lab,1.7,1.1,1.6,x,.55,z,mat('#77796f'));
  }

  // GRAND PLATEAU EST : espace de jeu largement dégagé, avec seulement quelques repères.
  const plateau=new THREE.Group();plateau.position.set(28,0,-3);world.add(plateau);
  const plateauFloor=new THREE.Mesh(new THREE.CircleGeometry(34,80),mat('#d2a36b',1));
  plateauFloor.rotation.x=-Math.PI/2;plateauFloor.position.y=.012;plateau.add(plateauFloor);
  // Petits repères irréguliers et discrets en bordure, sans cercles concentriques ni mesures.
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,r=33;
    const post=cyl(plateau,.07,.1,1.15,Math.cos(a)*r,.58,Math.sin(a)*r,metal,8);
    const cap=box(plateau,.38,.24,.1,Math.cos(a)*r,1.22,Math.sin(a)*r,mat('#c4a879'));
    cap.rotation.y=-a;
  }
  // Plateau de la tour volontairement vide : aucun abri, annexe, véhicule ou bâtiment secondaire.
  // La tour reste le seul élément bâti de cette zone ; l'unique bunker est à 1 000 m.

  // UNIQUE BUNKER D'OBSERVATION — décor stylisé, enfoui dans un talus de sable.
  // Son centre reste exactement à 1 000 m de la tour ; aucune autre construction sur le plateau.
  const bunker=new THREE.Group();bunker.position.set(layout.bunker.x,0,layout.bunker.z);world.add(bunker);
  bunker.name='ObservationBunker_1000m';
  const bunkerSand=mat('#b88a59',1), bunkerEarth=mat('#9d704b',1), bunkerTimber=mat('#624a35',.95), bunkerConcrete=mat('#77776d',.92);
  // Talus bas et large qui donne au bunker son aspect semi-enterré.
  const berm=new THREE.Mesh(new THREE.SphereGeometry(1,10,7),bunkerSand);
  berm.scale.set(10.5,3.8,8.2);berm.position.set(0,1.8,-1.0);berm.castShadow=true;berm.receiveShadow=true;bunker.add(berm);
  const bermSide=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),bunkerEarth);
  bermSide.scale.set(8.7,2.8,6.8);bermSide.position.set(0,1.25,-1.2);bermSide.castShadow=true;bunker.add(bermSide);
  // Façade frontale simple, inspirée de la photo : béton, bois et une grande ouverture sombre.
  box(bunker,12,.32,1.0,0,.16,4.0,bunkerConcrete);
  box(bunker,12,.38,.35,0,3.05,4.05,bunkerTimber);
  box(bunker,.42,2.9,.45,-5.65,1.65,4.12,bunkerConcrete);
  box(bunker,.42,2.9,.45,5.65,1.65,4.12,bunkerConcrete);
  box(bunker,11.0,.22,.35,0,2.78,4.1,bunkerTimber);
  box(bunker,10.8,1.05,.16,0,2.12,4.18,dark);
  for(let x=-5.0;x<=5.01;x+=1.0)box(bunker,.09,1.0,.2,x,2.12,4.28,bunkerTimber);
  // Entrée centrale et quelques renforts visuels en bois, sans détail technique.
  box(bunker,2.25,1.85,.22,0,.95,4.3,mat('#202522',.95));
  const bunkerDoor=new THREE.Group();bunkerDoor.position.set(-1.1,.05,4.38);bunker.add(bunkerDoor);
  box(bunkerDoor,2.15,1.82,.16,1.075,.91,0,mat('#4b4032',.92));
  box(bunkerDoor,.12,1.72,.08,.18,.91,.12,mat('#b69a67',.55,.35));
  cyl(bunkerDoor,.055,.055,.12,1.88,.92,.16,mat('#d1b477',.35,.55),10);
  bunkerDoor.userData.open=false;
  // Grande vitre d'observation orientée vers la tour (face arrière, -Z).
  box(bunker,10.2,2.35,.34,0,2.25,-4.48,bunkerConcrete);
  const bunkerGlass=new THREE.Mesh(new THREE.BoxGeometry(8.7,1.55,.12),new THREE.MeshStandardMaterial({color:'#789b9a',metalness:.28,roughness:.18,transparent:true,opacity:.48}));
  bunkerGlass.position.set(0,2.35,-4.28);bunker.add(bunkerGlass);
  for(const x of [-4.45,0,4.45])box(bunker,.12,1.78,.2,x,2.35,-4.18,bunkerTimber);
  box(bunker,8.95,.12,.22,0,1.53,-4.18,bunkerTimber);
  box(bunker,8.95,.12,.22,0,3.17,-4.18,bunkerTimber);
  bunker.userData.door=bunkerDoor;
  for(const x of [-4.7,-2.8,2.8,4.7])box(bunker,.24,2.55,.3,x,1.35,4.42,bunkerTimber);
  const brace=(x,y,angle)=>{
    const part=box(bunker,.28,3.15,.32,x,y,4.48,bunkerTimber);
    part.rotation.z=angle;
  };
  brace(-3.55,1.45,-.48);brace(-2.05,1.45,.48);brace(2.05,1.45,-.48);brace(3.55,1.45,.48);
  // Petite lèvre de terre au pied de la façade pour l'intégrer au désert.
  const apron=new THREE.Mesh(new THREE.CylinderGeometry(7.5,8.5,.18,10),bunkerSand);
  apron.scale.z=.72;apron.position.set(0,.05,2.1);bunker.add(apron);

  // Aucun relief rocheux : le désert reste ouvert jusqu'à l'horizon.

  // Végétation très clairsemée, uniquement sur les marges de la carte.
  for(let i=0;i<48;i++){
    const x=(Math.random()-.5)*145,z=(Math.random()-.5)*120;
    if((x<-15&&x>-48&&z>-51&&z<35)||(x>0&&z>-38&&z<31))continue;
    const shrub=new THREE.Group();shrub.position.set(x,0,z);world.add(shrub);
    cyl(shrub,.045,.07,.8,0,.4,0,mat('#70533a'),6);
    for(let j=0;j<3;j++){
      const twig=box(shrub,.055,.75,.055,0,.7,0,mat('#70533a'));
      twig.rotation.z=(j-1)*.65;
    }
  }
  world.userData.bunkerDoor=bunker.userData.bunkerDoor;
  world.userData.bunker=bunker;
  return world;
}
