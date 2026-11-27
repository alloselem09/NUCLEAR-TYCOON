/* ============================================================================
   NUCLEAR TYCOON — Personnage 3D : l'ingénieur de site
   ----------------------------------------------------------------------------
   Module ES autonome (aucune dépendance autre que Three.js).
   Usage :  import { createCharacter } from "./character.js";
            const hero = createCharacter(THREE, { scale: 1.5 });
            scene.add(hero.root);
            hero.update(delta, moving, speedEnUnitesParSeconde);
            hero.play("mine", () => { ...instant de l'impact... });
            hero.setCarrying(nombreDeMinerais);

   Repère : les pieds sont à y = 0, le personnage regarde vers +z.
   Les dimensions internes sont en mètres (≈ 1,80 m casque compris) ;
   `scale` ajuste la taille dans le monde du jeu.
   ========================================================================== */

  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };
  var damp = function (cur, target, lambda, dt) { return lerp(cur, target, 1 - Math.exp(-lambda * dt)); };

  // Longueurs d'os (mètres)
  var THIGH = 0.42;
  var SHIN = 0.42;
  var ANKLE_H = 0.06;      // hauteur de la cheville au-dessus du sol
  var HIPS_REST = ANKLE_H + THIGH + SHIN + 0.02;
  var MINE_DURATION = 1.0; // secondes
  var MINE_HIT_AT = 0.56;  // part de l'animation où l'outil frappe

  export function createCharacter(THREE, options) {
    var o = Object.assign({
      scale: 1.35,
      skin: "#c18b68",
      hair: "#4b392c",
      jacket: "#e18f29",
      jacketShade: "#b9631c",
      pants: "#233646",
      helmet: "#f1b72e",
      reflective: "#ecdc9e",
      accent: "#4fc9c1",
    }, options || {});

    /* ---------------------------------------------------------------- matériaux */
    var M = function (color, rough, metal, extra) {
      return new THREE.MeshStandardMaterial(Object.assign({
        color: color, roughness: rough === undefined ? 0.75 : rough, metalness: metal || 0,
      }, extra || {}));
    };
    var skin = M(o.skin, 0.58);
    var skinDark = M("#9d6c4f", 0.7);
    var hair = M(o.hair, 0.88);
    var jacket = M(o.jacket, 0.8);
    var jacketShade = M(o.jacketShade, 0.85);
    var pants = M(o.pants, 0.92);
    var pantsShade = M("#1a2835", 0.95);
    var helmet = M(o.helmet, 0.34, 0.06);
    var helmetShade = M("#c88f1c", 0.4, 0.05);
    var reflective = M(o.reflective, 0.28, 0.3, { emissive: "#4a421c", emissiveIntensity: 0.45 });
    var leather = M("#33261c", 0.7, 0.05);
    var bootMat = M("#2d2925", 0.62, 0.04);
    var soleMat = M("#14110e", 0.95);
    var laceMat = M("#cfcabb", 0.9);
    var gloveMat = M("#39413f", 0.8);
    var gloveGrip = M("#caa02d", 0.85);
    var steel = M("#939fa1", 0.32, 0.78);
    var darkSteel = M("#4a5559", 0.45, 0.6);
    var wood = M("#7b5630", 0.82);
    var pack = M("#3b4b53", 0.88);
    var packShade = M("#2b383e", 0.9);
    var plastic = M("#e8e4d8", 0.5);
    var eyeWhite = M("#f1eee6", 0.3);
    var iris = M("#3c2b1e", 0.28);
    var pupil = M("#0a0a0a", 0.2);
    var glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    var mouthMat = M("#6e3434", 0.6);
    var frame = M("#161b1e", 0.5, 0.2);
    var lens = M("#a8dcec", 0.05, 0.1, { transparent: true, opacity: 0.26, depthWrite: false });
    var ledMat = M(o.accent, 0.3, 0, { emissive: o.accent, emissiveIntensity: 1.6 });
    var lampMat = M("#fff2cf", 0.2, 0, { emissive: "#ffd98a", emissiveIntensity: 1.3 });
    var ore = M("#a99a70", 0.95);
    var sack = M("#8c7c58", 0.95);

    /* ------------------------------------------------------------------ outils */
    var mesh = function (parent, geo, mat, x, y, z, opt) {
      var m = new THREE.Mesh(geo, mat);
      m.position.set(x || 0, y || 0, z || 0);
      if (opt) {
        if (opt.r) m.rotation.set(opt.r[0], opt.r[1], opt.r[2]);
        if (opt.s) m.scale.set(opt.s[0], opt.s[1], opt.s[2]);
      }
      m.castShadow = !(opt && opt.noShadow);
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    var group = function (parent, x, y, z) {
      var g = new THREE.Group();
      g.position.set(x || 0, y || 0, z || 0);
      if (parent) parent.add(g);
      return g;
    };
    var cyl = function (rt, rb, h, seg2) { return new THREE.CylinderGeometry(rt, rb, h, seg2 || 18); };
    var sph = function (r, w, h) { return new THREE.SphereGeometry(r, w || 20, h || 14); };
    var sphP = function (r, w, h, ps, pl, ts, tl) { return new THREE.SphereGeometry(r, w, h, ps, pl, ts, tl); };
    var cap = function (r, len, cs, rs) { return new THREE.CapsuleGeometry(r, len, cs || 6, rs || 14); };
    var HALF = Math.PI / 2;

    /* ---------------------------------------------------------------- squelette */
    var root = new THREE.Group();
    root.name = "SiteEngineer";
    var body = group(root);
    body.scale.setScalar(o.scale);

    var hips = group(body, 0, HIPS_REST, 0);

    /* Bassin */
    mesh(hips, cap(0.115, 0.13, 6, 16), pants, 0, 0.0, 0, { r: [0, 0, HALF], s: [1, 1, 0.85] });

    /* ------------------------------------------------------------------- jambes */
    var bootDetail = function (shin, side) {
      var ankle = group(shin, 0, -SHIN, 0); // pivot de la cheville
      // tige de la botte
      mesh(ankle, cyl(0.066, 0.072, 0.17, 18), bootMat, 0, 0.035, 0);
      mesh(ankle, new THREE.TorusGeometry(0.067, 0.011, 8, 20), leather, 0, 0.115, 0, { r: [HALF, 0, 0], s: [1, 1.05, 1] });
      // pied
      mesh(ankle, cap(0.057, 0.15, 6, 14), bootMat, 0, -0.012, 0.06, { r: [HALF, 0, 0], s: [1, 1, 0.82] });
      mesh(ankle, sph(0.058, 14, 10), bootMat, 0, -0.012, 0.145, { s: [1, 0.85, 1] });
      // embout acier
      mesh(ankle, sph(0.052, 14, 10), darkSteel, 0, -0.016, 0.158, { s: [1.02, 0.78, 0.9] });
      // semelle + talon
      mesh(ankle, new THREE.BoxGeometry(0.118, 0.026, 0.3), soleMat, 0, -0.046, 0.075);
      mesh(ankle, new THREE.BoxGeometry(0.112, 0.03, 0.07), soleMat, 0, -0.04, -0.045);
      // lacets
      for (var i = 0; i < 3; i++) {
        mesh(ankle, new THREE.BoxGeometry(0.055, 0.007, 0.012), laceMat, 0, 0.038 - i * 0.026, 0.07 - i * 0.001, { r: [-0.6, 0, 0], noShadow: true });
      }
      return ankle;
    };

    var makeLeg = function (side) {
      var thigh = group(hips, side * 0.1, -0.02, 0);
      mesh(thigh, sph(0.096, 18, 12), pants, 0, 0, 0);
      mesh(thigh, cyl(0.096, 0.074, THIGH + 0.01, 20), pants, 0, -THIGH / 2, 0);
      // poche cargo
      mesh(thigh, new THREE.BoxGeometry(0.03, 0.11, 0.1), pantsShade, side * 0.09, -0.17, 0.0, { r: [0, 0, side * -0.06] });
      var shin = group(thigh, 0, -THIGH, 0);
      mesh(shin, sph(0.075, 16, 12), pants, 0, 0, 0);
      mesh(shin, cyl(0.074, 0.058, SHIN + 0.01, 20), pants, 0, -SHIN / 2, 0);
      // genouillère
      mesh(shin, cap(0.052, 0.04, 4, 10), pantsShade, 0, 0.012, 0.062, { r: [0, 0, HALF], s: [1, 1, 0.65] });
      // bande réfléchissante bas de jambe
      mesh(shin, new THREE.CylinderGeometry(0.0645, 0.0625, 0.034, 20, 1, true), reflective, 0, -0.275, 0, { noShadow: true });
      var ankle = bootDetail(shin, side);
      return { thigh: thigh, shin: shin, ankle: ankle };
    };
    var legL = makeLeg(1);
    var legR = makeLeg(-1);

    /* -------------------------------------------------------------------- torse */
    var torso = group(hips, 0, 0.08, 0);

    var profile = [
      [0.153, -0.035], [0.158, 0.0], [0.166, 0.09], [0.186, 0.19], [0.204, 0.29],
      [0.207, 0.355], [0.187, 0.415], [0.132, 0.452], [0.064, 0.474], [0.0, 0.481],
    ];
    var profilePts = new THREE.SplineCurve(
      profile.map(function (p) { return new THREE.Vector2(p[0], p[1]); })
    ).getPoints(64);
    var radiusAt = function (y) {
      for (var i = 1; i < profilePts.length; i++) {
        if (profilePts[i].y >= y) {
          var a = profilePts[i - 1], b = profilePts[i];
          var t = (y - a.y) / Math.max(1e-6, b.y - a.y);
          return lerp(a.x, b.x, t);
        }
      }
      return 0.05;
    };
    var DEPTH = 0.7; // aplatissement avant/arrière du torse
    // ceinture du pantalon sous la veste
    mesh(torso, cyl(0.155, 0.148, 0.1, 32), pants, 0, -0.07, 0, { s: [1, 1, DEPTH] });
    var torsoMesh = mesh(torso, new THREE.LatheGeometry(profilePts, 44), jacket, 0, 0, 0, { s: [1, 1, DEPTH] });

    // bandes réfléchissantes
    [0.115, 0.285].forEach(function (y) {
      var r = radiusAt(y) + 0.006;
      mesh(torso, new THREE.CylinderGeometry(r, r, 0.05, 40, 1, true), reflective, 0, y, 0, { s: [1, 1, DEPTH], noShadow: true });
    });
    // bandes verticales réfléchissantes qui épousent le torse (poitrine et dos)
    var stripe = function (phiCenter, width, y0, y1) {
      var pts = profilePts
        .filter(function (p) { return p.y >= y0 && p.y <= y1; })
        .map(function (p) { return new THREE.Vector2(p.x + 0.0045, p.y); });
      var g = new THREE.LatheGeometry(pts, 6, phiCenter - width / 2, width);
      var m = mesh(torso, g, reflective, 0, 0, 0, { s: [1, 1, DEPTH], noShadow: true });
      m.material = reflective.clone();
      m.material.side = THREE.DoubleSide;
    };
    [0.34, -0.34, Math.PI + 0.3, Math.PI - 0.3].forEach(function (phi) { stripe(phi, 0.11, 0.115, 0.392); });
    // fermeture éclair
    mesh(torso, new THREE.BoxGeometry(0.012, 0.36, 0.01), darkSteel, 0, 0.21, 0.1405, { noShadow: true });
    // col montant
    mesh(torso, new THREE.TorusGeometry(0.083, 0.027, 10, 28), jacketShade, 0, 0.455, 0, { r: [HALF, 0, 0], s: [1, 1.05, 1] });

    // ceinture + équipement
    var beltR = radiusAt(0.015) + 0.005;
    mesh(torso, cyl(beltR, beltR, 0.065, 36), leather, 0, 0.015, 0, { s: [1, 1, DEPTH] });
    mesh(torso, new THREE.BoxGeometry(0.05, 0.05, 0.016), steel, 0, 0.015, beltR * DEPTH + 0.002);
    [1, -1].forEach(function (side) {
      mesh(torso, new THREE.BoxGeometry(0.06, 0.08, 0.06), leather, side * 0.148, -0.03, 0.045, { r: [0, side * -0.35, 0] });
    });
    // clé plate accrochée à droite
    var wrench = group(torso, -0.16, -0.045, 0.012);
    mesh(wrench, cap(0.009, 0.1, 3, 8), steel, 0, -0.05, 0);
    mesh(wrench, cyl(0.02, 0.02, 0.01, 6), steel, 0, -0.115, 0, { r: [HALF, 0, 0] });
    // lampe de poche à gauche
    mesh(torso, cap(0.014, 0.075, 4, 10), darkSteel, 0.16, -0.06, 0.02, { r: [0.08, 0, 0.06] });

    // radio épaule gauche + dosimètre poitrine droite
    var radio = group(torso, 0.125, 0.325, 0.1325);
    mesh(radio, new THREE.BoxGeometry(0.055, 0.085, 0.028), packShade, 0, 0, 0);
    mesh(radio, new THREE.BoxGeometry(0.038, 0.02, 0.006), M("#243c40", 0.3, 0.2, { emissive: "#1a6e69", emissiveIntensity: 0.6 }), 0, 0.016, 0.0155, { noShadow: true });
    mesh(radio, cyl(0.004, 0.004, 0.11, 6), darkSteel, 0.02, 0.095, -0.004);
    var badge = group(torso, -0.125, 0.325, 0.1325);
    mesh(badge, new THREE.BoxGeometry(0.058, 0.044, 0.014), plastic, 0, 0, 0);
    var led = mesh(badge, sph(0.0075, 10, 8), ledMat, 0.019, 0.011, 0.0095, { noShadow: true });
    mesh(badge, new THREE.BoxGeometry(0.03, 0.006, 0.003), darkSteel, -0.006, -0.008, 0.0078, { noShadow: true });

    /* --------------------------------------------------------------- sac à dos */
    var backpack = group(torso, 0, 0.22, -0.185);
    mesh(backpack, cap(0.098, 0.13, 6, 16), pack, 0, 0, 0, { s: [1.3, 1, 0.78] });
    mesh(backpack, cap(0.05, 0.06, 4, 12), packShade, 0, -0.08, -0.07, { s: [1.6, 1, 0.8] });
    mesh(backpack, new THREE.BoxGeometry(0.2, 0.012, 0.03), reflective, 0, 0.03, -0.074, { noShadow: true });
    mesh(backpack, cyl(0.036, 0.036, 0.14, 14), darkSteel, 0.155, -0.03, -0.01, { r: [0, 0, 0] }); // gourde
    mesh(backpack, cyl(0.03, 0.03, 0.02, 14), plastic, 0.155, 0.05, -0.01);

    /* ------------------------------------------------------------ pioche (x2) */
    var makePick = function () {
      var g = new THREE.Group();
      mesh(g, cyl(0.0185, 0.0215, 0.78, 10), wood, 0, -0.29, 0);
      var head = group(g, 0, -0.675, 0);
      mesh(head, cyl(0.03, 0.03, 0.09, 14), darkSteel, 0, 0, 0, { r: [HALF, 0, 0] });
      mesh(head, new THREE.ConeGeometry(0.03, 0.2, 12), steel, 0, 0, 0.14, { r: [HALF, 0, 0] });
      mesh(head, new THREE.ConeGeometry(0.034, 0.13, 4), steel, 0, 0, -0.1, { r: [-HALF, Math.PI / 4, 0], s: [1, 1, 0.45] });
      return g;
    };
    var pickBack = makePick();
    pickBack.position.set(0.165, 0.0, -0.225);
    pickBack.rotation.set(0.0, 0.0, Math.PI);
    pickBack.scale.setScalar(0.72);
    torso.add(pickBack);

    /* --------------------------------------------------------- sac de minerai */
    var oreSack = group(torso, 0, 0.5, -0.2);
    mesh(oreSack, sph(0.12, 16, 12), sack, 0, 0, 0, { s: [1.15, 0.85, 0.95] });
    mesh(oreSack, cyl(0.045, 0.06, 0.05, 12), sack, 0, 0.095, 0);
    for (var k = 0; k < 4; k++) {
      mesh(oreSack, new THREE.DodecahedronGeometry(0.045 + (k % 2) * 0.012, 0), ore,
        Math.cos(k * 1.7) * 0.07, 0.115 + (k % 2) * 0.02, Math.sin(k * 1.7) * 0.05, { r: [k, k * 2, k * 0.5] });
    }
    oreSack.visible = false;

    /* -------------------------------------------------------------------- bras */
    var makeHand = function (side) {
      var hand = group(null);
      mesh(hand, cap(0.034, 0.042, 4, 10), gloveMat, 0, -0.045, 0, { s: [1.18, 1, 0.74] });
      mesh(hand, new THREE.BoxGeometry(0.07, 0.014, 0.05), gloveGrip, 0, -0.012, 0, { noShadow: true, s: [1, 1, 0.5] });
      var fingers = group(hand);
      for (var i = 0; i < 4; i++) {
        var len = 0.04 + (i === 1 || i === 2 ? 0.009 : 0);
        mesh(fingers, cap(0.0125, len, 3, 8), gloveMat, (i - 1.5) * 0.0255, -0.1 - len * 0.1, 0.01, { r: [-0.34, 0, 0] });
      }
      mesh(fingers, cap(0.0145, 0.03, 3, 8), gloveMat, -side * 0.028, -0.056, 0.03, { r: [-0.55, 0, side * 0.55] });
      // poing serré autour du manche (visible quand on tient l'outil)
      var grip = group(hand);
      [-0.022, -0.06].forEach(function (y) {
        mesh(grip, new THREE.TorusGeometry(0.037, 0.0145, 8, 18), gloveMat, 0, y, 0, { r: [HALF, 0, 0] });
      });
      grip.visible = false;
      hand.userData = { fingers: fingers, grip: grip };
      return hand;
    };

    var makeArm = function (side) {
      var shoulder = group(torso, side * 0.236, 0.395, 0);
      mesh(shoulder, sph(0.068, 18, 14), jacket, 0, -0.005, 0);
      // épaulette renforcée
      mesh(shoulder, sph(0.07, 18, 10), jacketShade, 0, 0.022, 0, { s: [1, 0.5, 1] });
      mesh(shoulder, cyl(0.06, 0.052, 0.285, 20), jacket, 0, -0.14, 0);
      mesh(shoulder, new THREE.CylinderGeometry(0.0615, 0.0605, 0.034, 20, 1, true), reflective, 0, -0.115, 0, { noShadow: true });
      var elbow = group(shoulder, 0, -0.285, 0);
      mesh(elbow, sph(0.056, 16, 12), jacket, 0, 0, 0);
      mesh(elbow, cyl(0.054, 0.043, 0.26, 18), jacket, 0, -0.13, 0);
      // poignet élastique
      mesh(elbow, cyl(0.046, 0.046, 0.04, 16), jacketShade, 0, -0.255, 0);
      var hand = makeHand(side);
      hand.position.set(0, -0.275, 0);
      elbow.add(hand);
      return { shoulder: shoulder, elbow: elbow, hand: hand };
    };
    var armL = makeArm(1);
    var armR = makeArm(-1);

    // Pioche tenue en main droite (visible seulement pendant l'action)
    var pickHand = makePick();
    pickHand.position.set(0, -0.045, 0);
    pickHand.visible = false;
    armR.hand.add(pickHand);

    /* ------------------------------------------------------------ cou et tête */
    var neck = group(torso, 0, 0.5, 0);
    mesh(neck, cyl(0.052, 0.058, 0.13, 16), skinDark, 0, -0.02, 0);

    var headRig = group(neck, 0, 0.0, 0.005);
    var face = group(headRig, 0, 0.115, 0); // centre du crâne

    // crâne + mâchoire
    mesh(face, sph(0.13, 28, 20), skin, 0, 0, 0, { s: [0.88, 1.1, 0.95] });
    mesh(face, sph(0.088, 22, 14), skin, 0, -0.068, 0.02, { s: [0.98, 0.85, 0.95] });
    // joues
    [1, -1].forEach(function (side) {
      mesh(face, sph(0.03, 12, 10), skin, side * 0.062, -0.04, 0.078, { s: [1, 0.9, 0.7], noShadow: true });
      // oreilles
      mesh(face, sph(0.03, 12, 10), skin, side * 0.116, -0.004, -0.008, { s: [0.45, 1.05, 0.8] });
      mesh(face, sph(0.016, 10, 8), skinDark, side * 0.121, -0.004, -0.004, { s: [0.4, 0.9, 0.7], noShadow: true });
    });
    // nez
    mesh(face, sph(0.021, 12, 10), skin, 0, -0.024, 0.117, { s: [0.85, 1.25, 1.1] });
    mesh(face, cap(0.008, 0.03, 3, 8), skin, 0, 0.004, 0.113, { r: [0.35, 0, 0], noShadow: true });
    // bouche
    mesh(face, new THREE.TorusGeometry(0.028, 0.0034, 6, 18, Math.PI), mouthMat, 0, -0.054, 0.1075, { r: [0, 0, Math.PI], s: [1, 0.45, 1], noShadow: true });
    mesh(face, cap(0.0045, 0.03, 3, 6), skinDark, 0, -0.086, 0.107, { r: [0, 0, HALF], noShadow: true }); // lèvre inférieure / menton
    // barbe naissante (légère ombre sur la mâchoire)
    mesh(face, sphP(0.091, 22, 12, 0, TAU, HALF * 1.05, HALF * 0.9), M("#6d4d3c", 0.95, 0, { transparent: true, opacity: 0.35 }), 0, -0.071, 0.021, { s: [0.99, 0.86, 0.96], noShadow: true });

    // yeux (groupe animé pour le clignement)
    var eyes = group(face, 0, 0.014, 0);
    var eyeLeft = group(eyes, 0.045, 0, 0.1);
    var eyeRight = group(eyes, -0.045, 0, 0.1);
    [eyeLeft, eyeRight].forEach(function (eye, i) {
      var side = i === 0 ? 1 : -1;
      mesh(eye, sph(0.0205, 14, 10), eyeWhite, 0, 0, 0, { s: [1.12, 0.88, 0.58], noShadow: true });
      mesh(eye, sph(0.0118, 12, 10), iris, side * -0.0005, 0, 0.0085, { s: [1, 1, 0.5], noShadow: true });
      mesh(eye, sph(0.0063, 10, 8), pupil, side * -0.0005, 0, 0.0108, { s: [1, 1, 0.5], noShadow: true });
      mesh(eye, sph(0.0026, 6, 6), glint, side * 0.003 - side * 0.0005, 0.004, 0.0127, { noShadow: true });
    });
    // sourcils
    [1, -1].forEach(function (side) {
      mesh(face, cap(0.0075, 0.034, 3, 8), hair, side * 0.045, 0.047, 0.108, { r: [0.1, 0, HALF + side * 0.12], noShadow: true });
    });

    // lunettes de sécurité
    [1, -1].forEach(function (side) {
      mesh(face, sph(0.041, 18, 12), lens, side * 0.047, 0.014, 0.119, { s: [1.12, 0.78, 0.34], noShadow: true });
      mesh(face, new THREE.TorusGeometry(0.0425, 0.0034, 6, 22), frame, side * 0.047, 0.014, 0.1245, { s: [1.12, 0.78, 1], noShadow: true });
      mesh(face, new THREE.BoxGeometry(0.0075, 0.009, 0.115), frame, side * 0.1115, 0.022, 0.058, { noShadow: true });
    });
    mesh(face, cap(0.004, 0.02, 3, 6), frame, 0, 0.018, 0.128, { r: [0, 0, HALF], noShadow: true });

    // cheveux (nuque et côtés, le casque couvre le dessus)
    mesh(face, sphP(0.1355, 24, 16, HALF + 0.75, TAU - 1.5, 0, HALF * 1.45), hair, 0, 0.004, -0.01, { s: [0.915, 1.12, 0.985] });

    // casque de chantier
    var hat = group(face, 0, 0.075, 0);
    mesh(hat, sphP(0.128, 34, 18, 0, TAU, 0, HALF), helmet, 0, 0, 0, { s: [1.0, 0.92, 1.1] });
    // bord arrière (collerette)
    mesh(hat, new THREE.CylinderGeometry(0.131, 0.139, 0.016, 32, 1, false, Math.PI - 1.1, 2.2), helmetShade, 0, -0.004, -0.01, { s: [1, 1, 1.08] });
    // visière avant
    var visorMat = helmet.clone();
    visorMat.side = THREE.DoubleSide;
    mesh(hat, new THREE.RingGeometry(0.095, 0.2, 28, 1, -HALF - 1.05, 2.1), visorMat, 0, -0.002, 0.0, { r: [-HALF + 0.07, 0, 0] });
    // nervures
    mesh(hat, new THREE.TorusGeometry(0.1295, 0.0085, 6, 30, Math.PI), helmetShade, 0, 0, 0, { r: [0, HALF, 0], s: [1.1, 0.92, 1] });
    [1, -1].forEach(function (side) {
      mesh(hat, new THREE.TorusGeometry(0.1265, 0.006, 6, 30, Math.PI), helmetShade, side * 0.05, 0, 0, { r: [0, HALF, 0], s: [1.08, 0.9, 0.9] });
    });
    // bande réfléchissante frontale et lampe
    mesh(hat, new THREE.CylinderGeometry(0.1305, 0.1315, 0.02, 32, 1, true, -1.0, 2.0), reflective, 0, 0.011, 0.0, { s: [1, 1, 1.105], noShadow: true });
    var lamp = group(hat, 0, 0.058, 0.121);
    mesh(lamp, cyl(0.026, 0.03, 0.03, 16), darkSteel, 0, 0, 0, { r: [HALF - 0.4, 0, 0] });
    mesh(lamp, cyl(0.02, 0.02, 0.006, 16), lampMat, 0, 0.012, 0.016, { r: [HALF - 0.4, 0, 0], noShadow: true });
    // jugulaire
    [1, -1].forEach(function (side) {
      mesh(face, new THREE.BoxGeometry(0.006, 0.075, 0.012), leather, side * 0.119, -0.044, 0.01, { r: [0, 0, side * 0.08], noShadow: true });
    });

    /* ------------------------------------------------------------ ombre de contact */
    var blob = null;
    if (typeof document !== "undefined") {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var ctx = c.getContext("2d");
      var grd = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grd.addColorStop(0, "rgba(0,0,0,0.46)");
      grd.addColorStop(0.55, "rgba(0,0,0,0.22)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 128, 128);
      var tex = new THREE.CanvasTexture(c);
      blob = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15 * o.scale, 1.15 * o.scale),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      blob.rotation.x = -HALF;
      blob.position.y = 0.012;
      blob.renderOrder = 1;
      root.add(blob);
    }

    /* ================================================================ ANIMATION */
    var time = 0, phase = 0, spd = 0;
    var act = 0, actT = 0, actDur = MINE_DURATION, actName = null, actCb = null, actHit = false;
    var blinkClock = 0, nextBlink = 2.2, blinkProg = -1;
    var carrying = 0;

    function legExtent(theta, kappa) {
      return THIGH * Math.cos(theta) + SHIN * Math.cos(theta + kappa);
    }

    function update(dt, moving, speed) {
      dt = Math.min(Math.max(dt, 0), 0.05);
      time += dt;
      var worldSpeed = speed === undefined ? 6 : speed;
      spd = damp(spd, moving ? worldSpeed : 0, moving ? 11 : 8, dt);
      var v = clamp(spd / o.scale, 0, 5);          // vitesse du corps en m/s
      var B = clamp(spd / (0.9 * o.scale), 0, 1);   // poids de la marche
      var idle = 1 - B;

      // paramètres de foulée selon la vitesse
      var stepLen = 0.5 + 0.14 * Math.max(v, 1.0);
      var amp = Math.asin(clamp(stepLen / 1.75, 0, 0.8));
      var kneeSwing = Math.min(1.45, 0.5 + 0.2 * v);
      var armAmp = Math.min(0.8, 0.25 + 0.1 * v);
      var elbowBase = Math.min(1.15, 0.16 + 0.17 * v);
      var lean = Math.min(0.17, 0.02 + 0.032 * v);
      var twist = Math.min(0.22, 0.07 + 0.035 * v);

      phase += dt * TAU * Math.max(v, 1.0) / (2 * stepLen) * B;
      var s = Math.sin(phase), c = Math.cos(phase);

      /* action (minage) */
      if (actName) {
        actT += dt;
        if (!actHit && actT / actDur >= MINE_HIT_AT) {
          actHit = true;
          if (actCb) { var cb = actCb; actCb = null; cb(); }
        }
        if (actT >= actDur) { actName = null; actCb = null; }
      }
      act = damp(act, actName ? 1 : 0, actName ? 18 : 14, dt);
      var tt = actName ? actT / actDur : 1;
      var wind = ease(seg(tt, 0.0, 0.42));
      var hit = ease(seg(tt, 0.5, 0.62));
      var back = ease(seg(tt, 0.68, 1.0));
      var raise = wind * (1 - hit);
      var strike = hit * (1 - back);

      /* jambes (marche / course) */
      var thL = -s * amp * B;
      var thR = s * amp * B;
      var knL = (0.06 + Math.max(0, c) * kneeSwing) * B;
      var knR = (0.06 + Math.max(0, -c) * kneeSwing) * B;

      // posture accroupie pendant la frappe
      var sq = act * strike * (1 - 0.7 * B); // moins accroupi si le joueur continue de marcher
      thL += -0.55 * sq - 0.12 * act * raise;
      thR += -0.4 * sq - 0.12 * act * raise;
      knL += 1.0 * sq + 0.2 * act * raise;
      knR += 0.8 * sq + 0.2 * act * raise;

      legL.thigh.rotation.x = thL;
      legR.thigh.rotation.x = thR;
      legL.shin.rotation.x = knL;
      legR.shin.rotation.x = knR;
      // pied qui reste à plat + léger décollement du talon
      legL.ankle.rotation.x = -(thL + knL) * 0.88 + Math.max(0, thL) * 0.25 * B;
      legR.ankle.rotation.x = -(thR + knR) * 0.88 + Math.max(0, thR) * 0.25 * B;

      // le bassin se place pour que le pied d'appui touche toujours le sol
      var ext = Math.max(legExtent(thL, knL), legExtent(thR, knR));
      var hipsY = ANKLE_H + ext + 0.02;
      // en course, le corps a une phase de vol : on atténue la chute du bassin
      var flight = 1 - 0.5 * clamp((v - 1.8) / 2.5, 0, 1);
      hipsY = HIPS_REST - (HIPS_REST - hipsY) * flight;

      /* respiration et repos */
      var breath = Math.sin(time * 1.9);
      var shift = Math.sin(time * 0.65);
      hips.position.y = hipsY;
      hips.position.x = (Math.sin(phase) * 0.014 * B) + shift * 0.011 * idle;
      hips.rotation.y = -s * twist * B * 0.55 + (-0.5 * act * raise + 0.35 * act * strike);
      hips.rotation.z = shift * 0.018 * idle;

      torso.rotation.y = s * twist * B * 0.9 + (0.5 * act * raise - 0.45 * act * strike);
      torso.rotation.x = lean * B + act * (-0.14 * raise + 0.5 * strike);
      torso.rotation.z = -shift * 0.012 * idle;
      torsoMesh.scale.set(1 + breath * 0.008 * idle, 1 + breath * 0.006 * idle, DEPTH * (1 + breath * 0.016 * idle));

      /* bras */
      var aL = s * armAmp * B;
      var aR = -s * armAmp * B;
      var eL = -(0.13 + elbowBase * B + Math.max(0, -aL) * 0.35);
      var eR = -(0.13 + elbowBase * B + Math.max(0, -aR) * 0.35);

      var mineR = -2.35 * raise - 0.55 * strike;
      var mineEl = -1.0 * raise - 0.15 * strike;
      var mineL = 0.35 * raise - 0.7 * strike;

      armR.shoulder.rotation.x = lerp(aR, mineR, act);
      armR.elbow.rotation.x = lerp(eR, mineEl, act);
      armL.shoulder.rotation.x = lerp(aL, mineL, act);
      armL.elbow.rotation.x = lerp(eL, -0.5, act);
      armL.shoulder.rotation.z = 0.07 + 0.24 * act + breath * 0.004 * idle;
      armR.shoulder.rotation.z = -0.07 - 0.1 * act - breath * 0.004 * idle;
      armR.shoulder.rotation.y = -0.1 * act * raise;
      armL.elbow.rotation.z = 0.0;
      // les mains se referment légèrement en marche
      var curlWalk = -B * 0.25;
      armL.hand.userData.fingers.rotation.x = curlWalk;
      armR.hand.userData.fingers.rotation.x = curlWalk;

      /* outil visible seulement pendant l'action */
      var holding = act > 0.08 && (actName !== null || act > 0.2);
      pickHand.visible = holding;
      pickBack.visible = !holding;
      armR.hand.userData.fingers.visible = !holding;
      armR.hand.userData.grip.visible = holding;

      /* tête : stabilisation + regard */
      var lookY = (Math.sin(time * 0.42) * 0.2 + Math.sin(time * 0.17 + 1.3) * 0.13) * idle * (1 - act);
      var lookX = Math.sin(time * 0.31 + 0.6) * 0.045 * idle;
      headRig.rotation.y = lookY - (torso.rotation.y + hips.rotation.y) * 0.75;
      headRig.rotation.x = lookX - torso.rotation.x * 0.7 + 0.04 * B + act * (0.14 * strike - 0.1 * raise);
      headRig.rotation.z = -hips.rotation.z * 0.5;

      /* clignement */
      blinkClock += dt;
      if (blinkProg < 0 && blinkClock > nextBlink) {
        blinkProg = 0;
        blinkClock = 0;
        nextBlink = 1.8 + Math.random() * 3.6;
      }
      var lid = 1;
      if (blinkProg >= 0) {
        blinkProg += dt / 0.16;
        lid = 1 - Math.sin(Math.min(blinkProg, 1) * Math.PI) * 0.94;
        if (blinkProg >= 1) blinkProg = -1;
      }
      eyes.scale.y = lid;

      /* détails vivants */
      ledMat.emissiveIntensity = 1.2 + Math.sin(time * 3.6) * 0.7;

      /* sac de minerai porté */
      oreSack.visible = carrying > 0;
      if (carrying > 0) {
        var sc = 0.62 + 0.1 * Math.min(carrying, 5);
        oreSack.scale.setScalar(sc);
        oreSack.position.y = 0.47 + (sc - 0.62) * 0.12;
      }
    }

    function play(name, onHit, duration) {
      if (actName) return false;
      if (name !== "mine") return false;
      actName = "mine";
      actT = 0;
      actDur = duration || MINE_DURATION;
      actHit = false;
      actCb = onHit || null;
      return true;
    }

    function dispose() {
      root.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
    }

    update(0.016, false, 0);

    return {
      root: root,
      update: update,
      play: play,
      isBusy: function () { return actName !== null; },
      setCarrying: function (n) { carrying = n; },
      dispose: dispose,
      parts: { hips: hips, torso: torso, legL: legL, legR: legR, armL: armL, armR: armR, headRig: headRig },
    };
  }