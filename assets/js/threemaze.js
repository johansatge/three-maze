
/**
 * Maze class
 * @param $element
 */
function threemaze($element)
{
    // Object attributes
    this.$element =         $element;
    this.camera =           {};
    this.cameraHelper =     {};
    this.scene =            {};
    this.materials =        {};
    this.map =              [];
    this.renderer =         {};
    this.player =           {};
    this.side =             31;
    this.thickness =        20;

    // Inits
    this.initScene();
    this.onWindowResize();
    this.render();

    // Events
    // @todo disable events when generating a maze
    this.$element.on('mousemove', $.proxy(this,'onMouseMove'));
    this.$element.on('mousedown', $.proxy(this, 'onMouseDown'));
    this.$element.on('mouseup', $.proxy(this, 'onMouseUp'));
    this.$element.find('.generate').on('click', $.proxy(this, 'onGenerateMaze')).trigger('click');
    $(window).on('resize', $.proxy(this, 'onWindowResize'));
    $(document).on('keydown', $.proxy(this, 'onKeyDown'));
};

/**
 * Generates a new maze
 * Loops into the maze, removes old blocks and adds new ones
 */
threemaze.prototype.onGenerateMaze = function()
{
    var new_map =                   this.generateMaze(this.side);
    var new_player_path =           [];
    var target_show_properties =    {scale: 1, y: this.thickness / 2};
    var target_hide_properties =    {scale: 0, y: 0};
    var target_path_hide =          {scale: 0, y: this.thickness * 5};
    var delay =                     0;
    var self =                      this;
    for (var x = this.side; x > 0; x -= 1)
    {
        new_player_path[x] = [];
        for (var y = 1;y < this.side + 1; y += 1)
        {
            // Inits player path
            new_player_path[x][y] = false;

            // Removes old mesh if needed
            if (typeof this.map[x] != 'undefined' && typeof this.map[x][y] != 'undefined' && typeof this.map[x][y] == 'object')
            {
                // Builds the related tween
                var tween = new TWEEN.Tween({scale: 1, y: this.thickness / 2, mesh: this.map[x][y]}).to(target_hide_properties, 200).delay(delay);
                tween.onUpdate(function()
                {
                    this.mesh.scale.y =     this.scale;
                    this.mesh.position.y =  this.y;
                });
                tween.onComplete(function()
                {
                    this.mesh.visible = false;
                    self.scene.remove(this.mesh);
                });
                tween.start();
            }

            // Removes player path if needed
            if (typeof this.player.path != 'undefined' && typeof this.player.path[x] != 'undefined' && typeof this.player.path[x][y] != 'undefined' && typeof this.player.path[x][y] == 'object')
            {
                // Builds the related tween
                var tween = new TWEEN.Tween({scale: 1, y: this.thickness / 8, mesh: this.player.path[x][y]}).to(target_path_hide, 200).delay(delay);
                tween.onUpdate(function()
                {
                    this.mesh.scale.set(this.scale, this.scale, this.scale);
                    this.mesh.position.y =  this.y;
                });
                tween.onComplete(function()
                {
                    self.scene.remove(this.mesh);
                });
                tween.start();
            }

            // Adds a new mesh if needed
            if (new_map[x][y] == 0)
            {
                // Generates the mesh
                var wall_geometry =     new THREE.CubeGeometry(this.thickness, this.thickness, this.thickness, 1, 1, 1);
                new_map[x][y] =         new THREE.Mesh(wall_geometry, this.materials.grey);
                new_map[x][y].scale.y = 0;
                new_map[x][y].visible = false;
                new_map[x][y].position.set(x * this.thickness - ((this.side * this.thickness) / 2), 0, y * 20 - ((this.side * this.thickness) / 2));
                this.scene.add(new_map[x][y]);

                // Builds the related tween
                var tween = new TWEEN.Tween({scale: 0, y: 0, mesh: new_map[x][y]}).to(target_show_properties, 200).delay(delay);
                tween.onUpdate(function()
                {
                    this.mesh.scale.y =     this.scale;
                    this.mesh.position.y =  this.y;
                });
                tween.onStart(function()
                {
                    this.mesh.visible = true;
                });
                tween.start();
            }
            else
            {
                new_map[x][y] = false;
            }
        }
        delay += 50;
    }
    this.map = new_map;
    this.player.path = new_player_path;
    this.initPlayer();
};

/**
 * Inits the scene
 */
threemaze.prototype.initScene = function()
{
    // Scene
    this.scene = new THREE.Scene();

    // Materials
    this.materials =
    {
        grey:   new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false}),
        red:    new THREE.LineBasicMaterial({color: 0xcb4e4e, lineWidth: 1})
    };

    // Camera
    this.camera =            new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.camera.angles =     {horizontal: 0, vertical: 0};
    this.camera.clicked =    false;

    // Lights
    this.scene.add(new THREE.AmbientLight(0x999999));
    var directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(0, 0.5, 1);
    this.scene.add(directional);

    // Player
    this.player =                   new THREE.Object3D();
    var player_material =           this.materials.red;
    var head_mesh =                 new THREE.Mesh(new THREE.SphereGeometry(this.thickness / 2, 9, 9), player_material);
    var body_mesh =                 new THREE.Mesh(new THREE.CylinderGeometry(this.thickness / 6, this.thickness / 2, this.thickness * 1.5, 12, 1), player_material);
    this.player.add(head_mesh);
    this.player.add(body_mesh);
    head_mesh.position.y = this.thickness * 1.5;
    body_mesh.position.y = this.thickness;
    this.scene.add(this.player);

    // Camera helper
    var geometry =  new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.sqrt(3) * (this.side * this.thickness)), 0, 0);
    this.cameraHelper = new THREE.Line(geometry);
    this.scene.add(this.cameraHelper);
    this.cameraHelper.visible =         false;
    this.cameraHelper.targetRotation =  false;
    this.cameraHelper.rotation.x =      0;
    this.cameraHelper.rotation.y =      1.362275;
    this.cameraHelper.rotation.z =      0.694716;

    // Renderer
    this.renderer = typeof WebGLRenderingContext != 'undefined' && window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer({});
    this.$element.append(this.renderer.domElement);
};

