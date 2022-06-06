function topWall(obj) {
    return obj.y;
}
function bottomWall(obj) {
    return obj.y + obj.height;
}
function leftWall(obj) {
    return obj.x;
}
function rightWall(obj) {
    return obj.x + obj.width;
}

function Dinosaur (x, dividerY) {
    this.width = 55;
    this.height = 70;
    this.x = x;
    this.y = dividerY - this.height;
    this.vy = 0;
    this.jumpVelocity = -20;
}
Dinosaur.prototype.draw = function(context) {
    var dinoImage = new Image();
    dinoImage.src = 'dino.png';
    context.drawImage(dinoImage, this.x, this.y, this.width, this.height);
};
Dinosaur.prototype.jump = function() {
    this.vy = this.jumpVelocity;
};
Dinosaur.prototype.update = function(divider, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(divider) && this.vy > 0) {
        this.y = topWall(divider) - this.height;
        this.vy = 0;
        return;
    }
};

function Divider (gameWidth, gameHeight) {
    this.width = gameWidth;
    this.height = 4;
    this.x = 0;
    this.y = gameHeight - this.height - Math.floor(0.2 * gameHeight);
}
Divider.prototype.draw = function(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
};

function Cactus(gameWidth, groundY) {
    this.width = 16;    
    this.height = (Math.random() > 0.5) ? 30 : 70
    this.x = gameWidth;
    this.y = groundY - this.height;
}
Cactus.prototype.draw = function(context) {
    var cactusImage = new Image();
    cactusImage.src = 'cactus.png';
    context.drawImage(cactusImage, this.x, this.y, this.width, this.height);
};

function Bird(gameWidth, groundY) {
    this.width = 30;    
    this.height = 30;
    this.x = gameWidth;
    this.y = groundY - this.height - 210;
}
Bird.prototype.draw = function(context) {
    var birdImage = new Image();
    birdImage.src = 'bird.png';
    context.drawImage(birdImage, this.x, this.y, this.width, this.height);
};

function Game () {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "brown";
    document.spacePressed = false;
    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " ") this.spacePressed = false;
    });
    this.gravity = 1.5;
    this.divider = new Divider(this.width, this.height);
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.cacti = [];
    this.birds = [];

    this.runSpeed = -10;
    this.paused = false;
    this.noOfFrames = 0;
}

Game.prototype.spawnCactus = function(probability) {
    if (Math.random() <= probability) {
        this.cacti.push(new Cactus(this.width, this.divider.y));
    }
}

Game.prototype.spawnBird = function(probability) {
    if (Math.random() <= probability) {
        this.birds.push(new Bird(this.width, this.divider.y));
    }
}

Game.prototype.update = function () {
    //dinosaur jump start
    if(this.paused) {
        return;
    }
    if (document.spacePressed == true && bottomWall(this.dino) >= topWall(this.divider)) {
        this.dino.jump();
    }
    this.dino.update(this.divider, this.gravity);

    //remove cacti that cross the left border of the screen
    if(this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
        this.cacti.shift();
    }

    //spawn cacti
    //no cacti on the screen
    if (this.cacti.length == 0) {
        this.spawnCactus(0.5);
    }
    //at least one cactus
    else if (this.cacti.length > 0 && this.width - leftWall(this.cacti[this.cacti.length-1]) 
        > this.jumpDistance + 150) {
            this.spawnCactus(0.05);
    } 

    //move cacti
    for (i = 0; i < this.cacti.length; i++) {
        this.cacti[i].x += this.runSpeed;
    }

    for (i = 0; i < this.cacti.length; i++) {
        if (rightWall(this.dino) >= leftWall(this.cacti[i]) 
            && leftWall(this.dino) <= rightWall(this.cacti[i]) 
            && bottomWall(this.dino) >= topWall(this.cacti[i])) {
                //collision
                this.paused = true;
        }
        this.noOfFrames++;
        this.score = Math.floor(this.noOfFrames/50);
    }

    //remove birds that cross the left border of the screen
    if(this.birds.length > 0 && rightWall(this.birds[0]) < 0) {
        this.birds.shift();
    }

    //spawn birds
    //no birds on the screen
    if (this.birds.length == 0) {
        this.spawnBird(0.2);
    }
    //at least one bird
    else if (this.birds.length > 0 && this.width - leftWall(this.birds[this.birds.length-1]) 
        > this.jumpDistance + 150) {
            this.spawnBird(0.02);
    } 

    //move birds
    for (i = 0; i < this.birds.length; i++) {
        this.birds[i].x += this.runSpeed;
    }

    for (i = 0; i < this.birds.length; i++) {
        if (rightWall(this.dino) >= leftWall(this.birds[i]) 
            && leftWall(this.dino) <= rightWall(this.birds[i]) 
            && topWall(this.dino) <= bottomWall(this.birds[i])) {
                //collision
                this.paused = true;
        }
        this.noOfFrames++;
        this.score = Math.floor(this.noOfFrames/50);
    }

    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);
};
Game.prototype.draw = function () {
    this.context.clearRect(0, 0, this.width, this.height);
    this.divider.draw(this.context);
    this.dino.draw(this.context);
    for (i = 0; i < this.cacti.length; i++) {
        this.cacti[i].draw(this.context);
    }
    for (i = 0; i < this.birds.length; i++) {
        this.birds[i].draw(this.context);
    }

    var oldFill = this.context.fillStyle;
    this.context.fillStyle = "white";
    this.context.fillText("Score: " + this.score, this.width-60, 30);
    this.context.fillStyle = oldFill;

    if (this.paused) {
        var oldFill = this.context.fillStyle;
        this.context.fillStyle = "white";
        this.context.fillText("GAME OVER", 350, 200);
        this.context.fillStyle = oldFill;
    }
};

var game = new Game();
function main (timeStamp) {
    game.update();
    game.draw();
    window.requestAnimationFrame(main);
}
var startGame = window.requestAnimationFrame(main);