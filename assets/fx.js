/* NPT effects, both drawn with three.js (assets/vendor/three.min.js, loaded once the page is on screen):
   1. the brushed-gold PT monogram in the hero, turning in every direction and spun by drag;
   2. the gold-dust monogram behind the whole page: thousands of dots that breathe, scatter into dust while
      reading and gather again at the contact section; the cursor (or a finger) pushes them aside. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  if (root.classList.contains('capture')) return;                 // film capture: the still images stay
  var Q = new URLSearchParams(location.search);
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var FINE = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var THREE_SRC = (window.NPT_ASSETS || 'assets/') + 'vendor/three.min.js';

  // the monogram, traced from the logo artwork: height 2 (y up), centred
  var LOGO = 'M-0.2735-0.9973C-0.2390-0.9898-0.2076-0.9764-0.1787-0.9571C-0.1743-0.9542-0.1705-0.9515-0.1702-0.9512C-0.1699-0.9508-0.1673-0.9487-0.1644-0.9464C-0.1574-0.9408-0.1358-0.9192-0.1299-0.9119C-0.1273-0.9087-0.1250-0.9058-0.1246-0.9055C-0.1228-0.9038-0.1085-0.8827-0.1052-0.8769C-0.0881-0.8464-0.0750-0.8099-0.0701-0.7790C-0.0667-0.7579-0.0664-0.7163-0.0665-0.2317C-0.0665 0.1102-0.0661 0.2579-0.0653 0.2668C-0.0617 0.3071-0.0555 0.3335-0.0428 0.3627C-0.0258 0.4019-0.0099 0.4257 0.0178 0.4534C0.0435 0.4791 0.0692 0.4959 0.1044 0.5099C0.1287 0.5195 0.1418 0.5232 0.1657 0.5268C0.1922 0.5309 0.1964 0.5312 0.2205 0.5312C0.2426 0.5312 0.2500 0.5307 0.2796 0.5271C0.3047 0.5240 0.3364 0.5145 0.3589 0.5034C0.3710 0.4974 0.3966 0.4814 0.4083 0.4726C0.4824 0.4166 0.5271 0.3277 0.5269 0.2363C0.5269 0.2227 0.5262 0.2138 0.5227 0.1870C0.5154 0.1306 0.4758 0.0610 0.4284 0.0215C0.4246 0.0183 0.4213 0.0155 0.4210 0.0151C0.4195 0.0135 0.4023 0.0009 0.3935-0.0049C0.3781-0.0151 0.3525-0.0276 0.3337-0.0342C0.3207-0.0387 0.3196-0.0379 0.3181-0.0234C0.3175-0.0169 0.3171 0.0732 0.3171 0.2154C0.3171 0.3756 0.3168 0.4459 0.3160 0.4511C0.3147 0.4592 0.3123 0.4636 0.3078 0.4659C0.3039 0.4679 0.2805 0.4736 0.2695 0.4751C0.2577 0.4768 0.2164 0.4768 0.2049 0.4752C0.1614 0.4688 0.1166 0.4486 0.0797 0.4188C0.0700 0.4109 0.0635 0.4042 0.0609 0.3992C0.0573 0.3921 0.0572 0.3878 0.0571 0.0523C0.0571-0.2093 0.0568-0.2794 0.0557-0.2857C0.0550-0.2901 0.0534-0.2999 0.0522-0.3074C0.0496-0.3233 0.0454-0.3400 0.0402-0.3551C0.0371-0.3643 0.0346-0.3701 0.0260-0.3885C0.0227-0.3957 0.0158-0.4070 0.0081-0.4179C-0.0009-0.4308-0.0015-0.4326-0.0028-0.4494C-0.0044-0.4710-0.0054-0.7272-0.0039-0.7328C-0.0022-0.7391-0.0001-0.7413 0.0043-0.7413C0.0106-0.7413 0.0315-0.7326 0.0459-0.7240C0.0571-0.7174 0.0964-0.6909 0.0989-0.6883C0.0992-0.6880 0.1044-0.6838 0.1106-0.6788C0.1167-0.6739 0.1219-0.6696 0.1222-0.6693C0.1225-0.6690 0.1273-0.6647 0.1328-0.6598C0.1454-0.6486 0.1763-0.6178 0.1875-0.6052C0.2222-0.5661 0.2483-0.5252 0.2703-0.4753C0.2915-0.4272 0.3033-0.3864 0.3129-0.3276C0.3142-0.3200 0.3160-0.3124 0.3170-0.3106C0.3188-0.3076 0.3193-0.3074 0.3279-0.3067C0.3328-0.3063 0.3411-0.3049 0.3462-0.3037C0.3559-0.3015 0.3979-0.2896 0.4022-0.2879C0.4035-0.2874 0.4072-0.2860 0.4104-0.2848C0.4434-0.2729 0.4894-0.2516 0.5116-0.2380C0.5327-0.2251 0.5708-0.1983 0.5805-0.1896C0.5816-0.1886 0.5862-0.1846 0.5905-0.1809C0.6026-0.1704 0.6399-0.1329 0.6500-0.1209C0.6686-0.0990 0.6906-0.0685 0.7038-0.0465C0.7054-0.0438 0.7088-0.0381 0.7113-0.0341C0.7250-0.0118 0.7487 0.0400 0.7559 0.0634C0.7571 0.0675 0.7588 0.0727 0.7595 0.0751C0.7920 0.1758 0.7953 0.2805 0.7694 0.3871C0.7600 0.4260 0.7369 0.4828 0.7163 0.5179C0.7038 0.5393 0.6811 0.5723 0.6680 0.5883C0.6429 0.6190 0.6092 0.6527 0.5825 0.6738C0.5802 0.6757 0.5747 0.6800 0.5704 0.6835C0.5599 0.6917 0.5331 0.7096 0.5164 0.7195C0.4659 0.7493 0.3950 0.7752 0.3386 0.7843C0.3315 0.7855 0.3247 0.7869 0.3236 0.7876C0.3187 0.7902 0.3188 0.7879 0.3182 0.8931C0.3177 0.9855 0.3176 0.9929 0.3158 0.9955C0.3133 0.9994 0.3089 1.0000 0.2919 0.9986C0.2689 0.9966 0.2562 0.9943 0.2340 0.9881C0.1886 0.9754 0.1388 0.9414 0.1103 0.9034C0.0862 0.8713 0.0724 0.8354 0.0639 0.7834C0.0632 0.7790 0.0619 0.7741 0.0611 0.7724C0.0594 0.7691 0.0591 0.7689 0.0390 0.7622C0.0208 0.7560-0.0029 0.7457-0.0269 0.7335C-0.0610 0.7161-0.0806 0.7037-0.1125 0.6797C-0.1160 0.6770-0.1191 0.6746-0.1194 0.6742C-0.1196 0.6739-0.1220 0.6720-0.1247 0.6700C-0.1273 0.6680-0.1300 0.6658-0.1306 0.6652C-0.1313 0.6646-0.1352 0.6613-0.1393 0.6578C-0.1504 0.6483-0.1834 0.6147-0.1929 0.6032C-0.1975 0.5977-0.2023 0.5919-0.2036 0.5904C-0.2143 0.5780-0.2420 0.5379-0.2525 0.5194C-0.2770 0.4763-0.2980 0.4236-0.3089 0.3776C-0.3159 0.3480-0.3218 0.3021-0.3233 0.2647C-0.3237 0.2560-0.3241 0.0763-0.3242-0.1345C-0.3244-0.4721-0.3246-0.5180-0.3260-0.5188C-0.3289-0.5207-0.3319-0.5199-0.3499-0.5126C-0.3784-0.5010-0.3950-0.4920-0.4145-0.4773C-0.4426-0.4562-0.4765-0.4203-0.4933-0.3938C-0.5062-0.3735-0.5197-0.3437-0.5254-0.3233C-0.5330-0.2962-0.5350-0.2809-0.5350-0.2476C-0.5351-0.2172-0.5333-0.2004-0.5278-0.1769C-0.5218-0.1515-0.5080-0.1187-0.4936-0.0955C-0.4886-0.0875-0.4763-0.0703-0.4744-0.0685C-0.4740-0.0682-0.4707-0.0644-0.4669-0.0600C-0.4582-0.0500-0.4471-0.0388-0.4383-0.0314C-0.4345-0.0282-0.4311-0.0253-0.4309-0.0250C-0.4294-0.0233-0.4152-0.0129-0.4053-0.0063C-0.3920 0.0026-0.3889 0.0060-0.3877 0.0128C-0.3867 0.0192-0.3867 0.2672-0.3878 0.2740C-0.3889 0.2810-0.3911 0.2819-0.4008 0.2797C-0.4378 0.2711-0.4988 0.2436-0.5396 0.2170C-0.5733 0.1951-0.6009 0.1727-0.6306 0.1429C-0.6519 0.1216-0.6545 0.1189-0.6672 0.1037C-0.7003 0.0640-0.7215 0.0315-0.7422-0.0115C-0.7565-0.0412-0.7640-0.0609-0.7730-0.0923C-0.7818-0.1233-0.7846-0.1360-0.7900-0.1715C-0.7905-0.1752-0.7913-0.1798-0.7916-0.1819C-0.7935-0.1943-0.7953-0.2249-0.7953-0.2449C-0.7953-0.2931-0.7902-0.3372-0.7785-0.3895C-0.7716-0.4201-0.7651-0.4404-0.7533-0.4674C-0.7393-0.4998-0.7117-0.5482-0.6950-0.5699C-0.6921-0.5735-0.6872-0.5799-0.6841-0.5840C-0.6668-0.6064-0.6458-0.6306-0.6347-0.6406C-0.6319-0.6432-0.6259-0.6486-0.6216-0.6527C-0.5982-0.6744-0.5584-0.7044-0.5315-0.7207C-0.5050-0.7368-0.4656-0.7551-0.4335-0.7662C-0.4114-0.7739-0.3409-0.7912-0.3317-0.7911C-0.3297-0.7911-0.3276-0.7920-0.3264-0.7933C-0.3245-0.7955-0.3244-0.7979-0.3247-0.8572C-0.3248-0.8911-0.3246-0.9347-0.3241-0.9543C-0.3234-0.9861-0.3231-0.9901-0.3213-0.9930C-0.3174-0.9995-0.3156-1.0000-0.2974-0.9994C-0.2883-0.9991-0.2776-0.9981-0.2735-0.9973Z';

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function eio(u) { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function webglOK() {
    try { var c = doc.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }

  var threeWaiters = null;
  function withThree(cb) {
    if (window.THREE) { cb(); return; }
    if (threeWaiters) { threeWaiters.push(cb); return; }
    threeWaiters = [cb];
    var s = doc.createElement('script');
    s.src = THREE_SRC; s.async = true;
    s.onload = function () { var w = threeWaiters; threeWaiters = []; w.forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('fx:', e); } }); };
    doc.head.appendChild(s);
  }

  // ---------- path -> THREE.Shape ----------
  function logoShape(scale) {
    var tok = LOGO.match(/[MLCZ]|-?\d*\.?\d+/g), i = 0, cmd = 'M', sh = new THREE.Shape();
    function n() { return parseFloat(tok[i++]) * scale; }
    while (i < tok.length) {
      if (/[MLCZ]/.test(tok[i])) { cmd = tok[i++]; if (cmd === 'Z') continue; }
      if (cmd === 'M') sh.moveTo(n(), n());
      else if (cmd === 'L') sh.lineTo(n(), n());
      else if (cmd === 'C') sh.bezierCurveTo(n(), n(), n(), n(), n(), n());
    }
    return sh;
  }

  // smooth the bevel and side walls, keep the flat faces flat and sharp corners sharp
  function creaseNormals(geo, maxAngle) {
    var pos = geo.attributes.position.array, n = pos.length / 3, tri = n / 3;
    var side = new Uint8Array(tri), g = geo.groups;
    if (g && g.length > 1) for (var k = g[1].start / 3; k < (g[1].start + g[1].count) / 3; k++) side[k] = 1;
    else side.fill(1);
    var fn = new Float32Array(tri * 3), i, j;
    for (i = 0; i < tri; i++) {
      var a = i * 9, ax = pos[a + 3] - pos[a], ay = pos[a + 4] - pos[a + 1], az = pos[a + 5] - pos[a + 2],
          bx = pos[a + 6] - pos[a], by = pos[a + 7] - pos[a + 1], bz = pos[a + 8] - pos[a + 2];
      var cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx, l = Math.hypot(cx, cy, cz) || 1;
      fn[i * 3] = cx / l; fn[i * 3 + 1] = cy / l; fn[i * 3 + 2] = cz / l;
    }
    var map = new Map(), key = function (v) { return Math.round(pos[v * 3] * 2e3) + ',' + Math.round(pos[v * 3 + 1] * 2e3) + ',' + Math.round(pos[v * 3 + 2] * 2e3); };
    for (i = 0; i < n; i++) { var t = (i / 3) | 0; if (!side[t]) continue; var kk = key(i), L = map.get(kk); if (!L) map.set(kk, L = []); L.push(t); }
    var out = new Float32Array(n * 3), c = Math.cos(maxAngle);
    for (i = 0; i < n; i++) {
      var f = (i / 3) | 0, nx = fn[f * 3], ny = fn[f * 3 + 1], nz = fn[f * 3 + 2];
      if (side[f]) {
        var list = map.get(key(i)), sx = 0, sy = 0, sz = 0;
        for (j = 0; j < list.length; j++) {
          var o = list[j], ox = fn[o * 3], oy = fn[o * 3 + 1], oz = fn[o * 3 + 2];
          if (ox * nx + oy * ny + oz * nz >= c) { sx += ox; sy += oy; sz += oz; }
        }
        var l2 = Math.hypot(sx, sy, sz) || 1; nx = sx / l2; ny = sy / l2; nz = sz / l2;
      }
      out[i * 3] = nx; out[i * 3 + 1] = ny; out[i * 3 + 2] = nz;
    }
    geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  }

  // a dark photo studio with soft boxes: gives the metal its bright bands and deep shadows
  function studioEnv(renderer, T) {
    T = T || {};
    var sc = new THREE.Scene(), k0 = T.envK || 1;
    // the room itself (a coloured scene.background does not survive the RGBE pass in r128)
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: T.bg != null ? T.bg : 0x1a130a, side: THREE.BackSide })));
    function box(w, h, col, k, x, y, z) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k * k0), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);
    }
    var B = T.boxes || [
      [8, 6, 0xfff4e4, 3.4, -2.5, 2.5, 9],        // big soft box, front left
      [7, 5, 0xffe9c8, 2.6, 5, 0, 7],             // warm soft box, front right
      [5, 4, 0xfff1dc, 2.2, 0, 0, 10],            // behind the camera: keeps the face gold when it looks straight at us
      [12, 2.4, 0xffffff, 3.5, 0, 8, 2],          // top strip
      [1.2, 12, 0xffffff, 5.0, -7, 0, 3],         // left strip
      [1.0, 10, 0xffd59a, 4.0, 7, 0, -1],         // warm rim on the right
      [16, 6, 0x3a2810, 0.6, 0, -7, 2]];          // warm floor bounce
    B.forEach(function (b) { box.apply(null, b); });
    var pm = new THREE.PMREMGenerator(renderer);
    var tex = pm.fromScene(sc, T.sigma != null ? T.sigma : 0.02).texture;
    pm.dispose();
    return tex;
  }

  function brushedTexture() {
    var c = doc.createElement('canvas'); c.width = c.height = 512;
    var g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 2600; i++) {
      var y = Math.random() * 512, v = 100 + Math.random() * 56 | 0, w = 40 + Math.random() * 380, x = Math.random() * 512;
      g.strokeStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (0.25 + Math.random() * 0.5).toFixed(2) + ')';
      g.lineWidth = 0.6 + Math.random() * 0.9;
      g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke();
      if (x + w / 2 > 512) { g.beginPath(); g.moveTo(x - w / 2 - 512, y); g.lineTo(x + w / 2 - 512, y); g.stroke(); }
      if (x - w / 2 < 0) { g.beginPath(); g.moveTo(x - w / 2 + 512, y); g.lineTo(x + w / 2 + 512, y); g.stroke(); }
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.9, 0.9); t.rotation = -0.55; t.anisotropy = 4;
    return t;
  }

  // ======================================================================================
  // 1. the 3D monogram
  // ======================================================================================
  var POSE0 = 1.15;                         // film seconds the still image was rendered at
  function autoPose(t) {
    var yaw = 0.92 * Math.sin(t * 0.45), pitch = 0.4 * Math.sin(t * 0.31 + 0.6), roll = 0.1 * Math.sin(t * 0.23 + 0.4);
    var cyc = (t - POSE0) % 15, spin = cyc > 12.6 ? eio((cyc - 12.6) / 2.4) * Math.PI * 2 : 0;   // a full turn now and then
    return [yaw + spin, pitch, roll];
  }

  function Logo3D(host, opts) {
    opts = opts || {};
    var canvas = doc.createElement('canvas');
    canvas.className = 'logo3d-gl';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!opts.still });
    } catch (e) { canvas.remove(); return null; }
    renderer.setPixelRatio(opts.dpr || Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    var T = opts.tune || {};
    renderer.toneMapping = T.tm === 'none' ? THREE.NoToneMapping : T.tm === 'rein' ? THREE.ReinhardToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = T.expo || 1.12;
    var scene = new THREE.Scene();
    scene.environment = studioEnv(renderer, T);
    var cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    cam.position.set(0, 0, 6.6);

    var geo = new THREE.ExtrudeGeometry(logoShape(1), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.055, bevelSize: 0.034, bevelOffset: -0.008, bevelSegments: 5, curveSegments: 7, steps: 1 });
    geo.translate(0, 0, -0.1);
    creaseNormals(geo, 52 * Math.PI / 180);
    var mat = new THREE.MeshStandardMaterial({ color: T.col ? new THREE.Color(T.col[0], T.col[1], T.col[2]) : new THREE.Color(1.0, 0.76, 0.36), metalness: 1, roughness: T.rough || 0.27,
      bumpMap: brushedTexture(), bumpScale: T.bump || 0.0022, envMapIntensity: T.envI || 1.2 });
    var mesh = new THREE.Mesh(geo, mat);
    var pivot = new THREE.Group();
    pivot.add(mesh);
    scene.add(pivot);
    var key = new THREE.DirectionalLight(0xfff1d6, 1.1); key.position.set(2.5, 3, 5); scene.add(key);

    // drag to spin, with inertia; the auto motion takes over again afterwards
    var off = [0, 0], vel = [0, 0], drag = null, look = [0, 0], lookT = [0, 0];
    if (!opts.still) {
      canvas.style.touchAction = 'pan-y';
      canvas.addEventListener('pointerdown', function (e) {
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
        try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
        host.classList.add('grab');
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var now = performance.now(), dt = Math.max(8, now - drag.t), dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        off[0] += dx * 0.012; off[1] += dy * 0.009;
        vel[0] = dx * 0.012 / dt * 1000; vel[1] = dy * 0.009 / dt * 1000;
        drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
      });
      var end = function (e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; host.classList.remove('grab'); };
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end);
      if (FINE) window.addEventListener('pointermove', function (e) {
        lookT[0] = (e.clientX / window.innerWidth - 0.5) * 0.5; lookT[1] = (e.clientY / window.innerHeight - 0.5) * 0.35;
      }, { passive: true });
    }

    var W = 0, H = 0;
    function size() {
      var r = host.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
      if (w === W && h === H) return;
      W = w; H = h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    var clock = POSE0, last = 0, running = false, raf = 0;
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      clock += dt;
      if (!drag) {
        for (var i = 0; i < 2; i++) {
          off[i] += vel[i] * dt; vel[i] *= Math.exp(-dt * 2.6);
          if (Math.abs(vel[i]) < 0.6) off[i] += (0 - off[i]) * (1 - Math.exp(-dt * 1.6));
        }
        if (Math.abs(off[0]) > Math.PI) off[0] -= Math.sign(off[0]) * 2 * Math.PI;
      }
      look[0] += (lookT[0] - look[0]) * (1 - Math.exp(-dt * 3)); look[1] += (lookT[1] - look[1]) * (1 - Math.exp(-dt * 3));
      draw(clock);
      if (running) raf = requestAnimationFrame(frame);
    }
    function draw(t, pose) {
      size();
      var p = pose || autoPose(t);
      pivot.rotation.set(p[1] + off[1] + look[1], p[0] + off[0] + look[0], p[2], 'YXZ');
      mesh.position.y = pose ? 0 : Math.sin(t * 0.9) * 0.035;
      renderer.render(scene, cam);
    }
    function start() { if (running) return; running = true; last = 0; if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    return { canvas: canvas, renderer: renderer, draw: draw, start: start, stop: stop, size: size };
  }

  // ======================================================================================
  // 2. the gold-dust monogram behind the page
  // ======================================================================================
  // a cheap smooth flow field (a few nested sines instead of simplex noise: thousands of dots, phones included)
  var FLOW = [
    'vec3 flow3(vec3 p, float t){',
    '  return vec3(sin(p.y * 1.7 + t * 0.9 + sin(p.z * 1.3 + t * 0.5) * 1.2),',
    '              sin(p.z * 1.9 - t * 0.7 + sin(p.x * 1.1 - t * 0.3) * 1.2),',
    '              sin(p.x * 1.5 + t * 0.6 + sin(p.y * 1.4 - t * 0.4) * 1.2));',
    '}'
  ].join('\n');

  var DUST_VS = [
    'uniform float uTime, uForm, uDis, uScroll, uAspect, uPx, uAlpha, uDustA, uDustShare;',
    'uniform mat4 uLogo;',
    'uniform vec2 uHalf;',
    'uniform vec3 uTrail[8];',
    'attribute vec3 aDust;',
    'attribute vec4 aRnd;',
    'attribute vec3 aNorm;',
    'varying float vA;',
    'varying float vGlow;',
    'varying float vTone;',
    'varying float vSoft;',
    FLOW,
    'void main(){',
    // aRnd.w: when this dot arrives / breathes out — a noise cloud over the logo, so whole patches move together
    '  float trig = aRnd.w;',
    '  float f = smoothstep(trig * 0.45, trig * 0.45 + 0.55, uForm);',
    '  float d = smoothstep(trig * 0.62, trig * 0.62 + 0.38, uDis);',
    '  vec3 fl = flow3(position * 2.2 + aRnd.xyz * 6.0, uTime);',
    '  vec3 lp = position + fl * 0.016;',
    '  vec3 dir = normalize(aNorm + (aRnd.xyz - 0.5) * 1.4);',
    '  lp += (dir * 0.75 + fl * 0.9) * pow(d, 1.45) * 0.42;',
    '  vec3 home = (uLogo * vec4(lp, 1.0)).xyz;',
    // dust: spread through the whole view, drifting, sliding up as the page scrolls
    '  float dz = mix(-6.0, 3.5, aDust.z);',
    '  float k = (10.0 - dz) / 10.0;',
    '  float yy = fract(aDust.y + uScroll * (0.10 + 0.16 * aDust.z) + uTime * (0.002 + 0.004 * aRnd.y)) * 2.0 - 1.0;',
    '  vec3 dust = vec3(aDust.x * uHalf.x * 1.08 * k, yy * uHalf.y * 1.12 * k, dz);',
    '  dust += flow3(dust * 0.35 + aRnd.zxy * 4.0, uTime * 0.45) * 0.28;',
    '  float sw = sin(f * 3.14159265);',
    '  vec3 pos = mix(dust, home, f) + fl * sw * 0.8;',
    '  vec4 mv = viewMatrix * vec4(pos, 1.0);',
    '  vec4 cp = projectionMatrix * mv;',
    // the cursor (or a finger) parts the dots; its recent path heals over a second
    '  vec2 ndc = cp.xy / cp.w;',
    '  vec2 push = vec2(0.0);',
    '  for (int i = 0; i < 8; i++) {',
    '    vec3 tr = uTrail[i];',
    '    vec2 dd = (ndc - tr.xy) * vec2(uAspect, 1.0);',
    '    float r2 = dot(dd, dd);',
    '    float kk = tr.z * exp(-r2 / 0.02);',
    '    push += dd / (sqrt(r2) + 1e-4) * kk * 0.075 + vec2(-dd.y, dd.x) * kk * 0.5;',
    '  }',
    '  ndc += push / vec2(uAspect, 1.0);',
    '  cp.xy = ndc * cp.w;',
    '  gl_Position = cp;',
    '  vGlow = sw + sin(d * 3.14159265) * 0.7 + clamp(length(push) * 12.0, 0.0, 1.0);',
    '  float tw = 0.78 + 0.34 * sin(uTime * 3.2 + aRnd.y * 40.0);',
    // once scattered the dots go soft and out of focus (bigger, fainter blobs) so the page sits on top
    '  vSoft = 1.0 - smoothstep(0.0, 0.6, f);',
    '  gl_PointSize = uPx * (0.6 + aRnd.z * 0.8) * (1.0 + vGlow * 0.35) * (1.0 + vSoft * 1.9) * (10.0 / -mv.z);',
    '  float aF = (0.62 + aRnd.x * 0.38) * (1.0 - smoothstep(0.62, 1.0, d));',
    '  float aD = uDustA * step(aRnd.y, uDustShare) * (0.35 + aRnd.x * 0.65) * 0.55;',
    '  vA = uAlpha * tw * mix(aD, aF, f);',
    '  vTone = aRnd.z;',
    '}'
  ].join('\n');

  var DUST_FS = [
    'uniform vec3 uColA, uColB, uColHi;',
    'varying float vA;',
    'varying float vGlow;',
    'varying float vTone;',
    'varying float vSoft;',
    'void main(){',
    '  vec2 uv = gl_PointCoord - 0.5;',
    '  float r = length(uv);',
    '  if (r > 0.5 || vA < 0.004) discard;',
    '  float a = mix(smoothstep(0.5, 0.1, r), exp(-r * r * 16.0) * (1.0 - smoothstep(0.42, 0.5, r)), vSoft) * vA;',
    '  vec3 c = mix(uColA, uColB, vTone);',
    '  c = mix(c, uColHi, clamp(vGlow * 0.45, 0.0, 1.0));',
    '  gl_FragColor = vec4(c * a, a);',
    '}'
  ].join('\n');

  // smooth value noise for the dissolve pattern (computed once per dot)
  function vnoise3(x, y, z) {
    function h(i, j, k) { var n = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); }
    function sm(t) { return t * t * (3 - 2 * t); }
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
    function L(a, b, t) { return a + (b - a) * t; }
    return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), xf), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), xf), yf),
             L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), xf), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), xf), yf), zf);
  }

  // dots on the monogram: filled area plus a share on the outline so the shape reads crisply
  function sampleLogo(N, depth) {
    var W = 320, H = 400, c = doc.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d'), s = H / 2 * 0.96;
    g.setTransform(s, 0, 0, -s, W / 2, H / 2);
    g.fillStyle = '#fff';
    g.fill(new Path2D(LOGO));
    var px = g.getImageData(0, 0, W, H).data, fill = [], edge = [], x, y;
    for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) {
      var i = y * W + x;
      if (px[i * 4 + 3] < 128) continue;
      fill.push(i);
      if (px[(i - 1) * 4 + 3] < 128 || px[(i + 1) * 4 + 3] < 128 || px[(i - W) * 4 + 3] < 128 || px[(i + W) * 4 + 3] < 128) edge.push(i);
    }
    var home = new Float32Array(N * 3), norm = new Float32Array(N * 3);
    for (var k = 0; k < N; k++) {
      var src = (edge.length && Math.random() < 0.24) ? edge : fill, idx = src[Math.random() * src.length | 0];
      var X = ((idx % W) + Math.random() - W / 2) / s, Y = (H / 2 - ((idx / W) | 0) - Math.random()) / s, Z = (Math.random() - 0.5) * depth;
      home[k * 3] = X; home[k * 3 + 1] = Y; home[k * 3 + 2] = Z;
      norm[k * 3] = X * 0.4; norm[k * 3 + 1] = Y * 0.4; norm[k * 3 + 2] = Z >= 0 ? 1 : -1;
    }
    return { home: home, norm: norm };
  }

  function ParticleField(site) {
    var canvas = doc.createElement('canvas');
    canvas.className = 'fx-dust';
    canvas.setAttribute('aria-hidden', 'true');
    site.insertBefore(canvas, site.firstChild);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' }); }
    catch (e) { canvas.remove(); return null; }
    var dpr = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    cam.position.set(0, 0, 10);
    var HH = 10 * Math.tan(17.5 * Math.PI / 180);           // half height of the view at z = 0
    var N = +(Q.get('dots') || (MOBILE ? 7000 : window.innerWidth < 1100 ? 11000 : 18000));
    var L = sampleLogo(N, 0.14), dust = new Float32Array(N * 3), rnd = new Float32Array(N * 4), i;
    for (i = 0; i < N; i++) {
      dust[i * 3] = Math.random() * 2 - 1; dust[i * 3 + 1] = Math.random(); dust[i * 3 + 2] = Math.random();
      var r0 = Math.random(), hx = L.home[i * 3] * 2.2, hy = L.home[i * 3 + 1] * 2.2, hz = L.home[i * 3 + 2] * 2.2;
      var nz = 0.65 * vnoise3(hx + 3.1, hy + 7.3, hz) + 0.35 * vnoise3(hx * 2.1 + 11, hy * 2.1, hz * 2.1 + 5);
      rnd[i * 4] = r0; rnd[i * 4 + 1] = Math.random(); rnd[i * 4 + 2] = Math.random();
      rnd[i * 4 + 3] = Math.min(1, Math.max(0, (nz - 0.5) * 1.6 + 0.5)) * 0.7 + r0 * 0.3;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(L.home, 3));
    geo.setAttribute('aNorm', new THREE.BufferAttribute(L.norm, 3));
    geo.setAttribute('aDust', new THREE.BufferAttribute(dust, 3));
    geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    var trail = [];
    for (i = 0; i < 8; i++) trail.push(new THREE.Vector3(9, 9, 0));
    var U = {
      uTime: { value: 0 }, uForm: { value: 0 }, uDis: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: 1 },
      uPx: { value: 2.3 * dpr }, uAlpha: { value: 0 }, uDustA: { value: 0.55 }, uDustShare: { value: MOBILE ? 0.4 : 0.34 },
      uLogo: { value: new THREE.Matrix4() }, uHalf: { value: new THREE.Vector2(1, 1) }, uTrail: { value: trail },
      uColA: { value: new THREE.Color(0.70, 0.50, 0.17) }, uColB: { value: new THREE.Color(0.52, 0.38, 0.19) }, uColHi: { value: new THREE.Color(0.93, 0.74, 0.32) }
    };
    var mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: DUST_VS, fragmentShader: DUST_FS, transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.NormalBlending, premultipliedAlpha: true });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);

    // ---- pointer / finger wake ----
    var ptr = { x: 9, y: 9, lx: 9, ly: 9, on: false, hx: 0, hy: 0 }, head = 0, Wc = 1, Hc = 1;
    function setPtr(cx, cy) { ptr.x = cx / Wc * 2 - 1; ptr.y = 1 - cy / Hc * 2; ptr.on = true; ptr.hx = cx / Wc - 0.5; ptr.hy = cy / Hc - 0.5; }
    window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setPtr(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (t) { setPtr(t.clientX, t.clientY); ptr.lx = ptr.x; ptr.ly = ptr.y; } }, { passive: true });
    window.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) setPtr(t.clientX, t.clientY); }, { passive: true });
    window.addEventListener('touchend', function () { ptr.on = false; }, { passive: true });
    doc.documentElement.addEventListener('mouseleave', function () { ptr.on = false; });
    function trailStep(dt) {
      for (var j = 0; j < 8; j++) trail[j].z *= Math.exp(-dt * 2.3);
      if (!ptr.on) return;
      var dist = Math.hypot((ptr.x - ptr.lx) * U.uAspect.value, ptr.y - ptr.ly);
      if (dist > 0.04) {
        head = (head + 1) % 8;
        trail[head].set(ptr.x, ptr.y, Math.min(1, 0.6 + dist * 3));
        ptr.lx = ptr.x; ptr.ly = ptr.y;
      } else {
        trail[head].x = ptr.x; trail[head].y = ptr.y;
        trail[head].z = Math.max(trail[head].z, 0.62);              // a resting cursor keeps a little clearing
      }
    }

    // ---- where the monogram stands: around the portrait at the top, beside the closing title at the end ----
    var hero = doc.getElementById('hero'), portrait = doc.querySelector('.hero-portrait'), contact = doc.getElementById('contact');
    var M = U.uLogo.value, P = new THREE.Vector3(), Sv = new THREE.Vector3(), Qt = new THREE.Quaternion(), E = new THREE.Euler();
    var form = 0, reveal = Q.has('fxnow') ? 1 : 0, revealOn = false, clock = 0, look = [0, 0];
    function place(dt) {
      var vw = Wc, vh = Hc, upp = 2 * HH / vh, wide = vw >= 900;
      var hr = hero ? hero.getBoundingClientRect() : { top: -1e4, height: 1 };
      var cr = contact ? contact.getBoundingClientRect() : { top: 1e4, left: 0, width: vw, height: 1 };
      // a slow drift apart over the whole height of the introduction, and a slow gathering at the contact panel
      var fH = 1 - sstep(0.03, 1.0, -hr.top / Math.max(1, hr.height));
      var fC = sstep(1.0, 0.25, cr.top / vh);
      var cx, cy, hpx;
      if (fH >= fC && portrait) {
        var pr = portrait.getBoundingClientRect();
        cx = pr.left + pr.width * (wide ? 0.4 : 0.5); cy = pr.top + pr.height * 0.5; hpx = wide ? Math.min(pr.height * 1.78, vh * 1.02) : Math.max(pr.height * 1.5, vw * 1.08);
      } else if (wide) {
        cx = cr.left + cr.width * 0.81; cy = cr.top + Math.min(cr.height * 0.4, 330); hpx = Math.min(vh * 0.66, 560);
      } else {
        cx = cr.left + cr.width * 0.64; cy = cr.top + 400; hpx = Math.min(vw * 1.08, 440);
      }
      var target = Math.max(fH, fC) * eio(reveal);
      form += (target - form) * (Q.has('fxnow') ? 1 : 1 - Math.exp(-dt * 1.5));
      U.uForm.value = form;
      look[0] += (ptr.hx - look[0]) * (1 - Math.exp(-dt * 2)); look[1] += (ptr.hy - look[1]) * (1 - Math.exp(-dt * 2));
      E.set(0.08 * Math.sin(clock * 0.15 + 1) - look[1] * 0.2, 0.3 * Math.sin(clock * 0.19) + look[0] * 0.35, 0.03 * Math.sin(clock * 0.11), 'YXZ');
      Qt.setFromEuler(E);
      P.set((cx - vw / 2) * upp, -(cy - vh / 2) * upp, 0);
      var sc = hpx * upp / 2;
      Sv.set(sc, sc, sc);
      M.compose(P, Qt, Sv);
      U.uScroll.value = (window.scrollY || 0) / vh;
    }

    function size() {
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      if (Math.abs(w - Wc) < 1 && Math.abs(h - Hc) < 140 && Wc > 1) return;
      Wc = w; Hc = h;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      U.uAspect.value = w / h; U.uHalf.value.set(HH * w / h, HH);
    }

    var running = false, raf = 0, last = 0, lastDraw = 0, minGap = MOBILE ? 38 : 0, intro = doc.getElementById('intro'), lb = doc.getElementById('lb');
    function frame(now) {
      raf = 0;
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (minGap && now - lastDraw < minGap) return;
      var dt = last ? Math.min(0.06, (now - last) / 1000) : 0.016;
      last = now; lastDraw = now;
      if (lb && !lb.hidden) return;                                     // the lightbox covers everything
      if (intro && intro.getBoundingClientRect().bottom > Hc * 0.9) return;   // still on the intro film
      clock += dt;
      if (revealOn && reveal < 1) reveal = Math.min(1, reveal + dt / 2.4);
      U.uTime.value = clock;
      U.uAlpha.value = sstep(0, 0.3, reveal);
      U.uDis.value = (0.5 - 0.5 * Math.cos(clock * 0.5)) * 0.4;
      size();
      trailStep(dt);
      place(dt);
      renderer.render(scene, cam);
    }
    function start() { if (running) return; running = true; last = 0; if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    size();
    return { start: start, stop: stop, show: function () { revealOn = true; }, canvas: canvas, U: U, state: function () { return { running: running, reveal: reveal, form: form, Wc: Wc, Hc: Hc, clock: clock }; } };
  }

  window.NPTfx = { withThree: withThree, Logo3D: Logo3D, ParticleField: ParticleField, autoPose: autoPose, POSE0: POSE0 };

  // ---------- start both once the visitor reaches the page (after the intro film) ----------
  // start once the visitor has reached the page and the scroll has come to rest (the intro film glides down to it),
  // so the set-up work never lands in the middle of that glide; three.js is fetched as soon as the glide begins
  function preloadThree() { withThree(function () {}); }   // fetch (and parse off the main thread) as the glide begins

  function whenSiteShown(cb) {
    var intro = doc.getElementById('intro'), done = false, t = 0;
    function onSite() { return !intro || intro.getBoundingClientRect().bottom < window.innerHeight * 0.6; }
    function fire() { if (done) return; done = true; window.removeEventListener('scroll', chk); cb(); }
    function chk() {
      clearTimeout(t);
      if (onSite()) preloadThree();
      t = setTimeout(function () { if (onSite()) fire(); }, 280);
    }
    window.addEventListener('scroll', chk, { passive: true });
    window.addEventListener('npt:site', preloadThree);
    chk();
  }

  function initLogos() {
    var hosts = doc.querySelectorAll('[data-logo3d]');
    if (!hosts.length) return;
    withThree(function () {
      Array.prototype.forEach.call(hosts, function (host) {
        var Lg = Logo3D(host);
        if (!Lg) return;
        Lg.draw(POSE0);
        host.classList.add('live');
        var vis = false, shown = !doc.hidden;
        var go = function () { if (vis && shown) Lg.start(); else Lg.stop(); };
        if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; go(); }, { rootMargin: '80px' }).observe(host);
        else vis = true;
        doc.addEventListener('visibilitychange', function () { shown = !doc.hidden; go(); });
        window.addEventListener('resize', function () { Lg.size(); });
        go();
      });
    });
  }

  function initDust() {
    var site = doc.getElementById('site');
    if (!site || !window.Path2D) return;
    withThree(function () {
      var F = ParticleField(site);
      if (!F) return;
      window.NPTfx.dust = F;
      root.classList.add('has-dust');
      var shown = !doc.hidden;
      doc.addEventListener('visibilitychange', function () { shown = !doc.hidden; if (shown) F.start(); else F.stop(); });
      F.show();
      if (shown) F.start();
    });
  }

  function init() {
    if (Q.has('t') || REDUCED || !webglOK()) return;
    whenSiteShown(function () {
      initLogos();
      if (!Q.has('nodust')) withThree(function () { setTimeout(initDust, 120); });   // two shorter tasks instead of one long one
    });
  }
  window.NPTfx.init = init;
  if (!window.NPT_FX_MANUAL) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
  }
})();
