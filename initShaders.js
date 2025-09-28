function initShaders(gl, vsId, fsId) {
  var vs = document.getElementById(vsId).text;
  var fs = document.getElementById(fsId).text;
  var program = gl.createProgram();
  function load(t, s) {
    var sh = gl.createShader(t);
    gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
      throw gl.getShaderInfoLog(sh);
    return sh;
  }
  gl.attachShader(program, load(gl.VERTEX_SHADER,   vs));
  gl.attachShader(program, load(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw gl.getProgramInfoLog(program);
  return program;
}
