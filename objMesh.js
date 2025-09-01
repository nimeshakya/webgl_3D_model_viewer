class ObjMesh
{
    constructor()
    {
        this.vertices = []; // vertex positions
        this.face = []; // face vertex indices
        this.texturePos = []; // texture coordinates
        this.textureFac = []; // face texture coordinate indices
        this.normals = []; // surface normals
        this.normalsFac = []; // face surface normal indices
    }
    
    // Read the obj file at the given URL and parse it
    load(url)
    {
        var xhttp = new XMLHttpRequest();
        // Set up a callback for when the request completes
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                parse(xhttp.responseText);
            }
        };
        // Send the request
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    // Parse the contents of obj file
    parse(objdata)
    {
        var lines = objdata.split('\n');
        for (var i = 0; i < lines.length; ++i)
        {
            var line = lines[i].trim(); // Remove whitespace
            var elem = line.split(/\s+/); // split by whitespace
            switch (elem[0][0]) {
                case 'v':
                    switch(elem[0].length) {
                        case 1:
                            this.vertices.push([parseFloat(elem[1]), parseFloat(elem[2]), parseFloat(elem[3])]);
                            break;
                        case 2:
                            switch (elem[0][1]) {
                                case 't':
                                    this.texturePos.push([parseFloat(elem[1]), parseFloat(elem[2])]);
                                    break;
                                case 'n':
                                    this.normals.push([parseFloat(elem[1]), parseFloat(elem[2]), parseFloat(elem[3])]);
                                    break;
                            }
                            break;
                    }
                    break;

                case 'f':
                    var f=[], tf=[], nf=[];
                    for (var j = 1; j < elem.length; ++j) {
                        var ids = elem[j].split('/');
                        var vid = parseInt(ids[0]); // vertex index
                        // convert to positive index
                        if (vid < 0) vid = this.vertices.length + vid + 1; 
                        f.push(vid - 1); // convert to zero-based index
                        if (ids.length > 1 && ids[1] !== "") {
                            var tid = parseInt(ids[1]); // texture index
                            // convert to positive index
                            if (tid < 0) tid = this.texturePos.length + tid + 1; 
                            tf.push(tid - 1); // convert to zero-based index
                        }
                        if (ids.length > 2 && ids[2] !== "") {
                            var nid = parseInt(ids[2]); // normal index
                            // convert to positive index
                            if (nid < 0) nid = this.normals.length + nid + 1; 
                            nf.push(nid - 1); // convert to zero-based index
                        }
                    }
                    this.face.push(f);
                    if (tf.length > 0) this.textureFac.push(tf);
                    if (nf.length > 0) this.normalsFac.push(nf);
                    break;
                
                default:
                    break;
            }
        }
    }

    // Returns bounding box of the object
    getBoundingBox()
    {
        if (this.vertices.length == 0) return null;
        var min = [...this.vertices[0]];
        var max = [...this.vertices[0]];
        for (var i = 1; i < this.vertices.length; ++i) {
            for (var j = 0; j < 3; ++j) {
                if (min[j] > this.vertices[i][j]) min[j] = this.vertices[i][j]; // Update min
                if (max[j] < this.vertices[i][j]) max[j] = this.vertices[i][j]; // Update max   
            }
        }
        return {min: min, max: max};
    }

    // Shift and scale the object
    shiftAndScale(shift, scale)
    {
        for (var i = 0; i < this.vertices.length; ++i) {
            for (var j = 0; j < 3; ++j) {
                this.vertices[i][j] = (this.vertices[i][j] + shift[j]) * scale;
            }
        }
    }

    addTriangleToBuffers(vBuffer, tBuffer, nBuffer, fi, i, j, k)
    {
        var f = this.face[fi];
        var tf = this.textureFac[fi];
        var nf = this.normalsFac[fi];
        this.addTriangleToBuffer(vBuffer, this.vertices, f, i, j, k, this.addVertToBuffer3);
        if (tf.length > 0) {
            this.addTriangleToBuffer(tBuffer, this.texturePos, tf, i, j, k, this.addVertToBuffer2);
        }
        if (nf.length > 0) {
            this.addTriangleToBuffer(nBuffer, this.normals, nf, i, j, k, this.addVertToBuffer3);
        }
    }

    addTriangleToBuffer(buffer, vertex, f, i, j, k, addVert)
    {
        addVert(buffer, vertex, f, i);
        addVert(buffer, vertex, f, j);
        addVert(buffer, vertex, f, k);
    }

    addVertToBuffer3(buffer, vertex, f, i)
    {
        buffer.push(vertex[f[i]][0]);
        buffer.push(vertex[f[i]][1]);
        buffer.push(vertex[f[i]][2]);
    }

    addVertToBuffer2(buffer, vertex, f, i)
    {
        buffer.push(vertex[f[i]][0]);
        buffer.push(vertex[f[i]][1]);
    }

    getVertexBuffers()
    {
        var vBuffer = [];
        var tBuffer = [];
        var nBuffer = [];
        for (var i = 0; i < this.face.length; ++i) {
            if (this.face[i].length < 3) continue;
            this.addTriangleToBuffers(vBuffer, tBuffer, nBuffer, i, 0, 1, 2);
            for (var j = 3; j < this.face[i].length; ++j) {
                this.addTriangleToBuffers(vBuffer, tBuffer, nBuffer, i, 0, j - 1, j);
            }
        }

        return {positionBuffer: vBuffer, texCoordBuffer: tBuffer, normalBuffer: nBuffer};
    }
}