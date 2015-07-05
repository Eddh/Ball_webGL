// shaderFunctions.js

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript){
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k){
        if (k.nodeType == 3){
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    var shader;
    if (shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if (shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else{
        return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader)+id);
        return null;
    }
    return shader;
}

function initShaders(){
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.sphereModelMatrixUniform = gl.getUniformLocation(shaderProgram, "uModel");
    shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, "uView");
    shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.lightDirUniform = gl.getUniformLocation(shaderProgram, "uLightDir");
    shaderProgram.viewPosUniform = gl.getUniformLocation(shaderProgram, "uViewPos")
    
}
function initUniforms(){
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    mat4.identity(sphereModelMatrix);
    mat4.translate(sphereModelMatrix, [0, ySphere, 0]);
    mat4.identity(squareModelMatrix);
    
    mat4.identity(viewMatrix);
    mat4.translate(viewMatrix, [0, -2, -8]);
    
    // mat4.identity(sphereMvMatrix);
    // mat4.translate(sphereMvMatrix, [0, 0, -8]);
    
    
    
    // var msg = " ";
    // for(var i = 0 ; i < 16 ; i++){
        // msg += " "+sphereMvMatrix[i]+" ";
    // }
    // alert(msg);
    mat4.multiply(viewMatrix, sphereModelMatrix, sphereMvMatrix);
    mat4.toInverseMat3(sphereMvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, sphereModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, normalMatrix);
    gl.uniform3fv(shaderProgram.lightDirUniform, lightDir);
    gl.uniform3fv(shaderProgram.viewPosUniform, viewPos);
}
function setMVUniformsSphere(){
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, sphereModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, normalMatrix);
}
function setMVUniformsSquare(){
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, squareModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, squareNormalMatrix);
}
function setLightDirUniform(){
    gl.uniform3fv(shaderProgram.lightDirUniform, lightDir);
}
function updateNormalMatrix(){
    mat4.multiply(viewMatrix, sphereModelMatrix, sphereMvMatrix);
    mat4.toInverseMat3(sphereMvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    
    mat4.multiply(viewMatrix, squareModelMatrix, squareMvMatrix);
    mat4.toInverseMat3(squareMvMatrix, squareNormalMatrix);
    mat3.transpose(squareNormalMatrix);
}