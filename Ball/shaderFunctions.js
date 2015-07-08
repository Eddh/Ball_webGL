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
    shaderProgram.sphereNormalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.lightPosUniform = gl.getUniformLocation(shaderProgram, "uLightPos");
    shaderProgram.viewPosUniform = gl.getUniformLocation(shaderProgram, "uViewPos");
    shaderProgram.botNormalMatrixUniform = gl.getUniformLocation(shaderProgram, "uBotNMatrix");
    
}
function initUniforms(){
    
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    mat4.identity(sphereModelMatrix);
    mat4.translate(sphereModelMatrix, [0, ySphere, 0]);
    mat4.identity(squareModelMatrix);
    
    camRight = vec3.normalize(vec3.cross(camUp, camDirection, camRight));
    camDirection[0] = Math.cos(degToRad(camYaw));
    camDirection[2] = Math.sin(degToRad(camYaw));
    mat4.lookAt(camPos, camTarget, camUp, viewMatrix);
    
    mat4.multiply(viewMatrix, sphereModelMatrix, sphereMvMatrix);
    mat4.toInverseMat3(sphereModelMatrix, sphereNormalMatrix);
    sphereNormalMatrix = mat3.transpose(sphereNormalMatrix);
    
    // botSphereModelMatrix is used to calculate the normal matrix for the bottom half of the ball, which is scaled vertically during the bounce,
    // and thus requires a different normal matrix.
    mat4.set(sphereModelMatrix, botSphereModelMatrix);
    mat4.scale(botSphereModelMatrix, [1, ySphere, 1], botSphereModelMatrix);
    
    mat4.toInverseMat3(botSphereModelMatrix, botNormalMatrix);
    botNormalMatrix = mat3.transpose(botNormalMatrix);
    
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, sphereModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.sphereNormalMatrixUniform, false, sphereNormalMatrix);
    gl.uniform3fv(shaderProgram.lightPosUniform, lightPos);
    gl.uniform3fv(shaderProgram.viewPosUniform, camPos);
    
}
function setMVUniformsSphere(){
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, sphereModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.sphereNormalMatrixUniform, false, sphereNormalMatrix);
    gl.uniformMatrix3fv(shaderProgram.botNormalMatrixUniform, false, botNormalMatrix);
}
function setMVUniformsSquare(){
    gl.uniformMatrix4fv(shaderProgram.sphereModelMatrixUniform, false, squareModelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.sphereNormalMatrixUniform, false, squareNormalMatrix);
}
function setLightDirUniform(){
    gl.uniform3fv(shaderProgram.lightDirUniform, lightDir);
}
function updateNormalMatrix(){
    mat4.multiply(viewMatrix, sphereModelMatrix, sphereMvMatrix);
    mat4.toInverseMat3(sphereModelMatrix, sphereNormalMatrix);
    sphereNormalMatrix = mat3.transpose(sphereNormalMatrix);
    
    mat4.set(sphereModelMatrix, botSphereModelMatrix);
    mat4.scale(botSphereModelMatrix, [1, ySphere, 1], botSphereModelMatrix);
    mat4.toInverseMat3(botSphereModelMatrix, botNormalMatrix);
    botNormalMatrix = mat3.transpose(botNormalMatrix);
    
    mat4.multiply(viewMatrix, squareModelMatrix, squareMvMatrix);
    mat4.toInverseMat3(squareNormalMatrix, squareNormalMatrix);
    squareNormalMatrix = mat3.transpose(squareNormalMatrix);
}