const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tamaño del lienzo
canvas.width = 320;
canvas.height = 480;

// Variables del juego
const birdImage = new Image();
birdImage.src = 'https://cdn.discordapp.com/attachments/873772062764838992/1278040555997237258/pajaro.png?ex=66cf5b85&is=66ce0a05&hm=876072b9b2f842b68381965add62b0cb15fd3f19739ee4d50be036c2bceafad6&'; // Ruta de la imagen del pájaro

const coinImage = new Image();
coinImage.src = 'https://cdn.discordapp.com/attachments/873772062764838992/1278040542420406313/Iso_icon.png?ex=66cf5b82&is=66ce0a02&hm=5f4e08597092768e320e6f2f72fa43eefbce42f2e95a8ebf7f95cd3f028969b7&'; // Ruta de la imagen de la moneda principal

const specialCoinImage = new Image();
specialCoinImage.src = 'https://media.discordapp.net/attachments/873772062764838992/1278040528662954116/Yoru_icon.png?ex=66cf5b7e&is=66ce09fe&hm=cd003500c4cdc3f0a34f8c8eaed266603ce99dfe578deef133a1258c1066c336&=&format=webp&quality=lossless&width=505&height=505'; // Ruta de la imagen de la moneda especial

const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 60, // Ajusta según el tamaño de tu imagen
    height: 50, // Ajusta según el tamaño de tu imagen
    gravity: 0.2,
    lift: -6,
    velocity: 0
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 300;
const pipeSpeed = 2;
const coinWidth = 50; // Ajusta el tamaño de la moneda
const coinHeight = 50; // Ajusta el tamaño de la moneda

let frame = 0;
let score = 0;
let collectedCoins = 0; // Contador de monedas recogidas
let isGameOver = false;

// Manejo del teclado y clic
document.addEventListener('keydown', () => {
    if (!isGameOver) {
        bird.velocity = bird.lift;
    }
});

canvas.addEventListener('click', () => {
    if (isGameOver) {
        resetGame();
    } else {
        bird.velocity = bird.lift;
    }
});

function update() {
    if (isGameOver) return; // No actualiza el juego si está en pausa

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }

    if (frame % 90 === 0) {
        const pipeHeight = Math.random() * (canvas.height - pipeGap - 40) + 20;

        // Decidir si se debe generar una moneda con un 10% de probabilidad
        let coin = null;
        if (Math.random() < 0.10) { // 10% de probabilidad
            coin = {
                x: canvas.width,
                y: pipeHeight + pipeGap / 2 - coinHeight / 2,
                width: coinWidth,
                height: coinHeight,
                type: 'normal' // Tipo de moneda
            };
        }

        // Decidir si se debe generar una moneda especial con un 5% de probabilidad
        let specialCoin = null;
        if (Math.random() < 0.05) { // 5% de probabilidad
            specialCoin = {
                x: canvas.width,
                y: pipeHeight + pipeGap / 2 - coinHeight / 2,
                width: coinWidth,
                height: coinHeight,
                type: 'special' // Tipo de moneda especial
            };
        }

        pipes.push({
            x: canvas.width,
            height: pipeHeight,
            coin: coin,
            specialCoin: specialCoin
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Actualizar la posición de las monedas para que se muevan con el tubo
        if (pipe.coin) {
            pipe.coin.x -= pipeSpeed;
        }
        if (pipe.specialCoin) {
            pipe.specialCoin.x -= pipeSpeed;
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
            score++;
        }

        // Verificar colisión con los tubos
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipeGap)
        ) {
            gameOver();
        }

        // Verificar colisión con la moneda normal
        if (
            pipe.coin &&
            bird.x < pipe.coin.x + pipe.coin.width &&
            bird.x + bird.width > pipe.coin.x &&
            bird.y < pipe.coin.y + pipe.coin.height &&
            bird.y + bird.height > pipe.coin.y
        ) {
            score += 20;
            collectedCoins++;
            pipe.coin = null; // Remove the coin after collecting it
        }

        // Verificar colisión con la moneda especial
        if (
            pipe.specialCoin &&
            bird.x < pipe.specialCoin.x + pipe.specialCoin.width &&
            bird.x + bird.width > pipe.specialCoin.x &&
            bird.y < pipe.specialCoin.y + pipe.specialCoin.height &&
            bird.y + bird.height > pipe.specialCoin.y
        ) {
            score += 50; // Puedes ajustar el puntaje para la moneda especial
            collectedCoins++;
            pipe.specialCoin = null; // Remove the special coin after collecting it
        }
    });

    frame++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el pájaro
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    // Dibujar los tubos
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
        ctx.fillRect(pipe.x, pipe.height + pipeGap, pipeWidth, canvas.height - (pipe.height + pipeGap));

        // Dibujar la moneda normal
        if (pipe.coin) {
            ctx.drawImage(coinImage, pipe.coin.x, pipe.coin.y, pipe.coin.width, pipe.coin.height);
        }

        // Dibujar la moneda especial
        if (pipe.specialCoin) {
            ctx.drawImage(specialCoinImage, pipe.specialCoin.x, pipe.specialCoin.y, pipe.specialCoin.width, pipe.specialCoin.height);
        }
    });

    // Mostrar puntuación
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    if (isGameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 20);
    }
}

function gameOver() {
    isGameOver = true;
    document.removeEventListener('keydown', () => {}); // Desactivar controles
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    collectedCoins = 0; // Reiniciar contador de monedas
    isGameOver = false; // Volver a activar el juego
    document.addEventListener('keydown', () => {
        if (!isGameOver) {
            bird.velocity = bird.lift;
        }
    });
    canvas.addEventListener('click', () => {
        if (!isGameOver) {
            bird.velocity = bird.lift;
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

birdImage.onload = function() {
    coinImage.onload = function() {
        specialCoinImage.onload = function() {
            gameLoop();
        };
    };
};
