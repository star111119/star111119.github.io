"use strict";

var gl, canvas;
var points = [];
var colors = [];

/* ---- 0.9.5 辅助：手写 lerp & fromValues ---- */
function vec3Lerp(out, a, b, t) {
  for (var i = 0; i < 3; ++i) out[i] = a[i] + t * (b[i] - a[i]);
}
function vec3FromValues(x, y, z) {
  return vec3.create([x, y, z]);
}

/* ---- 入口 ---- */
function initGasket3D(numTimesToSubdivide) {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL 不可用"); return; }

  points = [];
  colors = [];

  var vertices = [
     0.0000,  0.0000, -1.0000,
     0.0000,  0.9428,  0.3333,
    -0.8165, -0.4714,  0.3333,
     0.8165, -0.4714,  0.3333
  ];
  var t = vec3FromValues(vertices[0], vertices[1], vertices[2]);
  var u = vec3FromValues(vertices[3], vertices[4], vertices[5]);
  var v = vec3FromValues(vertices[6], vertices[7], vertices[8]);
  var w = vec3FromValues(vertices[9], vertices[10], vertices[11]);

  divideTetra(t, u, v, w, numTimesToSubdivide);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  /* 顶点 buffer */
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  /* 颜色 buffer */
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  var aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  render();
}

/* ---- 子函数 ---- */
function triangle(a, b, c, color) {
  var baseColors = [1,0,0,1, 0,1,0,1, 0,0,1,1, 0,0,0,1];
  for (var k = 0; k < 4; k++) colors.push(baseColors[color * 4 + k]);
  points.push.apply(points, a);
  for (var k = 0; k < 4; k++) colors.push(baseColors[color * 4 + k]);
  points.push.apply(points, b);
  for (var k = 0; k < 4; k++) colors.push(baseColors[color * 4 + k]);
  points.push.apply(points, c);
}

function tetra(a, b, c, d) {
  triangle(a, c, b, 0); triangle(a, c, d, 1);
  triangle(a, b, d, 2); triangle(b, c, d, 3);
}

function divideTetra(a, b, c, d, count) {
  if (count === 0) { tetra(a, b, c, d); return; }

  var ab = vec3.create(), ac = vec3.create(), ad = vec3.create();
  var bc = vec3.create(), bd = vec3.create(), cd = vec3.create();

  vec3Lerp(ab, a, b, 0.5); vec3Lerp(ac, a, c, 0.5); vec3Lerp(ad, a, d, 0.5);
  vec3Lerp(bc, b, c, 0.5); vec3Lerp(bd, b, d, 0.5); vec3Lerp(cd, c, d, 0.5);

  --count;
  divideTetra(a, ab, ac, ad, count);
  divideTetra(ab, b, bc, bd, count);
  divideTetra(ac, bc, c, cd, count);
  divideTetra(ad, bd, cd, d, count);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
}
