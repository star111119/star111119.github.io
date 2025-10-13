"use strict";

var gl, canvas;
var points = [];

/* 外部入口：level=0-7, angle=整体旋转°, twistOn=是否扭曲, twistDegree=扭曲强度° */
function initTessa(level, angle, twistOn, twistDegree) {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) { alert("WebGL 2.0 不可用"); return; }

  points = [];
  const radius = 1.0;
  const rad = Math.PI / 180;

  // 初始等边三角形
  const vertices = [
    radius * Math.cos(90 * rad),  radius * Math.sin(90 * rad),  0,
    radius * Math.cos(210 * rad), radius * Math.sin(210 * rad), 0,
    radius * Math.cos(-30 * rad), radius * Math.sin(-30 * rad), 0
  ];
  const a = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
  const b = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
  const c = vec3.fromValues(vertices[6], vertices[7], vertices[8]);

  divideTriangle(a, b, c, level, angle, twistOn, twistDegree);

  // ******* 首次初始化：程序 + attribute 位置 *******
  if (!initTessa.program) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
    initTessa.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(initTessa.program);
    initTessa.vPosition = gl.getAttribLocation(initTessa.program, "vPosition");
    gl.enableVertexAttribArray(initTessa.vPosition);

    initTessa.vBuffer = gl.createBuffer(); // 只创建一次
  }

  // ******* 每次数据更新后：上传 + 指定指针 *******
  gl.bindBuffer(gl.ARRAY_BUFFER, initTessa.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.vertexAttribPointer(initTessa.vPosition, 3, gl.FLOAT, false, 0, 0);

  render();
}

/* ---------------- 以下逻辑几乎不变 ---------------- */
function divideTriangle(a, b, c, count, angle, twistOn, twistDegree) {
  if (count === 0) {
    tessellaTriangle(a, b, c, angle, twistOn, twistDegree);
  } else {
    const ab = vec3.create(), bc = vec3.create(), ca = vec3.create();
    vec3.lerp(ab, a, b, 0.5);
    vec3.lerp(bc, b, c, 0.5);
    vec3.lerp(ca, c, a, 0.5);
    --count;
    divideTriangle(a, ab, ca, count, angle, twistOn, twistDegree);
    divideTriangle(ab, b, bc, count, angle, twistOn, twistDegree);
    divideTriangle(ca, bc, c, count, angle, twistOn, twistDegree);
    divideTriangle(ab, bc, ca, count, angle, twistOn, twistDegree);
  }
}

function tessellaTriangle(a, b, c, angle, twistOn, twistDegree) {
  const zer = vec3.create();
  vec3.zero(zer);
  const rad = angle * Math.PI / 180;
  const twistRad = twistDegree * Math.PI / 180;

  const a_new = vec3.create(), b_new = vec3.create(), c_new = vec3.create();

  if (!twistOn) {
    vec3.rotateZ(a_new, a, zer, rad);
    vec3.rotateZ(b_new, b, zer, rad);
    vec3.rotateZ(c_new, c, zer, rad);
  } else {
    const d_a = Math.hypot(a[0], a[1]);
    const d_b = Math.hypot(b[0], b[1]);
    const d_c = Math.hypot(c[0], c[1]);
    const ta = d_a * twistRad, tb = d_b * twistRad, tc = d_c * twistRad;

    vec3.set(a_new,
      a[0] * Math.cos(ta) - a[1] * Math.sin(ta),
      a[0] * Math.sin(ta) + a[1] * Math.cos(ta), 0);
    vec3.set(b_new,
      b[0] * Math.cos(tb) - b[1] * Math.sin(tb),
      b[0] * Math.sin(tb) + b[1] * Math.cos(tb), 0);
    vec3.set(c_new,
      c[0] * Math.cos(tc) - c[1] * Math.sin(tc),
      c[0] * Math.sin(tc) + c[1] * Math.cos(tc), 0);

    // 再整体旋转
    vec3.rotateZ(a_new, a_new, zer, rad);
    vec3.rotateZ(b_new, b_new, zer, rad);
    vec3.rotateZ(c_new, c_new, zer, rad);
  }

  // 画 3 条边（LINES）
  points.push(a_new[0], a_new[1], a_new[2]);
  points.push(b_new[0], b_new[1], b_new[2]);
  points.push(b_new[0], b_new[1], b_new[2]);
  points.push(c_new[0], c_new[1], c_new[2]);
  points.push(c_new[0], c_new[1], c_new[2]);
  points.push(a_new[0], a_new[1], a_new[2]);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, points.length / 3);
}
