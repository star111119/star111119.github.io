"use strict";
const { vec3 } = glMatrix;

var gl, canvas;
var points = [];
var colors = [];

// 外部入口
function initGasket3D(numTimesToSubdivide) {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) { alert("WebGL 2.0 不可用"); return; }

  points = [];
  colors = [];

  const vertices = [
     0.0000,  0.0000, -1.0000,
     0.0000,  0.9428,  0.3333,
    -0.8165, -0.4714,  0.3333,
     0.8165, -0.4714,  0.3333
  ];
  const t = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
  const u = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
  const v = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
  const w = vec3.fromValues(vertices[9], vertices[10], vertices[11]);

  divideTetra(t, u, v, w, numTimesToSubdivide);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // 顶点 buffer
  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // 颜色 buffer
  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  const aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  render();
}

// ---------------- 以下与原文件相同 ---------------- //
function triangle(a, b, c, color) {
  const baseColor = [
    1,0,0,1,  0,1,0,1,  0,0,1,1,  0,0,0,1
  ];
  for (let k = 0; k < 4; k++) colors.push(baseColor[color * 4 + k]);
  for (let k = 0; k < 3; k++) points.push(a[k]);
  for (let k = 0; k < 4; k++) colors.push(baseColor[color * 4 + k]);
  for (let k = 0; k < 3; k++) points.push(b[k]);
  for (let k = 0; k < 4; k++) colors.push(baseColor[color * 4 + k]);
  for (let k = 0; k < 3; k++) points.push(c[k]);
}
function tetra(a, b, c, d) {
  triangle(a, c, b, 0); triangle(a, c, d, 1);
  triangle(a, b, d, 2); triangle(b, c, d, 3);
}
function divideTetra(a, b, c, d, count) {
  if (count === 0) { tetra(a, b, c, d); return; }
  const ab = vec3.create(), ac = vec3.create(), ad = vec3.create();
  const bc = vec3.create(), bd = vec3.create(), cd = vec3.create();
  vec3.lerp(ab, a, b, 0.5); vec3.lerp(ac, a, c, 0.5); vec3.lerp(ad, a, d, 0.5);
  vec3.lerp(bc, b, c, 0.5); vec3.lerp(bd, b, d, 0.5); vec3.lerp(cd, c, d, 0.5);
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
