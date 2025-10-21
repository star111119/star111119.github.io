"use strict";
var canvas, gl;
var theta = 0.0, thetaLoc;
var direction = 1, speed = 50;

/* 新增缩放/平移变量 */
var sx = 1.0, tx = 0.0, ty = 0.0;
var sxLoc, txLoc, tyLoc;

function changeDir(){ direction *= -1; }

function initRotSquare(){
    canvas = document.getElementById("rot-canvas");
    gl = canvas.getContext("webgl2");
    if(!gl){ alert("WebGL 2.0 not available"); return; }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "rot-v-shader", "rot-f-shader");
    gl.useProgram(program);

    /* 顶点数据 */
    var vertices = new Float32Array([
         0,  1, 0,
        -1,  0, 0,
         1,  0, 0,
         0, -1, 0
    ]);
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    /* uniform 位置 */
    thetaLoc = gl.getUniformLocation(program, "theta");
    sxLoc  = gl.getUniformLocation(program, "sx");
    txLoc  = gl.getUniformLocation(program, "tx");
    tyLoc  = gl.getUniformLocation(program, "ty");

    /* 控件回调 */
    document.getElementById("speedcon").oninput = function(e){
        speed = 100 - e.target.value;
    };
    document.getElementById("scale").oninput = function(e){
        sx = e.target.value / 100;   // 0.5 ~ 2.0
    };
    document.getElementById("offX").oninput = function(e){
        tx = e.target.value / 100;   // -1 ~ 1
    };
    document.getElementById("offY").oninput = function(e){
        ty = e.target.value / 100;   // -1 ~ 1
    };

    renderSquare();
}

function renderSquare(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += direction * 0.1;
    gl.uniform1f(thetaLoc, theta);

    /* 送缩放/平移值 */
    gl.uniform1f(sxLoc, sx);
    gl.uniform1f(txLoc, tx);
    gl.uniform1f(tyLoc, ty);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(function(){ requestAnimationFrame(renderSquare); }, speed);
}
