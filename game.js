const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const message = document.getElementById("message");
const startButton = document.getElementById("startButton");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;


// ============================
// 游戏状态
// ============================

let gameRunning = false;

let score = 0;

let lastTime = 0;

let punchEffect = 0;


// ============================
// 玩家
// ============================

const player = {

    x: W / 2 - 80,

    y: H / 2,

    radius: 28,

    speed: 350,

    dx: 0,

    dy: 0
};


// ============================
// 红哥
// ============================

const hongGe = {

    x: W / 2 + 100,

    y: H / 2,

    radius: 30,

    speed: 140,

    dx: 1,

    dy: 0,

    changeTimer: 0
};


// ============================
// 键盘
// ============================

const keys = {};

window.addEventListener("keydown", (e) => {

    keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup", (e) => {

    keys[e.key.toLowerCase()] = false;

});


// ============================
// 手机方向
// ============================

const touchKeys = {
    up: false,
    down: false,
    left: false,
    right: false
};


function bindButton(id, key) {

    const button = document.getElementById(id);

    button.addEventListener("touchstart", (e) => {

        e.preventDefault();

        touchKeys[key] = true;

    }, { passive: false });


    button.addEventListener("touchend", (e) => {

        e.preventDefault();

        touchKeys[key] = false;

    }, { passive: false });


    button.addEventListener("touchcancel", () => {

        touchKeys[key] = false;

    });


    button.addEventListener("mousedown", () => {

        touchKeys[key] = true;

    });


    button.addEventListener("mouseup", () => {

        touchKeys[key] = false;

    });


    button.addEventListener("mouseleave", () => {

        touchKeys[key] = false;

    });

}


bindButton("up", "up");
bindButton("down", "down");
bindButton("left", "left");
bindButton("right", "right");


// ============================
// 开始游戏
// ============================

startButton.addEventListener("click", startGame);


function startGame() {

    gameRunning = true;

    score = 0;

    scoreText.textContent = score;

    startButton.style.display = "none";

    message.style.opacity = 0;

    player.x = W / 2 - 150;

    player.y = H / 2;

    spawnHongGe();

}


// ============================
// 红哥重新出现
// ============================

function spawnHongGe() {

    // 尽量不要出现在玩家旁边

    let angle = Math.random() * Math.PI * 2;

    let distance = Math.min(W, H) * 0.35;

    hongGe.x =
        player.x +
        Math.cos(angle) * distance;

    hongGe.y =
        player.y +
        Math.sin(angle) * distance;


    hongGe.x = Math.max(60, Math.min(W - 60, hongGe.x));

    hongGe.y = Math.max(100, Math.min(H - 60, hongGe.y));


    hongGe.speed = 120 + score * 8;

    hongGe.changeTimer = 0;

}


// ============================
// 玩家移动
// ============================

function updatePlayer(dt) {

    let dx = 0;

    let dy = 0;


    // 键盘

    if (
        keys["w"] ||
        keys["arrowup"] ||
        touchKeys.up
    ) {
        dy -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"] ||
        touchKeys.down
    ) {
        dy += 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"] ||
        touchKeys.left
    ) {
        dx -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"] ||
        touchKeys.right
    ) {
        dx += 1;
    }


    // 防止斜方向速度变快

    if (dx !== 0 || dy !== 0) {

        let length =
            Math.sqrt(dx * dx + dy * dy);

        dx /= length;
        dy /= length;

        player.x += dx * player.speed * dt;

        player.y += dy * player.speed * dt;
    }


    // 限制玩家范围

    player.x = Math.max(
        player.radius,
        Math.min(
            W - player.radius,
            player.x
        )
    );

    player.y = Math.max(
        85,
        Math.min(
            H - player.radius,
            player.y
        )
    );

}


// ============================
// 红哥 AI
// ============================

function updateHongGe(dt) {

    hongGe.changeTimer -= dt;


    // 每隔一段时间改变逃跑方向

    if (hongGe.changeTimer <= 0) {

        hongGe.changeTimer =
            0.5 + Math.random() * 1.5;


        // 朝远离玩家的方向跑

        let dx = hongGe.x - player.x;

        let dy = hongGe.y - player.y;

        let distance =
            Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {

            dx /= distance;

            dy /= distance;

        }


        // 加一点随机性

        let randomAngle =
            (Math.random() - 0.5) * 1.2;

        let cos = Math.cos(randomAngle);
        let sin = Math.sin(randomAngle);

        hongGe.dx =
            dx * cos - dy * sin;

        hongGe.dy =
            dx * sin + dy * cos;

    }


    hongGe.x +=
        hongGe.dx *
        hongGe.speed *
        dt;

    hongGe.y +=
        hongGe.dy *
        hongGe.speed *
        dt;


    // 撞墙反弹

    if (
        hongGe.x <
        hongGe.radius
    ) {

        hongGe.x =
            hongGe.radius;

        hongGe.dx *= -1;

    }


    if (
        hongGe.x >
        W - hongGe.radius
    ) {

        hongGe.x =
            W - hongGe.radius;

        hongGe.dx *= -1;

    }


    if (
        hongGe.y <
        85 + hongGe.radius
    ) {

        hongGe.y =
            85 + hongGe.radius;

        hongGe.dy *= -1;

    }


    if (
        hongGe.y >
        H - hongGe.radius
    ) {

        hongGe.y =
            H - hongGe.radius;

        hongGe.dy *= -1;

    }

}


