/**
 *
 */
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

/**
 *
 */
window.onload = function () {
    var canvas = document.getElementById("game"),
        context = canvas.getContext("2d"),
        height = 600,
        width = 900,
        startTime = new Date().getTime(),
        avatarX = 400,
        avatarY = 300,
        shipSizeX = 50,
        shipSizeY = 50,
        meteors = [],
        maxSpeed = 5,
        gameOver = false;

    new Game().init();

    /**
     *
     * @constructor
     */
    function Game() {

        this.init = function () {
            window.addEventListener('refresh-state', this.setCanvas, true);
            new Ship().init();
            new Meteor().init();
            new Conflict().init();
            new Score().init();

            this.loop();
        };

        this.setCanvas = function () {
            context.clearRect(0, 0, width, height);
            context.fillStyle = "white";
            canvas.height = height;
            canvas.width = width;
        };

        this.loop = function () {

            if (!gameOver) {
                var refresh = new CustomEvent("refresh-state");
                document.dispatchEvent(refresh);
            }

            requestAnimationFrame(new Game().loop);
        }
    }

    /**
     *
     * @constructor
     */
    function Ship() {

        var keys = [],
            velX = 0,
            velY = 0;
            // shipImage = new Image();
            // shipImage.src = "./img/bacteria.jpg";

        this.init = function () {
            window.addEventListener("keydown", this.keyDownPressed);
            window.addEventListener("keyup", this.keyUpPressed);
            window.addEventListener('refresh-state', this.move, true);
            window.addEventListener('refresh-state', this.setCharacter, true);
        };

        this.keyDownPressed = function (e) {
            keys[e.keyCode] = true;
        };

        this.keyUpPressed = function (e) {
            keys[e.keyCode] = false;
        };

        this.setCharacter = function () {
            // Current stadium
            var newX = avatarX + velX,
                newY = avatarY + velY;

            if (newX >= 5 && newX <= (width - 55))
                avatarX = newX;

            if (newY >= 5 && newY <= (height - 55))
                avatarY = newY;
            // context.drawImage(shipImage, 100, 150, 50, 50, avatarX, avatarX, shipSizeX, shipSizeY);
            // context.strokeRect(avatarX, avatarY, shipSizeX, shipSizeY);
            context.fillRect(avatarX, avatarY, shipSizeX, shipSizeY);
        };

        this.move = function () {
            if (keys[37] || keys[65]) { // Left
                //velX = -10;
                if (velX > -maxSpeed) {
                    velX -= 0.5;
                }
            }

            if (keys[39] || keys[68]) { // Right
                //velX = 10;
                if (velX < maxSpeed) {
                    velX += 0.5;
                }
            }
            if (keys[40] || keys[83]) { // Down
                //velY = 10;
                if (velY < maxSpeed) {
                    velY += 0.5;
                }
            }
            if (keys[38] || keys[87]) { // Up
                //velY = -10;
                if (velY > -maxSpeed) {
                    velY -= 0.5;
                }
            }
        };
    }

    /**
     *
     * @constructor
     */
    function Meteor() {

        var lastTime = startTime + 60,
            numberOfMeteors = 1,
            direction = ["-", "+"],
            allSpeeds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.10];

        this.init = function () {
            window.addEventListener('refresh-state', this.rain, true);
            window.addEventListener('refresh-state', this.generateMeteors, true);
        };

        this.rain = function () {
            meteors.forEach(function (meteor) {
                meteor.circleX += meteor.cirY;
                meteor.circleY += meteor.cirX;

                context.beginPath();
                context.arc(meteor.circleX, meteor.circleY, meteor.radius, 0, 2 * Math.PI);
                context.fillStyle = 'red';
                context.fill();
            });

        };

        this.generateMeteors = function () {

            var meteorsPrivete = [],
                currentTime = new Date().getTime();

            if (lastTime < currentTime) {
                this.getDirections = function () {
                    var operator = direction[Math.floor(Math.random() * direction.length)],
                        speed = allSpeeds[Math.floor(Math.random() * allSpeeds.length)];
                    return parseFloat(operator + speed);
                };

                for (var i = 0; i < numberOfMeteors; i++) {
                    meteorsPrivete.push(
                        {
                            circleX: helpers.random(1, width),
                            circleY: helpers.random(-50, -100),
                            radius: helpers.random(20, 20),
                            cirX: this.getDirections(),
                            cirY: this.getDirections()
                        }
                    );
                }
                numberOfMeteors++;
                lastTime = currentTime + 3600;
            }
            meteors = meteors.concat(meteorsPrivete);
        };


    }

    /**
     *
     * @constructor
     */
    function Conflict() {
        this.init = function () {
            window.addEventListener('refresh-state', this.contact, true);
        };

        this.contact = function () {
            meteors.forEach(function (meteor) {
                var meteorsPosition = this.getMeteorPosition(meteor);

                if (!this.isContactMade(meteorsPosition))
                    gameOver = true;

            });

            this.isContactMade = function (meteorsPosition) {
                var shipPosition = this.getShipPosition();

                if (
                    (
                        (
                            (meteorsPosition.yBottom >= shipPosition.yTop &&
                            meteorsPosition.yBottom <= shipPosition.yBottom) ||
                            (meteorsPosition.yTop <= shipPosition.yBottom &&
                            meteorsPosition.yTop >= shipPosition.yBottom)
                        )
                        ||
                        (
                            (meteorsPosition.xRight <= shipPosition.xLeft &&
                            meteorsPosition.xLeft <= shipPosition.xRight)
                        )
                    )
                    &&
                    (
                        (meteorsPosition.yCenter >= shipPosition.yTop &&
                        meteorsPosition.yCenter <= shipPosition.yBottom) &&
                        (meteorsPosition.xCenter <= shipPosition.xRight &&
                        meteorsPosition.xCenter >= shipPosition.xLeft)
                    )
                )
                    return false;

                return true;
            };

            this.getMeteorPosition = function (meteor) {
                var r = meteor.radius / 2;
                return {
                    xCenter: meteor.circleX,
                    yCenter: meteor.circleY,
                    xRight: meteor.circleX + r,
                    xLeft: meteor.circleX - r,
                    yBottom: meteor.circleY + r,
                    yTop: meteor.circleY - r
                }

            };

            this.getShipPosition = function () {
                return {
                    xRight: avatarX + shipSizeX,
                    xLeft: avatarX,
                    yBottom: avatarY + shipSizeY,
                    yTop: avatarY
                }
            };
        };
    }

    /**
     *
     * @constructor
     */
    function Score() {
        var scoreSpan = document.getElementById("score"),
            lastTime = startTime + 60,
            score = 0;

        this.init = function () {
            window.addEventListener('refresh-state', this.updateScore, true);
        };

        this.updateScore = function () {
            var currentTime = new Date().getTime();
            if (lastTime < currentTime) {
                score++;
                scoreSpan.innerHTML = score;
                lastTime = currentTime + 3600;
            }
        }

    }

    /**
     *
     * @type {{random: helpers.random}}
     */
    var helpers = {
        random: function (from, to) {
            return Math.floor(Math.random() * to) + from;
        }
    };

};
