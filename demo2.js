var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD=false, nave, bala2, nave2;
var bala2Cont = 1;

var salto;
var menu;

var der, izq;

var velocidadBalaX;
var velocidadBalaY;
var despBala;
var despBalaY;
var estatusSalto;
var estatusAdelante;

var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo2.png');
    juego.load.spritesheet('mono', 'assets/sprites/shadow3.png',38 ,49);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('nave2', 'assets/game/ufo.png');
    juego.load.image('bala2', 'assets/sprites/2_ball.png');
    juego.load.image('bala', 'assets/sprites/8_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');

}


function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    nave2 = juego.add.sprite(10, 0, 'nave2');
    bala = juego.add.sprite(w-100, h, 'bala');
    bala2 = juego.add.sprite(50, 50, 'bala2');
    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[1,2,3]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    juego.physics.enable(bala2);
    bala.body.collideWorldBounds = true;
    bala2.body.collideWorldBounds = true;

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    der = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    izq = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    
    pausaL = juego.add.text(
        w - 100, 
        20, 
        'Pause', 
        { font: '25px Arial', fill: '#B9E3D9' }
    );
    
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);
    
    /****       Modelo Perceptron             *****/
    nnNetwork =  new synaptic.Architect.Perceptron(4,6,6,2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {
        rate: 0.0003, 
        iterations: 10000, 
        shuffle: true
    });
}


function datosDeEntrenamiento(param_entrada){

    console.log(
        "Entrada",
        param_entrada[0] + " " + param_entrada[1] + " " + param_entrada[2]+ " " +param_entrada[3]
    );

    nnSalida = nnNetwork.activate(param_entrada);
    var salto = Math.round(nnSalida[0] * 100);
    var adelante = Math.round(nnSalida[1] * 100);
    console.log("Valor ", "En el salto %: " + salto);
    console.log("Valor ", " Adelante %: " + adelante);
    var salidas = [];
    salidas[0] = nnSalida[0];
    salidas[1] = nnSalida[1];
    return salidas;
}


function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event) {
    if (juego.paused) {
      var menu_x1 = w / 2 - 270 / 2,
        menu_x2 = w / 2 + 270 / 2,
        menu_y1 = h / 2 - 180 / 2,
        menu_y2 = h / 2 + 180 / 2;
  
      var mouse_x = event.x,
        mouse_y = event.y;
  
      if (
        mouse_x > menu_x1 &&
        mouse_x < menu_x2 &&
        mouse_y > menu_y1 &&
        mouse_y < menu_y2
      ) {
        if (
          mouse_x >= menu_x1 &&
          mouse_x <= menu_x2 &&
          mouse_y >= menu_y1 &&
          mouse_y <= menu_y1 + 90
        ) {
          eCompleto = false;
          datosEntrenamiento = [];
          modoAuto = false;
        } else if (
          mouse_x >= menu_x1 &&
          mouse_x <= menu_x2 &&
          mouse_y >= menu_y1 + 90 &&
          mouse_y <= menu_y2
        ) {
          if (!eCompleto) {
            console.log(
              "",
              "Entrenamiento " + datosEntrenamiento.length + " valores"
            );
            enRedNeural();
            eCompleto = true;
          }
          modoAuto = true;
          menu.destroy();
          resetVariables();
          juego.paused = false;
        }
  
        menu.destroy();
        resetVariables();
        juego.paused = false;
      }
    }
}


function resetVariables() {

  if(bala2Cont % 2 == 0){
    bala2.position.x = 40;
    nave2.position.x = 40;
  }else{
    bala2.position.x = 70;
    nave2.position.x = 70;
  }
  bala2Cont++;

  modeD = Math.random() < 0.5;
  bala.position.x = w - 100;
  bala.position.y = h;
  
  bala2.position.y = 0;
  bala.body.velocity.x = 0;
  bala2.body.velocity.y = 0;
  jugador.body.velocity.x = 0;
  jugador.body.velocity.y = 0;

  jugador.x = 50;
  balaD = false;
}


function saltar(){
    jugador.body.velocity.y = -270;
}


function update() {

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatusSalto = 0;
    estatusAdelante = 0;

    if(!jugador.body.onFloor()) {
        estatusSalto = 1;
    }
	
    despBala = Math.floor(jugador.position.x - bala.position.x);
    despBalaY = Math.floor(jugador.position.y - bala2.position.y);

    if (modoAuto == false && izq.isDown) {
        jugador.x=50; 
        estatusAdelante = 0;
      } else if (modoAuto == false && der.isDown) {
        jugador.body.velocity.x = 200; 
        estatusAdelante = 1;
      } else {
        jugador.body.velocity.x = 0;
        estatusAdelante = 0;
      }

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }

    
    if (modoAuto == true) {
        var bot = datosDeEntrenamiento([despBala, velocidadBalaX, despBalaY, velocidadBalaY]);
        console.log(bot[0]);
        console.log(bot[1]);
        console.log(bot[2]);
        console.log(bot[3]);
        
        if (bot[0] > 0.5 && jugador.body.onFloor()) {
          saltar();
        }
        if (Math.abs(bot[1]) > 0.08 && jugador.x<90) {
          jugador.body.velocity.x = 200;
        } 
      }

    //Generar bala si no hay 
    if( balaD==false ){
        disparo();
    }

    if (bala.position.x <= 0 && estatusSalto==0 && bala2.body.onFloor()) {
        resetVariables();
    }
    
    if (modoAuto == false && bala.position.x > 0) {
        datosEntrenamiento.push({
          input: [despBala, velocidadBalaX, despBalaY, velocidadBalaY],
          output: [estatusSalto, estatusAdelante],
        });
        //datos a pasar para entrenamiento 
        console.log(despBala + " " + velocidadBalaX + " " + despBalaY + " " + velocidadBalaY + " " + estatusSalto + " " + estatusAdelante);
    }
}


function disparo() {
    velocidadBalaX = -1 * velocidadRandom(300, 700);
    velocidadBalaY = -1.5 * velocidadRandom(300, 400);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBalaX;
    bala2.body.velocity.y = velocidadBalaY;
    bala2.body.velocity.x = 0;
    balaD = true;
}


function colisionH(){
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){}