// ============================
// 碰撞检测
// ============================

function checkCollision() {

    let dx =
        player.x -
        hongGe.x;

    let dy =
        player.y -
        hongGe.y;

    let distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance <
        player.radius +
        hongGe.radius
    ) {

        hitHongGe();

    }

}


// ============================
// 打红哥
// ============================

function hitHongGe() {

    score++;

    scoreText.textContent = score;

    punchEffect = 0.25;


    showHitText();


    // 红哥重新逃

    spawnHongGe();

}


// ============================
// 命中文字
// ============================

function showHitText() {

    message.textContent =
        "💥 打中了！ +1";

    message.style.opacity = 1;

    message.style.transform =
        "translate(-50%, -50%) scale(1.2)";


    setTimeout(() => {

        message.style.opacity = 0;

        message.style.transform =
            "translate(-50%, -50%) scale(1)";

    }, 450);

}


// ============================
// 绘制背景
// ============================

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    // 网格

    ctx.strokeStyle =
        "rgba(255,255,255,.05)";

    ctx.lineWidth = 1;


    let grid = 50;


    for (
        let x = 0;
        x < W;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, H);

        ctx.stroke();

    }


    for (
        let y = 0;
        y < H;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(W, y);

        ctx.stroke();

    }

}


// ============================
// 绘制人物
// ============================

function drawPlayer() {

    // 阴影

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y + 7,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,.3)";

    ctx.fill();


    // 身体

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#19a7ff";

    ctx.fill();


    // 眼睛

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        player.x - 10,
        player.y - 6,
        6,
        0,
        Math.PI * 2
    );

    ctx.arc(
        player.x + 10,
        player.y - 6,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        player.x - 10,
        player.y - 6,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        player.x + 10,
        player.y - 6,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // 标签

    ctx.fillStyle = "white";

    ctx.font =
        "bold 15px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "你",
        player.x,
        player.y + 55
    );

}


// ============================
// 绘制红哥
// ============================

function drawHongGe() {

    // 阴影

    ctx.beginPath();

    ctx.arc(
        hongGe.x,
        hongGe.y + 8,
        hongGe.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,.4)";

    ctx.fill();


    // 红哥身体

    ctx.beginPath();

    ctx.arc(
        hongGe.x,
        hongGe.y,
        hongGe.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ef3030";

    ctx.fill();


    // 红哥眼睛

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        hongGe.x - 11,
        hongGe.y - 7,
        7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        hongGe.x + 11,
        hongGe.y - 7,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        hongGe.x - 11,
        hongGe.y - 7,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        hongGe.x + 11,
        hongGe.y - 7,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // 名字

    ctx.fillStyle = "#fff";

    ctx.font =
        "bold 16px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "红哥",
        hongGe.x,
        hongGe.y + 55
    );

}


// ============================
// 打击特效
// ============================

function drawPunchEffect() {

    if (punchEffect <= 0) {
        return;
    }


    punchEffect -= 0.016;


    ctx.save();

    ctx.strokeStyle =
        "rgba(255,220,0,.9)";

    ctx.lineWidth = 8;


    ctx.beginPath();

    ctx.arc(
        hongGe.x,
        hongGe.y,
        45 + (0.25 - punchEffect) * 80,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();

}


// ============================
// 主循环
// ============================

function gameLoop(time) {

    if (!lastTime) {
        lastTime = time;
    }


    let dt =
        (time - lastTime) / 1000;


    lastTime = time;


    // 防止切后台后 dt 巨大

    dt = Math.min(dt, 0.05);


    drawBackground();


    if (gameRunning) {

        updatePlayer(dt);

        updateHongGe(dt);

        checkCollision();

    }


    drawPlayer();

    drawHongGe();

    drawPunchEffect();


    requestAnimationFrame(gameLoop);

}


requestAnimationFrame(gameLoop);


// ============================
// 浏览器尺寸变化
// ============================

window.addEventListener(
    "resize",
    () => {

        W = window.innerWidth;

        H = window.innerHeight;

        canvas.width = W;

        canvas.height = H;

    }
);
