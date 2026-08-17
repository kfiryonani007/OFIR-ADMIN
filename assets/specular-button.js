/* ============================================================
   SpecularButton — vanilla-JS port of the React Bits component
   (originally React + the `ogl` WebGL wrapper).

   The original shader is kept verbatim; only the plumbing around
   it was rewritten against raw WebGL2 so the site keeps its
   no-build, no-dependency setup.

   Mounts on any element carrying [data-specular] — works on both
   <a> and <button>, so the existing "לתיאום פגישה" links keep
   their markup and behaviour.

   Per-element overrides via data attributes:
     data-line-color   moving highlight        (default: bronze)
     data-base-color   static edge stroke
     data-radius       corner radius in px
     data-speed        sweep speed when idle
     data-intensity    highlight brightness

   Degrades to the plain CSS button when WebGL2 is unavailable or
   the visitor asked for reduced motion.
   ============================================================ */
(function () {
  'use strict';

  var PAD = 20;

  var VERT = '#version 300 es\n' +
    'in vec2 position;\n' +
    'void main() { gl_Position = vec4(position, 0.0, 1.0); }\n';

  var FRAG = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform vec2 uCenter;\n' +
    'uniform vec2 uHalfSize;\n' +
    'uniform float uRadius;\n' +
    'uniform float uAngle;\n' +
    'uniform float uPx;\n' +
    'uniform vec3 uLineColor;\n' +
    'uniform vec3 uBaseColor;\n' +
    'uniform float uIntensity;\n' +
    'uniform float uShineSize;\n' +
    'uniform float uShineFade;\n' +
    'uniform float uThickness;\n' +
    'uniform float uBaseWidth;\n' +
    'out vec4 fragColor;\n' +
    'float sdRoundedRect(vec2 p, vec2 b, float r) {\n' +
    '  vec2 q = abs(p) - b + r;\n' +
    '  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\n' +
    '}\n' +
    'float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }\n' +
    'float gaussianLine(float d, float sigma) {\n' +
    '  float x = d / (sigma + 1e-6);\n' +
    '  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));\n' +
    '  return exp(-k * x * x);\n' +
    '}\n' +
    'void main() {\n' +
    '  vec2 p = gl_FragCoord.xy - uCenter;\n' +
    '  float d = shapeSDF(p);\n' +
    '  vec2 L = vec2(cos(uAngle), sin(uAngle));\n' +
    '  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;\n' +
    '  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);\n' +
    '  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));\n' +
    '  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);\n' +
    '  float line = gaussianLine(d, uThickness);\n' +
    '  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));\n' +
    '  float hi = line * rim * edgeClamp * uIntensity;\n' +
    '  vec3 col = uBaseColor * base + uLineColor * hi;\n' +
    '  float a = clamp(base + hi, 0.0, 1.0);\n' +
    '  fragColor = vec4(col, a);\n' +
    '}\n';

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[specular] shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  // "#C9A876" -> [r, g, b] in 0..1, matching ogl's Color behaviour.
  function hexToRgb(hex) {
    hex = String(hex || '').trim().replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var n = parseInt(hex, 16);
    if (isNaN(n) || hex.length !== 6) return [1, 1, 1];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  // Resolve a CSS custom property (e.g. "var(--bronze-hi)") to a hex string.
  function resolveColor(val, fallback) {
    val = String(val || '').trim();
    if (!val) return fallback;
    var m = val.match(/^var\((--[\w-]+)\)$/);
    if (m) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
      return v || fallback;
    }
    return val;
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  function mount(el) {
    if (el.__specular) return;
    // The glow canvas bleeds PAD px past every edge. On an element that
    // already spans the viewport that bleed becomes horizontal page scroll,
    // so skip those rather than introduce an overflow.
    var w = el.getBoundingClientRect().width;
    if (w && w > document.documentElement.clientWidth - PAD * 2) return;
    el.__specular = true;

    var opts = {
      radius: num(el.dataset.radius, 4),
      lineColor: resolveColor(el.dataset.lineColor, '#C9A876'),
      baseColor: resolveColor(el.dataset.baseColor, '#6E5027'),
      intensity: num(el.dataset.intensity, 1),
      shineSize: num(el.dataset.shineSize, 10),
      shineFade: num(el.dataset.shineFade, 40),
      thickness: num(el.dataset.thickness, 1),
      speed: num(el.dataset.speed, 1.2),
      followMouse: el.dataset.followMouse !== 'false',
      proximity: num(el.dataset.proximity, 250),
      autoAnimate: el.dataset.autoAnimate !== 'false'
    };

    var fx = document.createElement('span');
    fx.className = 'specular-fx';
    fx.setAttribute('aria-hidden', 'true');

    // Wrap the existing text so it paints above the canvas.
    var label = document.createElement('span');
    label.className = 'specular-label';
    while (el.firstChild) label.appendChild(el.firstChild);
    el.appendChild(fx);
    el.appendChild(label);
    el.classList.add('specular-on');

    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: true
    });
    if (!gl) return; // plain CSS button remains, nothing else to do

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[specular] link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Fullscreen triangle, same geometry ogl's Triangle produces.
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uCenter', 'uHalfSize', 'uRadius', 'uAngle', 'uPx', 'uLineColor', 'uBaseColor',
     'uIntensity', 'uShineSize', 'uShineFade', 'uThickness', 'uBaseWidth'
    ].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var dpr = window.devicePixelRatio || 1;
    gl.uniform1f(U.uPx, dpr);
    gl.uniform1f(U.uBaseWidth, dpr);

    fx.appendChild(canvas);

    var size = { w: 1, h: 1 };
    function resize() {
      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      size.w = rect.width; size.h = rect.height;
      var cw = rect.width + PAD * 2, ch = rect.height + PAD * 2;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uCenter, (PAD + rect.width / 2) * dpr, (PAD + rect.height / 2) * dpr);
      gl.uniform2f(U.uHalfSize, (rect.width / 2) * dpr, (rect.height / 2) * dpr);
    }
    var ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Light angle steers toward the pointer and falls back to a slow sweep.
    var pointerAngle = null, proximityT = 0;
    function onPointerMove(e) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      var dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      var dist = Math.hypot(dx, dy);
      if (dist === 0) {
        var nx = (e.clientX - cx) / (rect.width / 2);
        var ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      var t = Math.max(0, 1 - dist / Math.max(opts.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    var lineRGB = hexToRgb(opts.lineColor);
    var baseRGB = hexToRgb(opts.baseColor);
    gl.uniform3f(U.uLineColor, lineRGB[0], lineRGB[1], lineRGB[2]);
    gl.uniform3f(U.uBaseColor, baseRGB[0], baseRGB[1], baseRGB[2]);
    gl.uniform1f(U.uShineSize, (opts.shineSize * Math.PI) / 180);
    gl.uniform1f(U.uShineFade, (opts.shineFade * Math.PI) / 180);
    gl.uniform1f(U.uThickness, opts.thickness * dpr);

    var angle = 2.4, idleAngle = 2.4, bright = 0, last = performance.now(), raf = 0;
    var visible = true;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      idleAngle += opts.speed * dt;
      var steer = opts.followMouse && pointerAngle != null && (!opts.autoAnimate || proximityT > 0);
      var target = steer ? pointerAngle : idleAngle;
      var diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += diff * (1 - Math.exp(-dt * 7));

      var brightTarget = opts.autoAnimate ? 1 : proximityT;
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

      gl.uniform1f(U.uAngle, angle);
      gl.uniform1f(U.uRadius, Math.min(opts.radius, Math.min(size.w, size.h) / 2) * dpr);
      gl.uniform1f(U.uIntensity, opts.intensity * bright);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);

    // Stop burning GPU on buttons scrolled out of view.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) last = performance.now();
      }, { rootMargin: '80px' }).observe(el);
    }
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-specular]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
