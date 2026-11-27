// Carte 3D du complexe désertique : zone industrielle compacte au nord-ouest,
// laboratoire au sud-ouest, grand plateau ouvert à l'est et bunker au sud.
// Les éléments sont des décors de jeu fictifs, sans fonctions opérationnelles.
export function createDesertLandscape(THREE, site, mat, layout={pointZero:{x:28,z:-3},bunker:{x:28,z:3997}}) {
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

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(320,4300),sand);
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-.06,1997);floor.receiveShadow=true;world.add(floor);

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
  if(Math.abs(siteDistance-4000)>.001)throw new Error('Tour et bunker doivent être séparés de 4 000 mètres.');
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

  // BUNKER D'OBSERVATION — volume semi-enterré, voûte arrondie et façade en béton.
  // Décor architectural fictif : aucune fonction opérationnelle n'est simulée.
  // La position du bâtiment et celle de sa porte restent inchangées pour préserver le gameplay.
  const bunker=new THREE.Group();bunker.position.set(layout.bunker.x,0,layout.bunker.z);world.add(bunker);
  bunker.name='ObservationBunker_4000m';
  const bunkerSand=mat('#b88a59',1), bunkerEarth=mat('#9d704b',1);
  const bunkerConcrete=mat('#777970',.92), bunkerConcreteLight=mat('#92938a',.9);
  const bunkerMetal=mat('#424b49',.72,.38), bunkerTrim=mat('#4b514c',.85,.25);
  const bunkerGlass=new THREE.MeshStandardMaterial({color:'#789b9a',metalness:.28,roughness:.18,transparent:true,opacity:.32});

  // Talus de terre bas : le bâtiment semble émerger du terrain plutôt que reposer dessus.
  const berm=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),bunkerSand);
  berm.scale.set(8.1,2.25,5.25);berm.position.set(0,.15,-.15);
  berm.castShadow=true;berm.receiveShadow=true;bunker.add(berm);
  const bermLeft=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),bunkerEarth);
  bermLeft.scale.set(2.2,1.25,4.2);bermLeft.position.set(-5.1,.12,-.1);bunker.add(bermLeft);
  const bermRight=bermLeft.clone();bermRight.position.x=5.1;bunker.add(bermRight);

  // Corps bas en béton, avec toiture cintrée au lieu d'un toit plat cubique.
  box(bunker,10.8,2.15,8.0,0,.92,-.05,bunkerConcrete);
  const vault=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),bunkerConcrete);
  vault.scale.set(5.55,3.25,4.15);vault.position.set(0,1.78,-.05);
  vault.castShadow=true;vault.receiveShadow=true;bunker.add(vault);
  // Bandeau frontal et joues latérales en béton apparent.
  box(bunker,11.4,.34,.55,0,2.18,3.92,bunkerConcreteLight);
  box(bunker,.62,2.55,.65,-5.35,1.27,3.88,bunkerConcrete);
  box(bunker,.62,2.55,.65,5.35,1.27,3.88,bunkerConcrete);
  // Entrée sombre avec encadrement arrondi et porte métallique épaisse, purement visuelle.
  box(bunker,2.45,1.85,.18,0,.95,4.16,mat('#202522',.95));
  const entranceArch=new THREE.Mesh(new THREE.TorusGeometry(1.22,.19,10,28,Math.PI),bunkerConcreteLight);
  entranceArch.position.set(0,1.88,4.18);bunker.add(entranceArch);
  const bunkerDoor=new THREE.Group();bunkerDoor.position.set(-1.1,.05,4.38);bunker.add(bunkerDoor);
  box(bunkerDoor,2.15,1.82,.18,1.075,.91,0,bunkerMetal);
  box(bunkerDoor,.12,1.72,.08,.18,.91,.13,bunkerTrim);
  box(bunkerDoor,.08,1.72,.08,1.96,.91,.13,bunkerTrim);
  box(bunkerDoor,1.78,.09,.08,1.075,.16,.13,bunkerTrim);
  box(bunkerDoor,1.78,.09,.08,1.075,1.66,.13,bunkerTrim);
  cyl(bunkerDoor,.055,.055,.12,1.88,.92,.19,mat('#d1b477',.35,.55),10);
  bunkerDoor.userData.open=false;
  bunker.userData.door=bunkerDoor;

  // Petite fenêtre d'observation latérale, encastrée et divisée en panneaux.
  box(bunker,4.25,1.42,.3,-7.55,2.05,-3.95,bunkerConcrete);
  box(bunker,4.25,1.42,.3,7.55,2.05,-3.95,bunkerConcrete);
  box(bunker,7.9,.2,.24,0,1.28,-4.12,bunkerConcreteLight);
  box(bunker,7.9,.2,.24,0,2.82,-4.12,bunkerConcreteLight);
  const rearGlass=new THREE.Mesh(new THREE.BoxGeometry(7.5,1.34,.1),bunkerGlass);
  rearGlass.position.set(0,2.05,-3.88);bunker.add(rearGlass);
  for(const x of [-3.8,0,3.8])box(bunker,.1,1.42,.15,x,2.05,-3.78,bunkerMetal);

  // Détails de surface : joints de panneaux, angles chanfreinés et éclairage extérieur.
  for(const x of [-4.25,-2.15,2.15,4.25]){
    const seam=box(bunker,.1,1.55,.12,x,1.0,4.22,bunkerConcreteLight);
    seam.position.y=1.05;
  }
  for(const x of [-4.9,4.9]){
    box(bunker,.32,.18,.42,x,2.55,3.75,bunkerTrim);
    const lamp=new THREE.Mesh(new THREE.BoxGeometry(.24,.16,.12),new THREE.MeshStandardMaterial({color:'#e4c27d',emissive:'#9a6d2d',emissiveIntensity:.55}));
    lamp.position.set(x,2.68,3.96);bunker.add(lamp);
  }
  // Rampe d'accès et bordure basse intégrées au sable.
  const apron=new THREE.Mesh(new THREE.CylinderGeometry(5.9,6.8,.16,24),bunkerSand);
  apron.scale.z=.78;apron.position.set(0,.035,2.55);bunker.add(apron);
  const threshold=box(bunker,3.1,.16,1.15,0,.08,4.85,bunkerConcreteLight);
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
  world.userData.bunkerDoor=bunker.userData.door;
  world.userData.bunker=bunker;
  return world;
}