/**
 * Inits the player
 * @todo move the player back to origin when generating a new maze
 */
threemaze.prototype.initPlayer = function()
{
    this.player.mazePosition = {x: this.side - 1, z: this.side - 1};
    this.movePlayer();
};

/**
 * Keydown action
 * @param evt
 */
threemaze.prototype.onKeyDown = function(evt)
{
    // Gets the direction depending on the pressed key
    var code = evt.keyCode;
    var direction = {x: 0, z: 0};
    var directions =
    {
        37: {x: 1, z: 0},
        39: {x: -1, z: 0},
        38: {x: 0, z: 1},
        40: {x: 0, z: -1}
    };
    if (typeof directions[code] != 'undefined')
    {
        direction = directions[code];
    }

    var x = this.player.mazePosition.x;
    var z = this.player.mazePosition.z;
    var target_block = this.map[x + direction.x][z + direction.z];
    if (target_block === false)
    {
        // If the player moves forward, adds a block to the path
        if (this.player.path[x + direction.x][z + direction.z] === false)
        {
            // Builds the mesh
            this.player.path[x][z] = new THREE.Mesh(new THREE.CubeGeometry(this.thickness, this.thickness / 4, this.thickness, 1, 1, 1),  this.materials.red);
            this.player.path[x][z].position.set(this.player.position.x, this.thickness * 5, this.player.position.z);
            this.player.path[x][z].scale.set(0, 0, 0);
            this.scene.add(this.player.path[x][z]);

            // Builds the related tween
            var target_properties = {scale: 1, y: this.thickness / 8};
            var tween =             new TWEEN.Tween({scale: 0, y: this.thickness * 5, mesh: this.player.path[x][z]}).to(target_properties, 400);
            tween.onUpdate(function()
            {
                this.mesh.scale.set(this.scale, this.scale, this.scale);
                this.mesh.position.y =  this.y;
            });
            tween.start();
        }
        // If he goes back, removes one
        else
        {
            this.scene.remove(this.player.path[x + direction.x][z + direction.z]);
            this.player.path[x + direction.x][z + direction.z] = false;
        }

        // Updates the player position
        this.player.mazePosition.x += direction.x;
        this.player.mazePosition.z += direction.z;

        this.movePlayer();
    }
};

/**
 * Moves the player depending on its position on the maze
 */
threemaze.prototype.movePlayer = function()
{
    this.player.position.x = -((this.side * this.thickness) / 2) + this.player.mazePosition.x * this.thickness;
    this.player.position.z = -((this.side * this.thickness) / 2) + this.player.mazePosition.z * this.thickness;
};

/**
 * Moving the mouse over the container: sets a target rotation for the camera helper
 * @param evt
 */
threemaze.prototype.onMouseMove = function(evt)
{
    if (this.camera.clicked !== false)
    {
        var target_rotation = {};
        target_rotation.z = this.cameraHelper.rotation.z + ((evt.pageY - this.camera.clicked.y) / 800);
        if (target_rotation.z < 0)
        {
            target_rotation.z = 0;
        }
        if (target_rotation.z > (Math.PI / 2) - 0.1)
        {
            target_rotation.z = Math.PI / 2 - 0.1;
        }
        target_rotation.y = this.cameraHelper.rotation.y + ((this.camera.clicked.x - evt.pageX) / 800);
        this.cameraHelper.targetRotation = target_rotation;
    }
};

/**
 * Mouse down: starts dragging the maze
 * @param evt
 */
threemaze.prototype.onMouseDown = function(evt)
{
    evt.preventDefault();
    this.camera.clicked = {x: evt.pageX, y: evt.pageY};
};

/**
 * Mouse up: stops dragging the maze
 * @param evt
 */
threemaze.prototype.onMouseUp = function(evt)
{
    evt.preventDefault();
    this.camera.clicked = false;
};

/**
 * Render loop
 * Sets the camera position and renders the scene
 */
threemaze.prototype.render = function()
{
    requestAnimationFrame($.proxy(this, 'render'));
    TWEEN.update();
    if (this.cameraHelper.targetRotation !== false)
    {
        this.cameraHelper.rotation.z += (this.cameraHelper.targetRotation.z - this.cameraHelper.rotation.z) / 10;
        this.cameraHelper.rotation.y += (this.cameraHelper.targetRotation.y - this.cameraHelper.rotation.y) / 10;
    }
    var camera_position = this.cameraHelper.geometry.vertices[1].clone().applyProjection(this.cameraHelper.matrixWorld);
    this.camera.position = camera_position;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
};

/**
 * Sets the scene dimensions on window resize
 */
threemaze.prototype.onWindowResize = function()
{
    var $window = $(window);
    this.renderer.setSize($window.width(), $window.height());
    this.camera.aspect = $window.width() / $window.height();
    this.camera.updateProjectionMatrix();
};
