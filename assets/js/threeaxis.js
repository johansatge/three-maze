var threeaxis = function(scene, length)
{
    create(scene, v(-length, 0, 0), v(0, 0, 0), 0x333333);
    create(scene, v(0, 0, 0), v(length, 0, 0), 0xFF0000);

    create(scene, v(0, -length, 0), v(0, 0, 0), 0x333333);
    create(scene, v(0, 0, 0), v(0, length, 0), 0x00FF00);

    create(scene, v(0, 0, -length), v(0, 0, 0), 0x333333);
    create(scene, v(0, 0, 0), v(0, 0, length), 0x0000FF);

    function v(x,y,z)
    {
        return new THREE.Vector3(x,y,z);
    }

    function create(scene, from, to, color)
    {
        var geometry =  new THREE.Geometry();
        var material =  new THREE.LineBasicMaterial({color: color, lineWidth: 1});
        geometry.vertices.push(from, to);
        scene.add(new THREE.Line(geometry, material));
    }
};