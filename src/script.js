document.addEventListener('DOMContentLoaded', function () {
    const jugador = document.getElementById('jugador');
    const obstacles = Array.from(document.querySelectorAll('.obstacle'));
    const gameContainer = document.getElementById('game-container');
    const npc = document.getElementById('npc');
    let dialogueOpen = false; 

    let jugadorX = parseInt(window.getComputedStyle(jugador).left);
    let jugadorY = parseInt(window.getComputedStyle(jugador).bottom);
    const jugadorWidth = parseInt(window.getComputedStyle(jugador).width);
    const jugadorHeight = parseInt(window.getComputedStyle(jugador).height);

    let isJumping = false;
    let jumpHeight = 0;
    const jumpSpeed = 10; 
    const gravity = 5.5; 

    const teclasPresionadas = new Set();

    document.addEventListener('keydown', (event) => {
        teclasPresionadas.add(event.key);
        if ((teclasPresionadas.has('w') || teclasPresionadas.has('W') ) && !isJumping && isjugadorOnGround()) {
            jump();
        }
    });

    document.addEventListener('keyup', (event) => {
        teclasPresionadas.delete(event.key);
    });

    function jump() {
        isJumping = true;
        jumpHeight = 100; 
        let jumpInterval = setInterval(() => {
            if (jumpHeight === 0) {
                clearInterval(jumpInterval);
                isJumping = false;
            }
            jugadorY += jumpSpeed;
            jumpHeight -= jumpSpeed;
            jugador.style.bottom = jugadorY + 'px';
            checkCollision();
        }, 20);
    }

    function applyGravity() {
        if (!isJumping && jugadorY > 0) {
            jugadorY -= gravity;
            jugador.style.bottom = jugadorY + 'px';
            checkCollision();
        }
    }

    function moveLeft() {
        jugadorX -= 10; 
        if (jugadorX < 0) jugadorX = 0; 
        jugador.style.left = jugadorX + 'px';
        checkCollision();
    }

    function moveRight() {
        jugadorX += 10; 
        const maxRight = gameContainer.offsetWidth - jugadorWidth;
        if (jugadorX > maxRight) jugadorX = maxRight; 
        jugador.style.left = jugadorX + 'px';
        checkCollision();
    }

    function checkCollision() {
        let isCollidingWithWall = false;
        let isCollidingWithObstacle = false;
        let isCollidingWithTeletransportador = false; 

        
        obstacles.forEach((obstacle) => {
            const collisionWithObstacle = checkCollisionWithObstacle(obstacle);
            if (collisionWithObstacle) {
                isCollidingWithObstacle = true;
                handleObstacleCollision(obstacle);
            }
        });

        
        const teletransportador = document.getElementById('teletransportador');
        const collisionWithTeletransportador = checkCollisionWithObstacle(teletransportador);
        if (collisionWithTeletransportador) {
            isCollidingWithTeletransportador = true;
            handleTeletransportadorCollision(); 
        }

        
        if (isCollidingWithObstacle || isCollidingWithWall) {
            jugador.style.left = jugadorX + 'px';
        }
    }

    function checkCollisionWithObstacle(obstacle) {
        const obstacleRect = obstacle.getBoundingClientRect();
        const jugadorRect = jugador.getBoundingClientRect();

        return (
            jugadorRect.bottom > obstacleRect.top &&
            jugadorRect.top < obstacleRect.bottom &&
            jugadorRect.right > obstacleRect.left &&
            jugadorRect.left < obstacleRect.right
        );
    }

    function handleObstacleCollision() {
        let isCollidingWithObstacle = false;

        obstacles.forEach((obstacle) => {
            if (checkCollisionWithObstacle(obstacle)) {
                isCollidingWithObstacle = true;
                
                handleIndividualObstacleCollision(obstacle);
            }
        });

        return isCollidingWithObstacle;
    }

    function handleIndividualObstacleCollision(obstacle) {
        const obstacleRect = obstacle.getBoundingClientRect();
        const jugadorRect = jugador.getBoundingClientRect();

        const jugadorCenterX = jugadorRect.left + jugadorRect.width / 2;
        const jugadorCenterY = jugadorRect.top + jugadorRect.height / 2;

        const deltaX = jugadorCenterX - (obstacleRect.left + obstacleRect.width / 2);
        const deltaY = jugadorCenterY - (obstacleRect.top + obstacleRect.height / 2);

        const halfWidths = (jugadorRect.width + obstacleRect.width) / 2;
        const halfHeights = (jugadorRect.height + obstacleRect.height) / 2;

        if (Math.abs(deltaX) < halfWidths && Math.abs(deltaY) < halfHeights) {
            const overlapX = halfWidths - Math.abs(deltaX);
            const overlapY = halfHeights - Math.abs(deltaY);

            if (overlapX > overlapY) {
                if (deltaY > 0) {
                    if (jugadorRect.top - obstacleRect.top <= 5) {
                        jugadorY += overlapY;
                    } else {
                        jugadorY -= overlapY;
                    }
                } else {
                    if (obstacleRect.bottom - jugadorRect.bottom <= 5) {
                        jugadorY = jugadorRect.height;
                    } else {
                        jugadorY += overlapY;
                    }
                }
            } else {
                if (deltaX > 0) {
                    jugadorX += overlapX;
                } else {
                    jugadorX -= overlapX;
                }
            }

            jugador.style.left = jugadorX + 'px';
            jugador.style.bottom = jugadorY + 'px';
        }
    }

    function isjugadorOnGround() {
        return (
            jugadorY <= 0 ||
            obstacles.some((obstacle) => {
                let obstacleX = parseInt(window.getComputedStyle(obstacle).left);
                let obstacleY = parseInt(window.getComputedStyle(obstacle).bottom);
                const obstacleWidth = parseInt(window.getComputedStyle(obstacle).width);
                const obstacleHeight = parseInt(window.getComputedStyle(obstacle).height);

                return (
                    jugadorX + jugadorWidth > obstacleX &&
                    jugadorX < obstacleX + obstacleWidth &&
                    jugadorY <= obstacleY + obstacleHeight &&
                    jugadorY + jugadorHeight >= obstacleY
                );
            })
        );
    }

    setInterval(() => {
        if (teclasPresionadas.has('a') || teclasPresionadas.has('A')) moveLeft();
        if (teclasPresionadas.has('d') || teclasPresionadas.has('D')) moveRight();
    }, 20);

    setInterval(applyGravity, 20);

    
    function checkNPCInteraction() {
        const npcRect = npc.getBoundingClientRect();
        const jugadorRect = jugador.getBoundingClientRect();
    
        const distanceThreshold = 100;
    
        const distanceX = Math.abs(npcRect.left - jugadorRect.left);
        const distanceY = Math.abs(npcRect.top - jugadorRect.top);
    
        
        if (distanceX < distanceThreshold && distanceY < distanceThreshold && !dialogueOpen) {
            showDialogue();
            dialogueOpen = true; 
        }
        
        else if (distanceX >= distanceThreshold || distanceY >= distanceThreshold) {
            msgID = 1;
            msgIDUsed = 0;
            cerrar();
            dialogueOpen = false; 
        }
    }    

    setInterval(checkNPCInteraction, 100); 
});
