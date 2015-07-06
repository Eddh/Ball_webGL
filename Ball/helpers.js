// helpers.js

function display(string){
    var content = document.getElementById('text');
    document.getElementById('text').innerHTML = string;
}
function getVertex(vertices, index){
    var v = [];
    v[0] = vertices[index*3];
    v[1] = vertices[index*3+1];
    v[2] = vertices[index*3+2];
    return v;
}
function setVertex(vertex, vertices, numVertex){
    vertices.push(vertex[0]);
    vertices.push(vertex[1]);
    vertices.push(vertex[2]);
}
function addVertices(v1, v2){
    var v = [];
    v[0] = v1[0] + v2[0];
    v[1] = v1[1] + v2[1];
    v[2] = v1[2] + v2[2];
    return v;
}
function icosahedronVertices(){
    var X = 0.525731112119133606;
    var Z = 0.850650808352039932;
    var vertices = [
        -X, 0, Z,
        X, 0, Z,
        -X, 0, -Z,
        X, 0, -Z,
        0, Z, X,
        0, Z, -X,
        0, -Z, X,
        0, -Z, -X,
        Z, X, 0,
        -Z, X, 0,
        Z, -X, 0,
        -Z, -X, 0,
    ];
    return vertices;
}

function icosahedronIndices(){
    var indices  = [
        0, 4, 1,
        0, 9, 4,
        9, 5, 4,
        4, 5, 8,
        4, 8, 1,
        8, 10, 1,
        8, 3, 10,
        5, 3, 8,
        5, 2, 3,
        2, 7, 3,
        7, 10, 3,
        7, 6, 10,
        7, 11, 6,
        11, 0, 6,
        0, 1, 6,
        6, 1, 10,
        9, 0, 11,
        9, 11, 2,
        9, 2, 5,
        7, 2, 11
    ];
    indices.size = 60;
    indices.nbTriangles = 20;
    return indices;
}
function icosphereColors(nbSubdivs, vertices){
    var colors = [];
    for(var i = 0 ; i < vertices.nbVertices ; i++){
        
        colors.push(Math.random());
        colors.push(Math.random());
        colors.push(Math.random());
        
        // colors.push(0.2);
        // colors.push(0.5);
        // colors.push(0.5);
        colors.push(1);
    }
    return colors;
}
function icoSphere(refVertices, refIndices, refColors, nbSubdivs){
    var vertices = icosahedronVertices();
    var indices  = icosahedronIndices();
    var outVertices = [];
    var outIndices = [];
    var outColors = [];
    
    for (var i = 0 ; i < nbSubdivs ; i++){
        
        for(var j = 0 ; j < indices.nbTriangles ; j++){
            var v1, v2, v3, v4, v5, v6;
            v1 = getVertex(vertices, indices[j*3]);
            v2 = getVertex(vertices, indices[j*3+1]);
            v3 = getVertex(vertices, indices[j*3+2]);
            
            v4 = addVertices(v1, v2);
            v5 = addVertices(v2, v3);
            v6 = addVertices(v1, v3);
            vec3.normalize(v4, v4);
            vec3.normalize(v5, v5);
            vec3.normalize(v6, v6);
            vec3.normalize(v1, v1);
            vec3.normalize(v2, v2);
            vec3.normalize(v3, v3);
            
            setVertex(v1, outVertices, j*6);
            setVertex(v2, outVertices, j*6+1);
            setVertex(v3, outVertices, j*6+2);
            setVertex(v4, outVertices, j*6+3);
            setVertex(v5, outVertices, j*6+4);
            setVertex(v6, outVertices, j*6+5);
            
            outIndices[j*12] = j*6;
            outIndices[j*12+1] = j*6+3;
            outIndices[j*12+2] = j*6+5;
            outIndices[j*12+3] = j*6+3;
            outIndices[j*12+4] = j*6+4;
            outIndices[j*12+5] = j*6+5;
            outIndices[j*12+6] = j*6+3;
            outIndices[j*12+7] = j*6+1;
            outIndices[j*12+8] = j*6+4;
            outIndices[j*12+9] = j*6+4;
            outIndices[j*12+10] = j*6+2;
            outIndices[j*12+11] = j*6+5;
        }
        vertices = outVertices;
        indices = outIndices;
        indices.nbTriangles = 20*Math.pow(4, i+1);
        outVertices = [];
    }
    indices.nbTriangles = 20*Math.pow(4, nbSubdivs);
    vertices.nbVertices = indices.nbTriangles*6/4;
    colors = icosphereColors(nbSubdivs, vertices);
    colors.nbColors = vertices.nbVertices;
    
    refVertices.valueOf = vertices;
    refIndices.valueOf = indices;
    refColors.valueOf = colors;
}

function bufferIcosphere(nbSubdivs){
    var sphereVertices = [], sphereIndices = [], sphereColors = [];
    sphereVertices = Object(sphereVertices);
    sphereIndices = Object(sphereIndices);
    sphereColors = Object(sphereColors);
    icoSphere(sphereVertices, sphereIndices, sphereColors, nbSubdivs);
    sphereVertices = sphereVertices.valueOf;
    sphereIndices = sphereIndices.valueOf;
    sphereColors = sphereColors.valueOf;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
    sphereVertexArrayBuffer.itemSize = 3;
    sphereVertexArrayBuffer.numItems = sphereVertices.nbVertices;
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(sphereIndices), gl.STATIC_DRAW);
    sphereIndexBuffer.itemSize = 1;
    sphereIndexBuffer.numItems = sphereIndices.nbTriangles*3;
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereColors), gl.STATIC_DRAW);
    sphereColorBuffer.itemSize = 4;
    sphereColorBuffer.numItems = sphereColors.nbColors;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    nbTriangles = sphereIndices.nbTriangles;
    // var msg = "nbVertices : "+sphereVertices.nbVertices + " nbTriangles : " + sphereIndices.nbTriangles;
    // alert(msg);
}