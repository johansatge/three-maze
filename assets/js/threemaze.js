
function threemaze($element)
{
    // Object attributes
    this.$element =         $element;
    this.camera =           {};
    this.scene =            {};
    this.renderer =         {};
    this.mouseClicked =     false;

    // Events
    this.$element.on('mousemove', $.proxy(this,'onMouseMove'));
    this.$element.on('mousedown', $.proxy(this, 'onMouseDown'));
    this.$element.on('mouseup', $.proxy(this, 'onMouseUp'));
    $(window).on('resize', $.proxy(this, 'onWindowResize'));

    // Inits
    this.initScene();
    this.initObjects();
    this.onWindowResize();
    this.updateCamera();
    this.render();

    // @todo à refactorer
    threeaxis(this.scene, 400);
};

/**
 * Inits objects
 */
threemaze.prototype.initObjects = function()
{
    var the_size = 21;
    var map = this.generateMaze(the_size);
    for (var x = 1; x < the_size + 1; x += 1)
    {
        for (var y = 1;y < the_size + 1; y += 1)
        {
            if (map[x][y] == 0)
            {
                var wall_geometry = new THREE.CubeGeometry(20, 30, 20, 1, 1, 1);
                var material = new THREE.MeshLambertMaterial({color: 0xff99ff, wireframe: false});
                var wall_mesh = new THREE.Mesh(wall_geometry, material);
                wall_mesh.position.set(x * 20 - ((the_size * 20) / 2), 15, y * 20 - ((the_size * 20) / 2));
                this.scene.add(wall_mesh);
            }
        }
    }
};

/**
 * Inits the scene
 */
threemaze.prototype.initScene = function()
{
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera =               new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.camera.angles =        {horizontal: 0, vertical: 0};
    this.camera.acceleration =  false;

    // Lights
    var ambient = new THREE.AmbientLight(0x999999);
    this.scene.add(ambient);
    var directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(0, 0.5, 1);
    this.scene.add(directional);

    // Materials
    var black_material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});
    var white_material = new THREE.MeshLambertMaterial({color: 0xe3ded0, wireframe: false});
    this.materials = {'atomes': black_material, 'centre': white_material};

    // Renderer
    if (typeof WebGLRenderingContext != 'undefined' && window.WebGLRenderingContext)
    {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
    }
    else
    {
        this.renderer = new THREE.CanvasRenderer({});
    }

    this.$element.append(this.renderer.domElement);
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

/**
 * Moving the mouse over the container
 * @param evt
 */
threemaze.prototype.onMouseMove = function(evt)
{
    if (this.mouseClicked !== false)
    {
        this.camera.acceleration = {horizontal: (evt.pageX - this.mouseClicked.x) / 5000, vertical: (this.mouseClicked.y - evt.pageY) / 5000};
    }
};

threemaze.prototype.onMouseDown = function(evt)
{
    evt.preventDefault();
    this.mouseClicked = {x: evt.pageX, y: evt.pageY};
    this.camera.acceleration = {horizontal: 0, vertical: 0};
};

threemaze.prototype.onMouseUp = function(evt)
{
    evt.preventDefault();
    this.mouseClicked = false;
    this.camera.acceleration = false;
};

/**
 * Render loop
 */
threemaze.prototype.render = function()
{
    requestAnimationFrame($.proxy(this, 'render'));
    if (this.camera.acceleration !== false)
    {
        this.camera.angles.horizontal += this.camera.acceleration.horizontal;
        this.camera.angles.vertical += this.camera.acceleration.vertical;
        this.updateCamera();
    }
    this.renderer.render(this.scene, this.camera);
};

/**
 * Updates the camera position if needed
 */
threemaze.prototype.updateCamera = function()
{
    this.camera.position.x = Math.floor(Math.cos(this.camera.angles.horizontal) * 300);
    this.camera.position.y = Math.floor(Math.cos(this.camera.angles.vertical) * 300);
    this.camera.position.z = Math.floor(Math.sin(this.camera.angles.horizontal) * 300);
    this.camera.lookAt(this.scene.position);
};

/**
 * Generates a maze
 * Raw copy paste from http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze#Maze_Generator_in_Javascript
 * @todo rewrite this
 * @param size
 */
threemaze.prototype.generateMaze = function(size)
{
    // Coordinates of N(x,y) S(x,y) E(x,y) W(x,y)
    // it's necessary to have one of each so that if one direction
    // doesn't work properly, we can try each direction until one
    // works, or that we know there isn't a location possible.
    var cN = [[0,0],[0,0],[0,0],[0,0]];
    var x,y,cx,cy;
    var map = new Array(size);
    var randomDir,intDone=0;
    for (var i = 0; i <= size * size; ++i)
    {
        map[i] = new Array(size);
    }
    // Initialize the Map Array to Zeros
    for (x = 1; x <= size; ++x)
    {
        for (y = 1; y <= size; ++y)
        {
            map[x][y] = 0;
        }
    }
    do
    {
        // Roll random x's and y's and make sure the value is odd
        x=2+Math.floor(Math.random()*(size-1));if (x%2!=0) --x;
        y=2+Math.floor(Math.random()*(size-1));if (y%2!=0) --y;
        // Ensure that the first random map location starts the process
        if (intDone==0) map[x][y]=1;
        if (map[x][y]==1){
            //Randomize Directions
            randomDir=Math.floor(Math.random()*4)
            if (randomDir==0){
                cN = [[-1,0],[1,0],[0,-1],[0,1]];
            } else if (randomDir==1){
                cN = [[0,1],[0,-1],[1,0],[-1,0]];
            } else if (randomDir==2){
                cN = [[0,-1],[0,1],[-1,0],[1,0]];
            } else if (randomDir==3){
                cN = [[1,0],[-1,0],[0,1],[0,-1]];
            } //end if
            blnBlocked=1;
            do {
                blnBlocked++;
                for (var intDir=0; intDir<=3; ++intDir){
                    // Determine which direction the tile is
                    cx=x+cN[intDir][0]*2;
                    cy=y+cN[intDir][1]*2;
                    //Check to see if the tile can be used
                    if (cx<size && cy<size && cx>1 && cy>1){
                        if (map[cx][cy]!=1){
                            //create destination location
                            map[cx][cy]=1;
                            //create current location
                            map[x][y]=1;
                            //create inbetween location
                            map[x+cN[intDir][0]][y+cN[intDir][1]]=1;
                            //set destination location to current
                            x=cx;y=cy;
                            blnBlocked=0;
                            intDone++;
                            intDir=4
                        } //end if
                    } //end if
                } //end for
                //recursive, no directions found, loop back a node
            } while (blnBlocked==1) //end do
        } //end if
    } while (intDone+1<((size-1)*(size-1))/4) //end do

    return map;
};