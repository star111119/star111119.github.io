function createGLContext(canvas) {
  var gl = canvas.getContext("webgl2");
  if (!gl) { alert("WebGL 2.0 not available"); }
  return gl;
}
