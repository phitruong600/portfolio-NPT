/* NPT intro film: a WebGL2 fly-over of the portfolio page that lands on the title card.
   Every frame is a pure function of time — seek(t). No timers or CSS transitions drive it. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  if (root.classList.contains('capture')) return;
  var intro = doc.getElementById('intro');
  if (!intro) return;

  var Q = new URLSearchParams(location.search);
  var STILL = Q.has('t') ? parseFloat(Q.get('t')) : null;          // render one frame (stills / checks)
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && STILL === null;
  var BASE = 'assets/film/';
  var NOPIECES = Q.get('dbg') === 'nopieces';

  // ---------- small math ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sstep(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function s5(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function eioq(u) { u = clamp(u, 0, 1); return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  function eoc(u) { u = clamp(u, 0, 1); return 1 - Math.pow(1 - u, 3); }
  var DEG = Math.PI / 180;

  // ---------- DOM ----------
  var canvas = doc.getElementById('film');
  var loader = intro.querySelector('.film-loader');
  var badge = intro.querySelector('.badge');
  var closing = intro.querySelector('.closing');
  var slot = intro.querySelector('.slot');
  var btnSkip = doc.getElementById('film-skip'), btnReplay = doc.getElementById('film-replay'), btnDown = doc.getElementById('film-down');
  var words1 = [], words2 = [];
  function splitWords(el, arr) {
    var txt = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    txt.forEach(function (w, i) {
      var s = doc.createElement('span'); s.className = 'w'; s.textContent = w;
      el.appendChild(s); arr.push(s);
      if (i < txt.length - 1) el.appendChild(doc.createTextNode(' '));
    });
  }
  splitWords(closing.querySelector('.l1'), words1);
  splitWords(closing.querySelector('.l2'), words2);

  var DATA = null;          // layers.json
  var LAY = null;           // layout (viewport dependent)
  var heroB = 734;          // page px, replaced from data

  // ---------- end-card layout (DOM) ----------
  function setVar(k, v) { intro.style.setProperty(k, typeof v === 'number' ? v.toFixed(2) + 'px' : v); }
  function layout() {
    var W = intro.clientWidth, Hv = intro.clientHeight;
    var portrait = W / Hv < 0.9;
    var L = { W: W, Hv: Hv, portrait: portrait };
    intro.style.setProperty('--slot-ar', '1440 / ' + heroB.toFixed(2));
    var bTop, bfs, tTop, l1, l2, tW, sTop, sW;
    if (!portrait) {
      var s = Math.min(W / 1440, Hv / 1152);
      var ox = (W - 1440 * s) / 2, oy = (Hv - 1152 * s) / 2;
      L.s = s; L.fs = s;
      bTop = oy + 44 * s; bfs = 21 * s; tTop = oy + 100 * s; l1 = 74 * s; l2 = 82 * s; tW = 1380 * s;
      sTop = oy + 283 * s; sW = 1018 * s;
      setVar('--badge-top', bTop); setVar('--badge-fs', bfs); setVar('--title-top', tTop);
      setVar('--l1-fs', l1); setVar('--l2-fs', l2); setVar('--title-w', tW);
      setVar('--slot-top', sTop); setVar('--slot-w', sW); setVar('--slot-r', 38 * s);
      L.margin = 42 * s;
    } else {
      var side = Math.max(18, W * 0.055);
      sW = W - 2 * side;
      l1 = clamp(W * 0.085, 24, 46); l2 = l1 * 1.12; bfs = clamp(W * 0.042, 13, 18); tW = W - 2 * side;
      setVar('--badge-fs', bfs); setVar('--l1-fs', l1); setVar('--l2-fs', l2); setVar('--title-w', tW); setVar('--slot-w', sW);
      setVar('--slot-r', Math.max(18, sW * 0.035));
      var badgeH = bfs * 2.1, titleH = closing.offsetHeight, slotH = sW * heroB / 1440;
      var g1 = l1 * 0.85, g2 = l1 * 1.05;
      var total = badgeH + g1 + titleH + g2 + slotH;
      var top = Math.max(28, (Hv - total) / 2 - Hv * 0.035);
      bTop = top; tTop = top + badgeH + g1; sTop = tTop + titleH + g2;
      setVar('--badge-top', bTop); setVar('--title-top', tTop); setVar('--slot-top', sTop);
      L.s = Math.min(Hv / 1152, (W / 1440) * 1.5); L.fs = l1 / 74;
      L.margin = Math.max(22, Hv * 0.035);
    }
    var ir = intro.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    L.slot = { x: sr.left - ir.left, y: sr.top - ir.top, w: sr.width, h: sr.height };
    L.f = 1880 * L.s; L.cx = W / 2; L.cy = Hv / 2; L.cyF = portrait ? Hv * 0.4 : Hv / 2;
    LAY = L;
    return L;
  }

  // ---------- hand over to the page: once the closing line has settled, glide down to the site ----------
  var HANDOVER_T = 11.8;          // film seconds
  var handedOver = false;
  function goSite() {
    handedOver = true;
    var site = doc.getElementById('site');
    if (site) site.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  }
  function maybeHandOver() {
    if (handedOver || STILL !== null) return;
    // leave readers who already scrolled on their own where they are
    if ((window.scrollY || root.scrollTop || 0) < intro.offsetHeight * 0.4) goSite(); else handedOver = true;
  }

  // ---------- static fallback (no WebGL2, reduced motion, errors) ----------
  function goStatic(cls) {
    intro.classList.add(cls || 'static');
    layout();
    if (loader) loader.classList.add('done');
    words1.concat(words2).forEach(function (w) { w.style.opacity = 1; w.style.transform = 'none'; w.style.filter = 'none'; });
    badge.style.opacity = 1;
    if (btnDown) btnDown.hidden = false;
    canvas.style.display = 'none';
    window.__filmReady = true;
    if (!REDUCED && STILL === null) setTimeout(maybeHandOver, 2600);
  }

  var gl = null;
  if (REDUCED) { goStatic('static'); window.addEventListener('resize', layout); return; }
  try {
    gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: STILL !== null, powerPreference: 'high-performance' });
  } catch (e) { gl = null; }
  if (!gl) { goStatic('nogl'); window.addEventListener('resize', layout); return; }

  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  var HI = Q.get('q') === 'hi' || (!isMobile && Q.get('q') !== 'lo');
  var TAPS = HI ? 40 : 24;
  var dprCap = isMobile ? 1.5 : 2;
  var renderScale = Math.min(window.devicePixelRatio || 1, dprCap);
  if (Q.has('dpr')) renderScale = parseFloat(Q.get('dpr'));

  // ---------- GL helpers ----------
  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').slice(0, 4).join('\n'));
    return s;
  }
  function prog(vs, fs) {
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }

  var HEAD = '#version 300 es\nprecision highp float;\n';
  var VS_QUAD = HEAD +
    'layout(location=0) in vec2 aP;\n' +
    'uniform vec3 uO, uEu, uEv; uniform vec4 uUV;\n' +
    'uniform vec3 uC, uR, uU, uF; uniform vec4 uK; uniform vec2 uVP;\n' +
    'out vec2 vUV; out float vZ; out vec3 vW;\n' +
    'void main(){ vec3 P=uO+aP.x*uEu+aP.y*uEv; vec3 d=P-uC; float z=dot(d,uF), a=dot(d,uR), b=dot(d,uU);\n' +
    ' float xc=2.0*(uK.y*z+uK.x*a)/uVP.x-z; float yc=z-2.0*(uK.z*z-uK.x*b)/uVP.y;\n' +
    ' gl_Position=vec4(xc,yc,0.0,z); vUV=mix(uUV.xy,uUV.zw,aP); vZ=z; vW=P; }';
  var VS_FULL = HEAD + 'layout(location=0) in vec2 aP; out vec2 vUv; void main(){ vUv=aP*0.5+0.5; gl_Position=vec4(aP,0.0,1.0); }';

  var COMMON = 'uniform float uFocus, uCocS, uCocMax; uniform vec3 uFl0, uFl1; uniform vec2 uRes;\n' +
    'vec3 floorCol(){ vec2 p=gl_FragCoord.xy/uRes-0.5; float r=length(p)/0.7071; return mix(uFl0,uFl1,smoothstep(0.08,1.0,r)); }\n' +
    'float cocOf(float z){ float c = z<uFocus ? -75.0*(uFocus-z)/max(z,1.0) : 6.0*(z-uFocus)/max(z,1.0); return clamp(c,-120.0,120.0)*uCocS; }\n' +
    'vec4 encCoc(float c){ float u=clamp(0.5+0.5*c/uCocMax,0.0,1.0)*255.0; return vec4(floor(u)/255.0, fract(u), 0.0, 1.0); }\n';

  var FS_FLOOR = HEAD + COMMON +
    'uniform vec3 uC, uR, uU, uF; uniform vec4 uK; uniform vec2 uVP;\n' +
    'layout(location=0) out vec4 o0; layout(location=1) out vec4 o1;\n' +
    'void main(){ vec2 px=vec2(gl_FragCoord.x, uRes.y-gl_FragCoord.y)/uRes*uVP;\n' +
    ' vec3 dir=uF+((px.x-uK.y)/uK.x)*uR-((px.y-uK.z)/uK.x)*uU; float z=1.0e6; if(dir.z<-1.0e-5) z=-uC.z/dir.z;\n' +
    ' o0=vec4(floorCol(),1.0); o1=encCoc(cocOf(z)); }';

  var FS_TEX = HEAD + COMMON +
    'in vec2 vUV; in float vZ; in vec3 vW; uniform sampler2D uTex; uniform float uA;\n' +
    'uniform vec4 uMask; uniform float uMaskR, uMaskOn, uHeroB, uFade, uPieceFade, uHaze;\n' +
    'uniform vec4 uTint; uniform vec4 uEdge;\n' +
    'layout(location=0) out vec4 o0; layout(location=1) out vec4 o1;\n' +
    'void main(){ vec4 c = uTint.a>0.5 ? vec4(uTint.rgb,1.0) : texture(uTex,vUV);\n' +
    ' if(uEdge.z>0.0){ float e=min(min(vUV.x,1.0-vUV.x)*uEdge.x, min(vUV.y,1.0-vUV.y)*uEdge.y); c*=clamp(e*uEdge.z,0.0,1.0); }\n' +
    ' float a=c.a*uA; vec3 rgb=c.rgb*uA; vec3 hz=floorCol();\n' +
    ' if(uMaskOn>0.5){ vec2 p=vW.xy; vec2 cen=0.5*(uMask.xy+uMask.zw); vec2 hs=0.5*(uMask.zw-uMask.xy);\n' +
    '  vec2 q=abs(p-cen)-hs+uMaskR; float sd=length(max(q,0.0))+min(max(q.x,q.y),0.0)-uMaskR; float aa=max(fwidth(sd),1e-3);\n' +
    '  float m=1.0-smoothstep(-aa,aa,sd); float below=smoothstep(uHeroB-2.0,uHeroB+6.0,p.y);\n' +
    '  rgb=mix(rgb,hz*a,uFade*below); rgb*=m; a*=m; }\n' +
    ' if(uPieceFade>0.0) rgb=mix(rgb,hz*a,uPieceFade);\n' +
    ' if(uHaze>0.0){ float h=uHaze*smoothstep(1.3,3.4,vZ/uFocus); rgb=mix(rgb,hz*a,h); }\n' +
    ' o0=vec4(rgb,a); float s=step(0.5,a); o1=encCoc(cocOf(vZ))*s; }';

  var FS_SHADOW = HEAD +
    'in vec2 vUV; in float vZ; in vec3 vW; uniform vec4 uRect; uniform float uCorner, uSigma, uOpacity;\n' +
    'layout(location=0) out vec4 o0;\n' +
    'float gauss(float x,float s){ return exp(-(x*x)/(2.0*s*s))/(2.5066283*s); }\n' +
    'vec2 erf2(vec2 x){ vec2 s=sign(x), a=abs(x); x=1.0+(0.278393+(0.230389+0.078108*(a*a))*a)*a; x*=x; return s-s/(x*x); }\n' +
    'float boxX(float x,float y,float sig,float cr,vec2 hs){ float d=min(hs.y-cr-abs(y),0.0); float cv=hs.x-cr+sqrt(max(0.0,cr*cr-d*d));\n' +
    ' vec2 it=0.5+0.5*erf2((x+vec2(-cv,cv))*(0.70710678/sig)); return it.y-it.x; }\n' +
    'void main(){ vec2 lo=uRect.xy, hi=uRect.zw; vec2 cen=(lo+hi)*0.5, hs=(hi-lo)*0.5; vec2 p=vW.xy-cen; float cr=min(uCorner,min(hs.x,hs.y));\n' +
    ' float low=p.y-hs.y, high=p.y+hs.y; float st=clamp(-3.0*uSigma,low,high), en=clamp(3.0*uSigma,low,high); float stp=(en-st)/4.0; float y=st+stp*0.5; float v=0.0;\n' +
    ' for(int i=0;i<4;i++){ v+=boxX(p.x,p.y-y,uSigma,cr,hs)*gauss(y,uSigma)*stp; y+=stp; }\n' +
    ' float a=clamp(v,0.0,1.0)*uOpacity; o0=vec4(vec3(0.29,0.2,0.08)*a,a); }';

  var FS_NEAR_DOWN = HEAD +
    'in vec2 vUv; uniform sampler2D uCoc; uniform vec2 uSrcTexel; out vec4 o;\n' +
    'float dec(vec4 c){ return (c.r+c.g/255.0)*2.0-1.0; }\n' +
    'void main(){ float m=0.0; for(int j=0;j<4;j++) for(int i=0;i<4;i++){ vec2 off=(vec2(float(i),float(j))-1.5)*2.0*uSrcTexel; float c=dec(texture(uCoc,vUv+off)); m=max(m,max(-c,0.0)); } o=vec4(m,0.0,0.0,1.0); }';
  var FS_NEAR_MAX = HEAD +
    'in vec2 vUv; uniform sampler2D uSrc; uniform vec2 uDir; uniform int uK; out vec4 o;\n' +
    'void main(){ float m=texture(uSrc,vUv).r; for(int i=1;i<=48;i++){ if(i>uK) break; float fi=float(i); float fall=1.0-fi/float(uK+1)*0.15;\n' +
    ' m=max(m,texture(uSrc,vUv+uDir*fi).r*fall); m=max(m,texture(uSrc,vUv-uDir*fi).r*fall); } o=vec4(m,0.0,0.0,1.0); }';
  var FS_DOF = HEAD +
    'in vec2 vUv; uniform sampler2D uColor, uCoc, uNear; uniform vec2 uTexel; uniform float uCocMax; uniform int uTaps; out vec4 o;\n' +
    'float dec(vec4 c){ return ((c.r+c.g/255.0)*2.0-1.0)*uCocMax; }\n' +
    'void main(){ vec3 base=textureLod(uColor,vUv,0.0).rgb; float cc=dec(texture(uCoc,vUv)); float R=max(abs(cc), texture(uNear,vUv).r*uCocMax);\n' +
    ' if(R<0.6){ o=vec4(base,1.0); return; }\n' +
    ' float N=float(uTaps); float sp=R*1.7725/sqrt(N); float lod=log2(max(sp*0.9,1.0)); vec3 acc=base; float tot=1.0;\n' +
    ' vec2 q2=mod(floor(gl_FragCoord.xy),2.0); float rnd=(q2.x+2.0*q2.y+0.5)*0.25; float rot=rnd*6.2831853;\n' +
    ' for(int i=0;i<64;i++){ if(i>=uTaps) break; float fi=float(i); float r=R*sqrt((fi+rnd)/N); float th=fi*2.39996323+rot;\n' +
    '  vec2 uv=vUv+vec2(cos(th),sin(th))*r*uTexel; vec3 sc=textureLod(uColor,uv,lod).rgb; float scc=dec(texture(uCoc,uv)); float size=abs(scc);\n' +
    '  if(scc>cc) size=min(size,abs(cc)*2.0); float m=smoothstep(r-sp*0.5,r+sp*0.5,size); acc+=mix(acc/tot,sc,m); tot+=1.0; }\n' +
    ' o=vec4(acc/tot,1.0); }';

  var FS_POST = HEAD +
    'in vec2 vUv; uniform sampler2D uImg, uCoc, uNear; uniform vec2 uTexel; uniform float uCocMax; out vec4 o;\n' +
    'float dec(vec4 c){ return ((c.r+c.g/255.0)*2.0-1.0)*uCocMax; }\n' +
    'void main(){ vec3 c0=texture(uImg,vUv).rgb; float R=max(abs(dec(texture(uCoc,vUv))), texture(uNear,vUv).r*uCocMax);\n' +
    ' if(R<0.6){ o=vec4(c0,1.0); return; }\n' +
    ' o=vec4(texture(uImg,vUv+0.5*uTexel).rgb,1.0); }';

  var P_TEX, P_SH, P_FLOOR, P_ND, P_NM, P_DOF, P_POST;
  try {
    P_TEX = prog(VS_QUAD, FS_TEX); P_SH = prog(VS_QUAD, FS_SHADOW); P_FLOOR = prog(VS_FULL, FS_FLOOR);
    P_ND = prog(VS_FULL, FS_NEAR_DOWN); P_NM = prog(VS_FULL, FS_NEAR_MAX); P_DOF = prog(VS_FULL, FS_DOF); P_POST = prog(VS_FULL, FS_POST);
  } catch (e) { console.warn('film shaders', e); goStatic('nogl'); return; }

  var quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  var fullBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, fullBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var vaoQuad = gl.createVertexArray(); gl.bindVertexArray(vaoQuad); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  var vaoFull = gl.createVertexArray(); gl.bindVertexArray(vaoFull); gl.bindBuffer(gl.ARRAY_BUFFER, fullBuf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  var aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  var maxAniso = aniso ? Math.min(16, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;
  var maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (maxTex < 4096) HI = false;
  var SET = HI ? 2 : 1;

  function texFrom(src) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (maxAniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
    return t;
  }
  function loadImage(url) {
    return new Promise(function (res, rej) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { (im.decode ? im.decode().catch(function () {}) : Promise.resolve()).then(function () { res(im); }); };
      im.onerror = function () { rej(new Error('load ' + url)); };
      im.src = url;
    });
  }

  // ---------- render targets ----------
  var RT = null;
  function makeTex(w, h, mips, linear) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, mips ? Math.floor(Math.log2(Math.max(w, h))) + 1 : 1, gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : (linear ? gl.LINEAR : gl.NEAREST));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear || mips ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function fbo(texs) {
    var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    texs.forEach(function (t, i) { gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0); });
    return f;
  }
  function freeRT() {
    if (!RT) return;
    [RT.color, RT.coc, RT.nA, RT.nB, RT.out].forEach(function (t) { gl.deleteTexture(t); });
    [RT.fScene, RT.fA, RT.fB, RT.fOut].forEach(function (f) { gl.deleteFramebuffer(f); });
    RT = null;
  }
  function buildRT() {
    freeRT();
    var w = Math.max(2, Math.round(LAY.W * renderScale)), h = Math.max(2, Math.round(LAY.Hv * renderScale));
    canvas.width = w; canvas.height = h;
    var color = makeTex(w, h, true, true), coc = makeTex(w, h, false, false);
    var nw = Math.ceil(w / 8), nh = Math.ceil(h / 8);
    var nA = makeTex(nw, nh, false, true), nB = makeTex(nw, nh, false, true);
    var out = makeTex(w, h, false, true);
    RT = { w: w, h: h, nw: nw, nh: nh, color: color, coc: coc, nA: nA, nB: nB, out: out, fScene: fbo([color, coc]), fA: fbo([nA]), fB: fbo([nB]), fOut: fbo([out]) };
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ---------- timeline / camera ----------
  var TL = null;  // solved constants
  function speedFn(c) {
    return function (t) {
      if (t < 0.6) return 0.5 * sstep(0, 0.6, t);
      if (t < 1.25) return 0.5;
      if (t < 1.6) return 0.5 + (c - 0.5) * sstep(1.25, 1.6, t);
      if (t < 7.3) return c;
      if (t < 8.3) return c + (0.12 - c) * sstep(7.3, 8.3, t);
      return 0.12;
    };
  }
  function integrate(sp, V) {
    var dt = 1 / 600, N = Math.ceil(9.8 / dt) + 2, P = new Float64Array(N), acc = 0;
    for (var i = 1; i < N; i++) { var a = (i - 1) * dt, b = i * dt; acc += (sp(a) + 4 * sp((a + b) / 2) + sp(b)) / 6 * dt; P[i] = acc * V; }
    return { P: P, dt: dt };
  }
  function glide(g, t) { var x = clamp(t, 0, 9.7) / g.dt, i = Math.floor(x), f = x - i; return g.P[i] + (g.P[i + 1] - g.P[i]) * f; }
  function riseR(t) {
    var a = 0.6, flat = 0.6, b = 0.3, tot = a * 0.5 + flat + b * 0.5, x;
    if (t <= 7.75) return 0;
    if (t < 8.35) { x = (t - 7.75) / a; return a * (x * x * x - x * x * x * x / 2) / tot; }
    if (t < 8.95) return (a * 0.5 + (t - 8.35)) / tot;
    if (t < 9.25) { x = (t - 8.95) / b; return (a * 0.5 + flat + b * (x - (x * x * x - x * x * x * x / 2))) / tot; }
    return 1;
  }

  function solveTimeline() {
    var d = DATA, m = d.marks, H = d.H;
    var yS2 = m.s2Title.y + m.s2Title.h / 2, yFt = m.footerTitle.y + m.footerTitle.h / 2;
    var V = 770, c = 1, g, k;
    for (k = 0; k < 3; k++) {
      // linear solve for c on the span between the two marks
      var g1 = integrate(speedFn(1), V), g0 = integrate(speedFn(0.9), V);
      var span1 = glide(g1, 8.0) - glide(g1, 1.6), span0 = glide(g0, 8.0) - glide(g0, 1.6);
      c = 0.9 + (yFt - yS2 - span0) / (span1 - span0) * 0.1;
      if (c >= 0.94 && c <= 1.1) break;
      c = clamp(c, 0.94, 1.1);
      g = integrate(speedFn(c), V);
      V *= (yFt - yS2) / (glide(g, 8.0) - glide(g, 1.6));
    }
    g = integrate(speedFn(c), V);
    var y0 = yS2 - glide(g, 1.6);
    TL = { V: V, c: c, g: g, y0: y0, H: H, yS2: yS2, yFt: yFt, toff: 0 };
    // a longer page would make the glide faster on screen: past CRUISE_MAX page px/s the flight is
    // played slower in real time instead, so the motion keeps the pace of the original cut
    TL.rate = Math.min(1, CRUISE_MAX / (c * V));
    return TL;
  }
  var CRUISE_MAX = 1100;
  // film seconds per real second: TL.rate from the first glide to the end of the cruise, 1 elsewhere
  function flightRate(t) { return TL ? 1 - (1 - TL.rate) * (sstep(0.2, 0.8, t) - sstep(7.3, 8.0, t)) : 1; }

  // per-viewport camera constants
  function solveViewport() {
    var L = LAY, H = DATA.H;
    TL.Dover = L.f * H / (L.Hv - 2 * L.margin);
    TL.Dc = TL.Dover * (1 - 0.035);
    TL.Dend = L.f * 1440 / L.slot.w;
    TL.pin0 = L.cy - L.f * (H / 2) / TL.Dc;
    TL.endR = 38 * (L.portrait ? L.slot.w / 1018 : L.s) * TL.Dend / L.f;   // card corner in page px
  }

  function camAt(t) {
    var L = LAY, H = DATA.H, th, D, Ly;
    var cy = lerp(L.cyF, L.cy, sstep(7.75, 9.25, t));
    th = 56 * DEG * (1 - sstep(8.15, 8.95, t));
    if (t <= 9.25) {
      var Df = 1360 + 340 * sstep(0, 8.2, t);
      D = Df * Math.exp(riseR(t) * Math.log(TL.Dover / 1700));
      var Lg = TL.y0 + glide(TL.g, t);
      if (t <= 8.3) Ly = Lg;
      else {
        var cyb = L.Hv - L.margin - cy;
        var a = cyb * D / (L.f * Math.cos(th) + cyb * Math.sin(th));
        Ly = lerp(Lg, H - a, sstep(8.3, 8.65, t));
      }
    } else if (t <= 9.47) {
      D = TL.Dover * (1 - 0.035 * sstep(9.25, 9.47, t)); Ly = H / 2;
    } else if (t <= 9.97) {
      var u = (t - 9.47) / 0.5;
      D = Math.exp(lerp(Math.log(TL.Dc), Math.log(TL.Dend), eioq(u)));
      var pin = lerp(TL.pin0, L.slot.y, sstep(0.42, 1.0, u));
      Ly = (L.cy - pin) * D / L.f;
    } else {
      D = TL.Dend * (1 - 0.02 * sstep(10.6, 14.5, t));
      Ly = (L.cy - L.slot.y) * D / L.f;
    }
    var st = Math.sin(th), ct = Math.cos(th);
    return { t: t, th: th, D: D, Lx: 720, Ly: Ly, cy: cy, C: [720, Ly + D * st, D * ct], R: [1, 0, 0], U: [0, -ct, st], F: [0, -st, -ct] };
  }
  function project(cam, P) {
    var d0 = P[0] - cam.C[0], d1 = P[1] - cam.C[1], d2 = P[2] - cam.C[2];
    var z = d1 * cam.F[1] + d2 * cam.F[2], a = d0, b = d1 * cam.U[1] + d2 * cam.U[2];
    return [LAY.cx + LAY.f * a / z, cam.cy - LAY.f * b / z, z];
  }
  function unproject(cam, sx, sy, z) {
    var a = (sx - LAY.cx) * z / LAY.f, b = -(sy - cam.cy) * z / LAY.f;
    return [cam.C[0] + a, cam.C[1] + z * cam.F[1] + b * cam.U[1], cam.C[2] + z * cam.F[2] + b * cam.U[2]];
  }

  // ---------- pieces ----------
  var ITEMS = [];      // {L, tex, kind, role, rest, anim}
  var TILE = null;     // tile texture + meta
  function inAbout(L) {
    var a = DATA.sections && DATA.sections.about;
    return a ? L.y > a.y && L.y < a.y + a.h : L.y > 1000 && L.y < 1600;
  }
  function restZ(L, ord) {
    switch (L.role) {
      case 'hero-chip': return 40;
      case 'hero-mockup': return 26;
      case 's2-photo': return ord === 0 ? 22 : 30;
      case 'testimonial': return 22;
    }
    if (L.kind === 'chip') return inAbout(L) ? 44 : 18;
    if (L.kind === 'photo') return 20;
    if (L.kind === 'button') return 14;
    if (L.kind === 'card') return 24;
    return 16;
  }
  function crossT(y) { // time when the glide's look-at reaches page y
    var lo = 0, hi = 8.3;
    if (TL.y0 + glide(TL.g, hi) < y) return hi;
    for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (TL.y0 + glide(TL.g, mid) < y) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  var flyDx = { left: -400, right: 400 };
  function solveFly() {
    // lateral drift so the flying chips' centres cross the frame's side edges at t = 2.5
    ITEMS.forEach(function (it) {
      if (it.L.role !== 's2-fly-left' && it.L.role !== 's2-fly-right') return;
      var cam = camAt(2.5), st = pieceState(it, 2.5, true);
      var P = [it.cx, it.cy + 0, st.z];
      var pr = project(cam, P);
      var targetX = it.L.role === 's2-fly-left' ? 0 : LAY.W;
      var dxWorld = (targetX - pr[0]) * pr[2] / LAY.f;
      it.flyDx = dxWorld / Math.max(0.2, flyG(2.5));
    });
  }
  function flyG(t) { var u = clamp((t - 1.45) / (2.5 - 1.45), 0, 1.6); return Math.pow(u, 1.7); }

  function pieceState(it, t, noFly) {
    var L = it.L, rz = it.rest, z = rz, phi = 0, dx = 0, dy = 0, fade = 0;
    var settle = sstep(7.8, 8.9, t);          // everything lands as the camera rises
    switch (L.role) {
      case 'hero-chip': {
        var i = it.order, e = s5(0.1 + 0.08 * i, 1.35, t), back = s5(3.6, 4.4, t);
        var zc = [72, 64, 80][i % 3];
        z = lerp(rz, zc, e * (1 - back)); phi = 30 * DEG * e * (1 - back); break;
      }
      case 's2-photo': {
        var j = it.order, e2 = s5(1.35 + 0.1 * j, 2.7, t), b2 = s5(4.7, 5.5, t);
        z = lerp(rz, j === 0 ? 108 : 128, e2 * (1 - b2)); phi = 46 * DEG * e2 * (1 - b2); break;
      }
      case 's2-fly-left': case 's2-fly-right': {
        var e3 = s5(1.35, 2.7, t), away = t >= 4.7 ? 0 : 1;
        z = lerp(rz, 200, e3) * away + rz * (1 - away); phi = 54 * DEG * e3 * away;
        if (!noFly && away) dx = (it.flyDx || 0) * flyG(t);
        if (!away) { z = rz; phi = 0; dx = 0; }
        break;
      }
      case 'testimonial': {
        var e4 = s5(5.45 + TL.toff, 6.3 + TL.toff, t);
        z = lerp(rz, 112, e4); phi = 30 * DEG * e4; break;
      }
      case 'testimonial-2': {
        var e5 = s5(5.55 + TL.toff, 6.4 + TL.toff, t);
        z = lerp(rz, 50, e5); phi = 12 * DEG * e5; break;
      }
      case 'hero-mockup': case 'hero-button': case 'logo-tile': break;
      default: {
        if (L.y < heroB) break;
        var yc = L.y + L.h / 2, tA = it.tA, tB = it.tB;
        var e6 = s5(tA, tB, t), lift = L.kind === 'photo' ? 26 : L.kind === 'chip' ? 14 : 12, ang = L.kind === 'photo' ? 16 : L.kind === 'chip' ? 12 : 8;
        z = rz + lift * e6; phi = ang * DEG * e6;
      }
    }
    if (L.y >= heroB) { z = lerp(z, rz, settle); phi = lerp(phi, 0, settle); }
    // dive: everything below the hero fades into the haze
    if (L.y >= heroB) fade = sstep(9.47, 9.72, t);
    return { z: z, phi: phi, dx: dx, dy: dy, fade: fade };
  }

  // ---------- logo tiles ----------
  var TILES = [];
  function solveTiles() {
    var L = LAY, s = L.portrait ? L.fs : L.s, sl = L.slot;
    var cam135 = camAt(1.35), fr = function (x, y) { return [L.cx + (x - 720) * L.s, L.cyF + (y - 576) * L.s]; };
    // where they hang at 1.35 (frame px) and their size (page px)
    var hang = [[-10, 150, 1620, 190], [205, 64, 1820, 150], [1450, 130, 1600, 200], [1250, 52, 1840, 140]];
    // end-card spots (screen px) — top corners of the card, two huge soft blurs at the bottom corners
    var end = [
      [sl.x + 26 * s, sl.y + 14 * s, TL.Dend - 150, 104 * s],
      [sl.x - 70 * s, L.Hv - 40 * s, 760, 400 * s],
      [sl.x + sl.w - 6 * s, sl.y + 40 * s, TL.Dend - 6, 112 * s],
      [sl.x + sl.w + 90 * s, L.Hv + 20 * s, 700, 440 * s]
    ];
    if (L.portrait) {
      end[1] = [sl.x - 30, L.Hv - 30, 620, L.W * 0.62];
      end[3] = [sl.x + sl.w + 30, L.Hv + 10, 580, L.W * 0.7];
    }
    // overhead satellites (screen px)
    var stripW = 1440 * L.f / TL.Dover, sx0 = L.cx - stripW / 2, sx1 = L.cx + stripW / 2;
    var over = [
      [sx0 - 74 * s, L.cy - 270 * s, 0.95, 66 * s],
      [sx0 - 118 * s, L.cy + 240 * s, 0.9, 58 * s],
      [sx1 + 86 * s, L.cy - 330 * s, 0.94, 72 * s],
      [sx1 + 112 * s, L.cy + 200 * s, 0.92, 60 * s]
    ];
    TILES = DATA.layers.filter(function (l) { return l.role === 'logo-tile'; }).map(function (l, i) {
      var p = fr(hang[i][0], hang[i][1]);
      var W1 = unproject(cam135, p[0], p[1], hang[i][2]);
      return { i: i, start: [l.x + l.w / 2, l.y + l.h / 2, 2], size0: l.w, hang: W1, hangSize: hang[i][3], end: end[i], over: over[i] };
    });
  }
  function tileState(T, t, cam) {
    // returns {P (centre, world), size (page px), mode:'world'|'cam', phi}
    var i = T.i;
    if (t < 2.65) {
      var e = s5(0.1 + 0.07 * i, 1.35, t);
      var arc = Math.sin(Math.PI * e) * 120;
      var P = [lerp(T.start[0], T.hang[0], e), lerp(T.start[1], T.hang[1], e), lerp(T.start[2], T.hang[2], e) + arc];
      var trail = s5(1.2, 2.4, t) * 300; P[1] += trail;
      return { P: P, size: lerp(T.size0, T.hangSize, e), phi: lerp(0, 50 * DEG, e) };
    }
    if (i === 1 && t > 4.9 + TL.toff && t < 5.95 + TL.toff) {
      var u = (t - 4.95 - TL.toff) / 0.9, s = LAY.portrait ? LAY.fs : LAY.s;
      var sx = LAY.cx + (lerp(380, -300, u) - 720) * LAY.s, sy = cam.cy + (lerp(1300, 700, u) - 576) * LAY.s, z = lerp(620, 560, u);
      return { cam: true, sx: sx, sy: sy, z: z, px: 150 * LAY.f / z };
    }
    if (t < 7.85) return null;
    var o = T.over, n = T.end, k, a;
    if (t < 9.47) {
      // fly in from outside the frame during the rise, then hover by the strip
      k = s5(7.85 + 0.1 * i, 9.2, t);
      var fromX = o[0] < LAY.cx ? -260 : LAY.W + 260, fromY = o[1] + (i % 2 ? 300 : -300);
      return { cam: true, sx: lerp(fromX, o[0], k), sy: lerp(fromY, o[1], k), z: cam.D * o[2], px: o[3] };
    }
    k = eioq((t - 9.47) / 0.5);
    var hold = t > 9.97 ? 1 : 0, drift = hold * sstep(9.97, 11.0, t);
    var sx2 = lerp(o[0], n[0], k) + drift * 3 * Math.sin(0.55 * t + i * 1.7);
    var sy2 = lerp(o[1], n[1], k) + drift * 2.5 * Math.cos(0.47 * t + i * 2.3);
    var z2 = Math.exp(lerp(Math.log(TL.Dc * o[2]), Math.log(n[2]), k));
    return { cam: true, sx: sx2, sy: sy2, z: z2, px: lerp(o[3], n[3], k) };
  }

  // ---------- draw ----------
  var FL0 = [246 / 255, 239 / 255, 226 / 255], FL1 = [227 / 255, 212 / 255, 184 / 255];   // ivory floor, matches .intro
  function setCam(P, cam) {
    var u = P.u;
    gl.uniform3fv(u.uC, cam.C); gl.uniform3fv(u.uR, cam.R); gl.uniform3fv(u.uU, cam.U); gl.uniform3fv(u.uF, cam.F);
    gl.uniform4f(u.uK, LAY.f, LAY.cx, cam.cy, 0); gl.uniform2f(u.uVP, LAY.W, LAY.Hv);
  }
  function setCommon(P, focus) {
    var u = P.u, cs = (LAY.portrait ? LAY.fs : LAY.s) * renderScale;
    if (u.uFocus) gl.uniform1f(u.uFocus, focus);
    if (u.uCocS) gl.uniform1f(u.uCocS, cs);
    if (u.uCocMax) gl.uniform1f(u.uCocMax, 120 * cs);
    if (u.uFl0) gl.uniform3fv(u.uFl0, FL0);
    if (u.uFl1) gl.uniform3fv(u.uFl1, FL1);
    if (u.uRes) gl.uniform2f(u.uRes, RT.w, RT.h);
  }
  function quad(P, O, Eu, Ev, uv) {
    gl.uniform3fv(P.u.uO, O); gl.uniform3fv(P.u.uEu, Eu); gl.uniform3fv(P.u.uEv, Ev);
    gl.uniform4fv(P.u.uUV, uv || [0, 0, 1, 1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function shadow(cam, x0, y0, x1, y1, corner, sigma, opacity) {
    var e = sigma * 3;
    gl.uniform4f(P_SH.u.uRect, x0, y0, x1, y1); gl.uniform1f(P_SH.u.uCorner, corner); gl.uniform1f(P_SH.u.uSigma, Math.max(0.5, sigma)); gl.uniform1f(P_SH.u.uOpacity, opacity);
    quad(P_SH, [x0 - e, y0 - e, 0], [x1 - x0 + 2 * e, 0, 0], [0, y1 - y0 + 2 * e, 0]);
  }
  var DB_BOTH = null, DB_COLOR = null;
  function onScreen(cam, corners) {
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, behind = 0;
    for (var i = 0; i < corners.length; i++) {
      var p = project(cam, corners[i]);
      if (p[2] <= 1) { behind++; continue; }
      minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]);
    }
    if (behind === corners.length) return false;
    if (behind) return true;
    var m = 160;
    return !(maxx < -m || minx > LAY.W + m || maxy < -m || miny > LAY.Hv + m);
  }

  function render(t) {
    var cam = camAt(t), H = DATA.H, L = LAY;
    var focus = cam.D;
    var dive = sstep(9.47, 9.97, t);
    var fadeBelow = sstep(9.47, 9.72, t);
    var maskBottom = lerp(H, heroB, sstep(9.66, 9.97, t));
    var maskR = lerp(24, TL.endR, dive);
    var shadowBottom = lerp(H, heroB, fadeBelow);
    var haze = 0.2 * (1 - sstep(7.6, 8.6, t));

    gl.bindFramebuffer(gl.FRAMEBUFFER, RT.fScene);
    gl.viewport(0, 0, RT.w, RT.h);
    gl.drawBuffers(DB_BOTH);
    gl.disable(gl.BLEND);
    // floor
    gl.useProgram(P_FLOOR.p); setCommon(P_FLOOR, focus);
    gl.uniform3fv(P_FLOOR.u.uC, cam.C); gl.uniform3fv(P_FLOOR.u.uR, cam.R); gl.uniform3fv(P_FLOOR.u.uU, cam.U); gl.uniform3fv(P_FLOOR.u.uF, cam.F);
    gl.uniform4f(P_FLOOR.u.uK, L.f, L.cx, cam.cy, 0); gl.uniform2f(P_FLOOR.u.uVP, L.W, L.Hv);
    gl.bindVertexArray(vaoFull); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(vaoQuad);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // page shadow (wide + contact)
    gl.drawBuffers(DB_COLOR);
    gl.useProgram(P_SH.p); setCam(P_SH, cam);
    shadow(cam, 0, 10, 1440, shadowBottom + 22, maskR, 46, 0.13);
    shadow(cam, 0, 0, 1440, shadowBottom + 2, maskR, 3, 0.07);

    // page bands
    gl.drawBuffers(DB_BOTH);
    gl.useProgram(P_TEX.p); setCam(P_TEX, cam); setCommon(P_TEX, focus);
    var u = P_TEX.u;
    gl.uniform1f(u.uA, 1); gl.uniform4f(u.uMask, 0, 0, 1440, maskBottom); gl.uniform1f(u.uMaskR, maskR); gl.uniform1f(u.uMaskOn, 1);
    gl.uniform1f(u.uHeroB, heroB); gl.uniform1f(u.uFade, fadeBelow); gl.uniform1f(u.uPieceFade, 0); gl.uniform1f(u.uHaze, haze);
    gl.uniform4f(u.uTint, 0, 0, 0, 0); gl.uniform4f(u.uEdge, 0, 0, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(u.uTex, 0);
    BANDS.forEach(function (b) {
      if (b.y0 > maskBottom) return;
      if (!onScreen(cam, [[0, b.y0, 0], [1440, b.y0, 0], [0, b.y1, 0], [1440, b.y1, 0]])) return;
      gl.bindTexture(gl.TEXTURE_2D, b.tex);
      var span = b.b - b.a, v0 = (b.y0 - b.a) / span, v1 = (b.y1 - b.a) / span;
      quad(P_TEX, [0, b.y0, 0], [1440, 0, 0], [0, b.y1 - b.y0, 0], [0, v0, 1, v1]);
    });
    gl.uniform1f(u.uMaskOn, 0);

    // pieces + tiles, lowest first
    var draws = [];
    if (!NOPIECES) ITEMS.forEach(function (it) {
      var st = pieceState(it, t);
      if (it.L.y > maskBottom) return;
      if (st.fade >= 0.999 && t > 9.72) return;
      draws.push({ it: it, st: st, z: st.z });
    });
    if (!NOPIECES) TILES.forEach(function (T) {
      var ts = tileState(T, t, cam);
      if (!ts) return;
      draws.push({ tile: T, ts: ts, z: ts.cam ? (unproject(cam, ts.sx, ts.sy, ts.z))[2] : ts.P[2] });
    });
    draws.sort(function (a, b) { return a.z - b.z; });
    draws.forEach(function (d) { if (d.it) drawPiece(cam, d.it, d.st, focus, haze); else drawTile(cam, d.tile, d.ts, focus); });

    // mips for the gather, then near-CoC dilation
    gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, RT.color); gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindVertexArray(vaoFull);
    var cs = (L.portrait ? L.fs : L.s) * renderScale, K = Math.min(48, Math.ceil(120 * cs / 8));
    gl.bindFramebuffer(gl.FRAMEBUFFER, RT.fA); gl.viewport(0, 0, RT.nw, RT.nh);
    gl.useProgram(P_ND.p); gl.bindTexture(gl.TEXTURE_2D, RT.coc); gl.uniform1i(P_ND.u.uCoc, 0); gl.uniform2f(P_ND.u.uSrcTexel, 1 / RT.w, 1 / RT.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.useProgram(P_NM.p); gl.uniform1i(P_NM.u.uSrc, 0); gl.uniform1i(P_NM.u.uK, K);
    gl.bindFramebuffer(gl.FRAMEBUFFER, RT.fB); gl.bindTexture(gl.TEXTURE_2D, RT.nA); gl.uniform2f(P_NM.u.uDir, 1 / RT.nw, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, RT.fA); gl.bindTexture(gl.TEXTURE_2D, RT.nB); gl.uniform2f(P_NM.u.uDir, 0, 1 / RT.nh); gl.drawArrays(gl.TRIANGLES, 0, 3);
    // gather (then a light smoothing pass where the blur is large)
    gl.bindFramebuffer(gl.FRAMEBUFFER, RT.fOut); gl.viewport(0, 0, RT.w, RT.h);
    gl.useProgram(P_DOF.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, RT.color); gl.uniform1i(P_DOF.u.uColor, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, RT.coc); gl.uniform1i(P_DOF.u.uCoc, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, RT.nA); gl.uniform1i(P_DOF.u.uNear, 2);
    gl.uniform2f(P_DOF.u.uTexel, 1 / RT.w, 1 / RT.h); gl.uniform1f(P_DOF.u.uCocMax, 120 * cs); gl.uniform1i(P_DOF.u.uTaps, TAPS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(P_POST.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, RT.out); gl.uniform1i(P_POST.u.uImg, 0);
    gl.uniform1i(P_POST.u.uCoc, 1); gl.uniform1i(P_POST.u.uNear, 2);
    gl.uniform2f(P_POST.u.uTexel, 1 / RT.w, 1 / RT.h); gl.uniform1f(P_POST.u.uCocMax, 120 * cs);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindVertexArray(null);
  }

  function pieceGeom(it, st) {
    var L = it.L, pad = it.pad, hw = L.w / 2 + pad, hh = L.h / 2 + pad;
    var cx = it.cx + st.dx, cy = it.cy + st.dy, z = st.z;
    var vd = [0, Math.cos(st.phi), -Math.sin(st.phi)];
    var O = [cx - hw, cy - hh * vd[1], z - hh * vd[2]];
    return { O: O, Eu: [2 * hw, 0, 0], Ev: [0, 2 * hh * vd[1], 2 * hh * vd[2]], cx: cx, cy: cy, z: z, vd: vd, hw: hw, hh: hh };
  }
  function drawPiece(cam, it, st, focus, haze) {
    var L = it.L, g = pieceGeom(it, st);
    var corners = [g.O, [g.O[0] + g.Eu[0], g.O[1], g.O[2]], [g.O[0], g.O[1] + g.Ev[1], g.O[2] + g.Ev[2]], [g.O[0] + g.Eu[0], g.O[1] + g.Ev[1], g.O[2] + g.Ev[2]]];
    if (!onScreen(cam, corners)) return;
    var alpha = 1;
    // shadow on whatever is under it: flat warm brown #4a3314, offset (0.10z, 4+0.36z), blur 7+0.5z, 26%
    gl.drawBuffers(DB_COLOR);
    gl.useProgram(P_SH.p); setCam(P_SH, cam);
    var foot = (L.h / 2) * Math.cos(st.phi);
    var ox = 0.10 * g.z, oy = 4 + 0.36 * g.z, sig = (7 + 0.5 * g.z) / 2, r = Math.min(L.r, L.h / 2, L.w / 2);
    shadow(cam, g.cx - L.w / 2 + ox, g.cy - foot + oy, g.cx + L.w / 2 + ox, g.cy + foot + oy, r, sig, 0.26 * alpha * (1 - st.fade));
    gl.drawBuffers(DB_BOTH);
    gl.useProgram(P_TEX.p); setCam(P_TEX, cam); setCommon(P_TEX, focus);
    var u = P_TEX.u;
    gl.uniform1f(u.uA, alpha); gl.uniform1f(u.uMaskOn, 0); gl.uniform1f(u.uPieceFade, st.fade); gl.uniform1f(u.uHaze, haze);
    gl.uniform4f(u.uEdge, 0, 0, 0, 0);
    if (L.role === 'testimonial' && TL.slab > 0 && st.phi > 0.01) {
      // the card's thickness: a white edge under its near (bottom) side
      var T = TL.slab * sstep(0.0, 0.4, st.phi / (30 * DEG));
      var bx = g.cx - L.w / 2 + r, bw = L.w - 2 * r;
      var by = [g.cx, g.cy + (L.h / 2) * g.vd[1], g.z + (L.h / 2) * g.vd[2]];
      var n = [0, Math.sin(st.phi), Math.cos(st.phi)];
      gl.uniform4f(u.uTint, 0.965, 0.93, 0.86, 1);
      quad(P_TEX, [bx, by[1], by[2]], [bw, 0, 0], [0, -T * n[1], -T * n[2]]);
      gl.uniform4f(u.uTint, 0, 0, 0, 0);
    }
    gl.bindTexture(gl.TEXTURE_2D, it.tex);
    quad(P_TEX, g.O, g.Eu, g.Ev);
  }
  function drawTile(cam, T, ts, focus) {
    var tex = TILE.tex, pr = TILE.padRatio, O, Eu, Ev, size, zc;
    if (ts.cam) {
      var c = unproject(cam, ts.sx, ts.sy, ts.z); size = ts.px * ts.z / LAY.f; zc = c[2];
      var full = size * (1 + 2 * pr), h = full / 2;
      O = [c[0] - h * cam.R[0] + h * cam.U[0], c[1] - h * cam.R[1] + h * cam.U[1], c[2] - h * cam.R[2] + h * cam.U[2]];
      Eu = [full, 0, 0]; Ev = [-full * cam.U[0], -full * cam.U[1], -full * cam.U[2]];
      if (!onScreen(cam, [O, [O[0] + full, O[1], O[2]], [O[0] + Ev[0], O[1] + Ev[1], O[2] + Ev[2]]])) return;
    } else {
      size = ts.size; zc = ts.P[2];
      var full2 = size * (1 + 2 * pr), h2 = full2 / 2, vd = [0, Math.cos(ts.phi), -Math.sin(ts.phi)];
      O = [ts.P[0] - h2, ts.P[1] - h2 * vd[1], ts.P[2] - h2 * vd[2]]; Eu = [full2, 0, 0]; Ev = [0, full2 * vd[1], full2 * vd[2]];
      if (!onScreen(cam, [O, [O[0] + full2, O[1], O[2]], [O[0], O[1] + Ev[1], O[2] + Ev[2]], [O[0] + full2, O[1] + Ev[1], O[2] + Ev[2]]])) return;
    }
    if (zc < 420) {
      gl.drawBuffers(DB_COLOR); gl.useProgram(P_SH.p); setCam(P_SH, cam);
      var cxw = O[0] + Eu[0] / 2, cyw = O[1] + (Ev[1]) / 2, half = size / 2, foot = ts.cam ? half : half * Math.cos(ts.phi);
      shadow(cam, cxw - half + 0.10 * zc, cyw - foot + 4 + 0.36 * zc, cxw + half + 0.10 * zc, cyw + foot + 4 + 0.36 * zc, size * 0.28, (7 + 0.5 * zc) / 2, 0.26 * (1 - sstep(220, 420, zc)));
    }
    gl.drawBuffers(DB_BOTH); gl.useProgram(P_TEX.p); setCam(P_TEX, cam); setCommon(P_TEX, focus);
    var u = P_TEX.u; gl.uniform1f(u.uA, 1); gl.uniform1f(u.uMaskOn, 0); gl.uniform1f(u.uPieceFade, 0); gl.uniform1f(u.uHaze, 0);
    gl.uniform4f(u.uTint, 0, 0, 0, 0); gl.uniform4f(u.uEdge, 0, 0, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, tex); quad(P_TEX, O, Eu, Ev);
  }

  // ---------- DOM per frame ----------
  function domAt(t) {
    var s = LAY.portrait ? LAY.fs : LAY.s;
    var b = sstep(10.02, 10.34, t);
    badge.style.opacity = b.toFixed(3);
    badge.style.transform = 'translateX(-50%) translateY(' + ((1 - b) * 8 * s).toFixed(2) + 'px)';
    function word(w, t0) {
      var p = clamp((t - t0) / 0.34, 0, 1), e = eoc(p);
      w.style.opacity = Math.min(1, p * 1.8).toFixed(3);
      w.style.transform = 'translateY(' + ((1 - e) * 16 * s).toFixed(2) + 'px)';
      var bl = (1 - e) * 12 * s; w.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
    }
    words1.forEach(function (w, i) { word(w, 10.12 + 0.06 * i); });
    words2.forEach(function (w, i) { word(w, 10.36 + 0.05 * i); });
    if (btnSkip) btnSkip.hidden = !(t > 0.4 && t < 10.0);
    if (btnReplay) btnReplay.hidden = !(t > 10.8);
    if (btnDown) btnDown.hidden = !(t > 10.8);
  }

  // ---------- seek ----------
  function seek(t) {
    if (!RT) return;
    render(t);
    domAt(t);
  }
  window.filmSeek = function (t) { seek(t); return true; };
  window.filmRate = function (t) { return flightRate(t); };
  window.filmPlayFrom = function (t) { if (RT) play(t); return !!RT; };   // checks: jump the playback clock
  window.filmSpeed = function (t, dt) {
    dt = dt || 1 / 120; var a = camAt(t), b = camAt(t + dt), P = [720, a.Ly, 0];
    var pa = project(a, P), pb = project(b, P);
    return { pageSpeed: (b.Ly - a.Ly) / dt, screenSpeed: (pb[1] - pa[1]) / dt, D: a.D, dD: (b.D - a.D) / dt };
  };
  window.filmDebug = function (t) {
    var cam = camAt(t), out = { t: t, D: cam.D, Ly: cam.Ly, th: cam.th / DEG, TL: { V: TL.V, c: TL.c, y0: TL.y0, toff: TL.toff, slab: TL.slab, Dover: TL.Dover, Dend: TL.Dend } , items: {}, tiles: [] };
    ITEMS.forEach(function (it) { if (!it.L.role || it.L.role === 'hero-button') return; var st = pieceState(it, t), p = project(cam, [it.cx + st.dx, it.cy + st.dy, st.z]); out.items[it.L.id + ':' + it.L.role] = [Math.round(p[0]), Math.round(p[1]), Math.round(p[2]), Math.round(st.z)]; });
    TILES.forEach(function (T) { var ts = tileState(T, t, cam); if (!ts) { out.tiles.push(null); return; } var c = ts.cam ? [ts.sx, ts.sy, ts.z] : project(cam, ts.P); out.tiles.push([Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]); });
    var hb = project(cam, [720, DATA.H, 0]), ht = project(cam, [720, 0, 0]); out.pageTopY = Math.round(ht[1]); out.pageBottomY = Math.round(hb[1]);
    return out;
  };

  // ---------- load ----------
  var BANDS = [];
  function progress(p) { if (loader) loader.style.setProperty('--p', clamp(p, 0, 1).toFixed(3)); }

  function setup() {
    heroB = DATA.heroBottom;
    layout();
    solveTimeline();
    solveViewport();
    ITEMS.forEach(function (it) {
      var yc = it.L.y + it.L.h / 2;
      it.tA = crossT(yc - 760); it.tB = crossT(yc - 140);
    });
    // the reviews beat (testimonial lift, and the tile sweeping past just before it) follows
    // the cards' place on the page: 6.34 s is when the camera crossed them in the original cut
    var tes = ITEMS.filter(function (it) { return it.L.role === 'testimonial'; })[0];
    TL.toff = tes ? clamp(crossT(tes.cy) - 6.34, -1.2, 1.2) : 0;
    // slab thickness: the testimonial's near edge shows ~34 frame px at its peak
    TL.slab = 0;
    if (tes) {
      var tp = 6.1 + TL.toff, cam = camAt(tp), st = pieceState(tes, tp), g = pieceGeom(tes, st);
      var top = [g.cx, g.cy + (tes.L.h / 2) * g.vd[1], g.z + (tes.L.h / 2) * g.vd[2]];
      var n = [0, Math.sin(st.phi), Math.cos(st.phi)];
      var p0 = project(cam, top), p1 = project(cam, [top[0], top[1] - 10 * n[1], top[2] - 10 * n[2]]);
      var per = Math.abs(p1[1] - p0[1]) / 10;
      TL.slab = clamp(34 * (LAY.portrait ? LAY.fs : LAY.s) / Math.max(per, 1e-3), 10, 70);
    }
    solveFly();
    solveTiles();
    buildRT();
  }

  function start() {
    if (loader) loader.classList.add('done');
    canvas.style.visibility = 'visible';
    if (STILL !== null) { seek(STILL); window.__filmReady = true; return; }
    play(0);
  }

  // ---------- playback ----------
  var clock = 0, last = null, raf = 0, playing = false, visible = true, frameTimes = [];
  var T_STOP = 15.2;
  function tick(now) {
    raf = 0;
    if (!playing) return;
    if (last === null) last = now;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    clock += dt * flightRate(clock);
    // adaptive resolution during the first seconds of flight
    if (clock > 0.3 && clock < 3 && dt > 0) {
      frameTimes.push(dt);
      if (frameTimes.length === 24) {
        var avg = frameTimes.reduce(function (a, b) { return a + b; }, 0) / 24;
        if (avg > 0.034 && renderScale > 0.75) { renderScale = Math.max(0.75, renderScale * 0.72); buildRT(); }
        else if (avg > 0.09) { playing = false; goStatic('static'); return; }   // too slow for the film: show the title card
        frameTimes = [];
      }
    }
    seek(clock);
    if (clock >= HANDOVER_T) maybeHandOver();
    if (clock < T_STOP || clock < 60) schedule();
  }
  function schedule() { if (!raf && playing && visible) raf = requestAnimationFrame(tick); }
  function play(from) { clock = from; last = null; playing = true; handedOver = false; schedule(); }
  // skip: settle on the title card and go straight to the site
  if (btnSkip) btnSkip.addEventListener('click', function () { clock = Math.max(clock, 11.0); last = null; schedule(); goSite(); });
  if (btnReplay) btnReplay.addEventListener('click', function () { play(0); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting; if (visible) { last = null; schedule(); }
    }, { threshold: 0.02 }).observe(intro);
  }
  doc.addEventListener('visibilitychange', function () { last = null; if (!doc.hidden) schedule(); });

  var resizeT = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (!DATA) return;
      layout();
      if (!TL || !RT) return;
      solveViewport(); solveFly(); solveTiles(); buildRT(); seek(clock);
    }, 120);
  });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); playing = false; goStatic('nogl'); });

  fetch(BASE + 'layers.json').then(function (r) { return r.json(); }).then(function (d) {
    DATA = d; heroB = d.heroBottom; layout();
    var list = [];
    d.bands.forEach(function (b) { list.push({ kind: 'band', b: b, url: BASE + (SET === 2 ? b.s2 : b.s1) }); });
    d.layers.forEach(function (L) {
      var hiRes = SET === 2 && (L.y < 1700 || /testimonial/.test(L.role));
      list.push({ kind: 'layer', L: L, url: BASE + L.id + (hiRes ? '@2' : '@1') + '.webp' });
    });
    list.push({ kind: 'tile', url: BASE + 'TILE@2.webp' });
    var done = 0;
    return Promise.all(list.map(function (e) {
      return loadImage(e.url).then(function (im) { e.img = im; done++; progress(done / list.length * 0.9); });
    })).then(function () { return list; });
  }).then(function (list) {
    var orders = {};
    list.forEach(function (e) {
      var tex = texFrom(e.img); e.img = null;
      if (e.kind === 'band') BANDS.push({ y0: e.b.y0, y1: e.b.y1, a: e.b.a, b: e.b.b, tex: tex });
      else if (e.kind === 'tile') TILE = { tex: tex, padRatio: DATA.tile.pad / DATA.tile.w };
      else {
        var L = e.L; if (L.role === 'logo-tile') { gl.deleteTexture(tex); return; }
        var key = L.role || L.kind, ord = orders[key] = (orders[key] || 0); orders[key]++;
        ITEMS.push({ L: L, tex: tex, pad: L.pad, cx: L.x + L.w / 2, cy: L.y + L.h / 2, rest: restZ(L, ord), order: ord });
      }
    });
    DB_BOTH = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]; DB_COLOR = [gl.COLOR_ATTACHMENT0, gl.NONE];
    setup();
    progress(1);
    start();
  }).catch(function (err) { console.warn('film', err); goStatic('nogl'); });
})();
