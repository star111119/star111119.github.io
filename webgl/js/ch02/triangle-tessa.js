"use strict";

var gl, canvas;
var points = [];

/* ---------- 0.9.5 兼容工具 ---------- */
function vec3FromValues(x, y, z) {
  return vec3.create([x, y, z]);
}
function vec3Lerp(out, a, b, t) {
  for (var i = 0; i < 3; ++i) out[i] = a[i] + t * (b[i] - a[i]);
}
function vec3RotateZ(out, a, center, rad) {
  var x = a[0] - center[0], y = a[1] - center[1];
  var c = Math.cos(rad), s = Math.sin(rad);
  out[0] = x * c - y * s + center[0];
  out[1] = x * s + y * c + center[1];
  out[2] = a[2];
}

/* ---- 主入口 ---- */
function initTessa(level, angle, twistOn, twistDegree) {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL 不可用"); return; }

  points = [];
  var radius = 1.0;
  var rad = Math.PI / 180;

  /* 初始等边三角形 */
  var vertices = [
    radius * Math.cos(90 * rad),  radius * Math.sin(90 * rad),  0,
    radius * Math.cos(210 * rad), radius * Math.sin(210 * rad), 0,
    radius * Math.cos(-30 * rad), radius * Math.sin(-30 * rad), 0
  ];
  var a = vec3FromValues(vertices[0], vertices[1], vertices[2]);
  var b = vec3FromValues(vertices[3], vertices[4], vertices[5]);
  var c = vec3FromValues(vertices[6], vertices[7], vertices[8]);

  divideTriangle(a, b, c, level, angle, twistOn, twistDegree);

  /* 只初始化一次 WebGL 资源 */
  if (!initTessa.program) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
    initTessa.program   = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(initTessa.program);
    initTessa.vPosition = gl.getAttribLocation(initTessa.program, "vPosition");
    gl.enableVertexAttribArray(initTessa.vPosition);
    initTessa.vBuffer   = gl.createBuffer();
  }

  /* 每次更新数据 */
  gl.bindBuffer(gl.ARRAY_BUFFER, initTessa.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(initTessa.vPosition, 3, gl.FLOAT, false, 0, 0);

  render();
}

/* ---------- 子函数 ---------- */
function divideTriangle(a, b, c, count, angle, twistOn, twistDegree) {
  if (count === 0) {
    tessellaTriangle(a, b, c, angle, twistOn, twistDegree);
  } else {
    var ab = vec3.create(), bc = vec3.create(), ca = vec3.create();
    vec3Lerp(ab, a, b, 0.5);
    vec3Lerp(bc, b, c, 0.5);
    vec3Lerp(ca, c, a, 0.5);
    --count;
    divideTriangle(a, ab, ca, count, angle, twistOn, twistDegree);
    divideTriangle(ab, b, bc, count, angle, twistOn, twistDegree);
    divideTriangle(ca, bc, c, count, angle, twistOn, twistDegree);
    divideTriangle(ab, bc, ca, count, angle, twistOn, twistDegree);
  }
}

function tessellaTriangle(a, b, c, angle, twistOn, twistDegree) {
  var zer = vec3.create([0, 0, 0]);
  var rad = angle * Math.PI / 180;
  var twistRad = twistDegree * Math.PI / 180;

  var a_new = vec3.create(), b_new = vec3.create(), c_new = vec3.create();

  if (!twistOn) {
    vec3RotateZ(a_new, a, zer, rad);
    vec3RotateZ(b_new, b, zer, rad);
    vec3RotateZ(c_new, c, zer, rad);
  } else {
    var d_a = Math.hypot(a[0], a[1]);
    var d_b = Math.hypot(b[0], b[1]);
    var d_c = Math.hypot(c[0], c[1]);
    var ta = d_a * twistRad, tb = d_b * twistRad, tc = d_c * twistRad;

    a_new[0] = a[0] * Math.cos(ta) - a[1] * Math.sin(ta);
    a_new[1] = a[0] * Math.sin(ta) + a[1] * Math.cos(ta);
    a_new[2] = 0;
    b_new[0] = b[0] * Math.cos(tb) - b[1] * Math.sin(tb);
    b_new[1] = b[0] * Math.sin(tb) + b[1] * Math.cos(tb);
    b_new[2] = 0;
    c_new[0] = c[0] * Math.cos(tc) - c[1] * Math.sin(tc);
    c_new[1] = c[0] * Math.sin(tc) + c[1] * Math.cos(tc);
    c_new[2] = 0;

    vec3RotateZ(a_new, a_new, zer, rad);
    vec3RotateZ(b_new, b_new, zer, rad);
    vec3RotateZ(c_new, c_new, zer, rad);
  }

  /* 画 3 条边（LINES） */
  points.push.apply(points, a_new);
  points.push.apply(points, b_new);
  points.push.apply(points, b_new);
  points.push.apply(points, c_new);
  points.push.apply(points, c_new);
  points.push.apply(points, a_new);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length / 3);
}
