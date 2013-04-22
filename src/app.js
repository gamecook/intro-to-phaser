/// <reference path="../../phaser/Phaser/Game.ts" />
/// <reference path="../../phaser/Phaser/system/input/Keyboard.ts" />
(function () {
    // Create game instance and connect init, create and update methods
    var myGame = new Phaser.Game(this, 'game', 800, 480, init, create, update);
    var player;
    var keyboard;
    //weapons
    var weaponId = 1;
    var fire = false;
    var bulletGroup;
    var shotDelayTime = 0;
    var shotDelay = 200;
    //zombies
    var zombieGroup;
    var zombieSpawnDelay = 1000;// milliseconds before next zombie is spawned
    
    var zombieSpawnDelayTime = 0;
    function init() {
        myGame.loader.addTextureAtlas('entities', 'assets/textures/entities.png', 'assets/textures/entities.txt');
        myGame.loader.load();
    }
    function create() {
        // create player and configure
        player = myGame.createSprite(myGame.stage.width * .5 - 50, 200, "entities");
        player.drag.x = 900;
        player.maxVelocity.x = 250;
        player.animations.add('idle', [
            'player-idle-1.png'
        ], 10, false, false);
        player.animations.add('fire', [
            'player-fire-1-00.png', 
            'player-fire-1-01.png', 
            'player-fire-1-02.png'
        ], 10, true, false);
        player.animations.add('walk', [
            'player-walk-1-00.png', 
            'player-walk-1-01.png', 
            'player-walk-1-02.png', 
            'player-walk-1-03.png', 
            'player-walk-1-04.png', 
            'player-walk-1-05.png', 
            'player-walk-1-06.png', 
            'player-walk-1-07.png'
        ], 10, true, false);
        player.animations.play('idle');
        // save reference to keyboard
        keyboard = myGame.input.keyboard;
        bulletGroup = myGame.createGroup(10);
        zombieGroup = myGame.createGroup(10);
    }
    function update() {
        // Player controls
        if(keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            player.acceleration.x += 100;
            player.flipped = false;
        } else if(keyboard.justReleased(Phaser.Keyboard.RIGHT)) {
            player.acceleration.x = 0;
        }
        if(keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.acceleration.x -= 30;
            player.flipped = true;
        } else if(keyboard.justReleased(Phaser.Keyboard.LEFT)) {
            player.acceleration.x = 0;
        }
        if(keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            fire = true;
        } else if(keyboard.justReleased(Phaser.Keyboard.SPACEBAR)) {
            fire = false;
        }
        // Check to see if the player should be firing
        if(fire) {
            // increase the shotDelayTime based on the game's time delta
            shotDelayTime += myGame.time.delta;
            // If the delay is greater than 200 create a bullet
            if(shotDelayTime > shotDelay) {
                creatBullet();
                // reset the shotDelayTime
                shotDelayTime = 0;
            }
            // stop the player so they can shoot
            player.velocity.x = player.acceleration.x = 0;
        }
        // Player animations
        if(Math.abs(player.velocity.x) != 0) {
            player.animations.play('walk');
        } else if(fire) {
            player.animations.play("fire");
        } else {
            player.animations.play('idle');
        }
        // Spawn zombies
        zombieSpawnDelayTime += myGame.time.delta;
        if(zombieSpawnDelayTime > zombieSpawnDelay) {
            createZombie();
            zombieSpawnDelayTime = 0;
        }
        // bullet logic
        bulletGroup.forEach(updateBullets);
        // test collision of bullets and zombies
        myGame.collide(bulletGroup, zombieGroup, bulletCollides);
    }
    function creatBullet() {
        // Get new instance from the bullet group via recycle
        var bullet = bulletGroup.recycle(Phaser.Sprite);
        // reset exists flag if it went off stage of collided with a zombie
        bullet.exists = true;
        // offset so it looks like the bullet comes out of the gun and isn't spawned inside of the player
        bullet.x = player.x + (player.flipped ? 0 : player.width);
        bullet.y = player.y + 25;
        bullet.flipped = player.flipped;
        bullet.velocity.x = bullet.flipped ? -600 : 600;
        bullet.loadGraphic("entities");
        bullet.animations.frameName = "bullet-gun.png";
    }
    function updateBullets(target) {
        if(target.x > myGame.stage.width) {
            target.exists = false;
        }
    }
    function createZombie() {
        var zombie = zombieGroup.recycle(Phaser.Sprite);
        zombie.exists = true;
        zombie.x = Math.random() < 0.5 ? myGame.stage.width + 30 : -30;
        zombie.y = player.y;
        zombie.flipped = zombie.x > 0 ? true : false;
        zombie.loadGraphic("entities");
        zombie.velocity.x = zombie.flipped ? -100 : 100;
        var style = Math.random() < 0.5 ? 0 : 1;
        zombie.animations.frameName = "zombie-a-" + style + "-00.png";
        zombie.animations.add('walk', [
            'zombie-a-' + style + '-00.png', 
            'zombie-a-' + style + '-01.png', 
            'zombie-a-' + style + '-02.png', 
            'zombie-a-' + style + '-03.png', 
            'zombie-a-' + style + '-04.png', 
            'zombie-a-' + style + '-05.png'
        ], 10, true, false);
        zombie.animations.play("walk");
    }
    function bulletCollides(targetA, targetB) {
        targetA.exists = false;
        targetB.exists = false;
    }
})();
