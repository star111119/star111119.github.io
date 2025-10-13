"use strict";

var gl;
var points = [];

function initGasket(canvas, numTimesToSubdivide) {
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL 不可用"); return; }

  points = [];

  /* 0.9.5 没有 fromValues，用 create+数组 */
  var vertices = [-1, -1, 0,  0, 1, 0,  1, -1, 0];
  var u = vec3.create([vertices[0], vertices[1], vertices[2]]);
  var v = vec3.create([vertices[3], vertices[4], vertices[5]]);
  var w = vec3.create([vertices[6], vertices[7], vertices[8]]);

  divideTriangle(u, v, w, numTimesToSubdivide);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
}

function triangle(a, b, c) {
  points.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
}

/* 0.9.5 没有 vec3.lerp，自己算 */
function vec3Lerp(out, a, b, t) {
  for (var i = 0; i < 3; ++i) out[i] = a[i] + t * (b[i] - a[i]);
}

function divideTriangle(a, b, c, count) {
  if (count === 0) { triangle(a, b, c); return; }

  var ab = vec3.create(), bc = vec3.create(), ca = vec3.create();
  vec3Lerp(ab, a, b, 0.5);
  vec3Lerp(bc, b, c, 0.5);
  vec3Lerp(ca, c, a, 0.5);

  --count;
  divideTriangle(a, ab, ca, count);
  divideTriangle(b, bc, ab, count);
  divideTriangle(c, ca, bc, count);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
}
