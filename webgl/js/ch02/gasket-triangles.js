"use strict";

var canvas, gl;
var points = [];

// 主入口：由 gasket.html 调用
function initGasket(numTimesToSubdivide) {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) { alert("WebGL 2.0 不可用"); return; }

  points = []; // 清空历史顶点

  const vertices = [-1, -1, 0,  0, 1, 0,  1, -1, 0];
  const u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
  const v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
  const w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);

  divideTriangle(u, v, w, numTimesToSubdivide);

  // WebGL 初始化
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
}

function triangle(a, b, c) {
  points.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
}

function divideTriangle(a, b, c, count) {
  if (count === 0) { triangle(a, b, c); return; }
  const ab = vec3.create(), bc = vec3.create(), ca = vec3.create();
  vec3.lerp(ab, a, b, 0.5);
  vec3.lerp(bc, b, c, 0.5);
  vec3.lerp(ca, c, a, 0.5);
  --count;
  divideTriangle(a, ab, ca, count);
  divideTriangle(b, bc, ab, count);
  divideTriangle(c, ca, bc, count);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
}
