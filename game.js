const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


const scoreText =
    document.getElementById("score");


const message =
    document.getElementById("message");


const startButton =
    document.getElementById("startButton");


const joystick =
    document.getElementById("joystick");


const joystickKnob =
    document.getElementById("joystickKnob");


const attackButton =
    document.getElementById("attackButton");


// =================================
// 画布
// =================================

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;


// =================================
// 游戏状态
// =================================

let gameRunning = false;

let score = 0;

let lastTime = 0;

let punchEffect = 0;

let attackCooldown = 0;

let attackPressed = false;


// =================================
// 玩家
// =================================

const player = {

    x: W / 2 - 120,

    y: H / 2,

    radius: 30,

    speed: 340

};


// =================================
// 红哥
// =================================

const hongGe = {

    x: W / 2 + 150,

    y: H / 2,

    radius: 35,

    speed: 150,

    dx: 1,

    dy: 0,

    changeTimer: 0

};


// =================================
// 红哥图片
// =================================

const hongGeImage =
    new Image();

hongGeImage.src =
    "hongge.png";


// =================================
// 键盘
// =================================

const keys = {};


window.addEventListener(
    "keydown",
    function (e) {

        keys[e.key.toLowerCase()] = true;


        // 空格/J攻击
        if (
            e.key === " " ||
            e.key.toLowerCase() === "j"
        ) {

            attackPressed = true;

        }

    }
);


window.addEventListener(
    "keyup",
    function (e) {

        keys[e.key.toLowerCase()] = false;

    }
);


// =================================
// 手机摇杆
// =================================

let joystickActive = false;

let joystickX = 0;

let joystickY = 0;


const joystickMaxDistance = 38;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        clientX - centerX;


    let dy =
        clientY - centerY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        joystickMaxDistance
    ) {

        dx =
            dx /
            distance *
            joystickMaxDistance;

        dy =
            dy /
            distance *
            joystickMaxDistance;

    }


    joystickX =
        dx /
        joystickMaxDistance;


    joystickY =
        dy /
        joystickMaxDistance;


    joystickKnob.style.transform =
        `translate(calc(-50% + ${dx}px),
                   calc(-50% + ${dy}px))`;
}


// ---------------------------------
// 触摸开始
// ---------------------------------

joystick.addEventListener(
    "touchstart",
    function (e) {

        e.preventDefault();

        joystickActive = true;

        const touch =
            e.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


// ---------------------------------
// 触摸移动
// ---------------------------------

joystick.addEventListener(
    "touchmove",
    function (e) {

        e.preventDefault();

        if (!joystickActive) {
            return;
        }

        const touch =
            e.touches[0];

        updateJoystick(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


// ---------------------------------
// 触摸结束
// ---------------------------------

joystick.addEventListener(
    "touchend",
    function (e) {

        e.preventDefault();

        joystickActive = false;

        joystickX = 0;

        joystickY = 0;

        joystickKnob.style.transform =
            "translate(-50%, -50%)";

    },
    {
        passive: false
    }
);


joystick.addEventListener(
    "touchcancel",
    function () {

        joystickActive = false;

        joystickX = 0;

        joystickY = 0;

        joystickKnob.style.transform =
            "translate(-50%, -50%)";

    }
);


// =================================
// 手机攻击按钮
// =================================

function mobileAttack(e) {

    e.preventDefault();

    attackPressed = true;

}


attackButton.addEventListener(
    "touchstart",
    mobileAttack,
    {
        passive: false
    }
);


attackButton.addEventListener(
    "mousedown",
    mobileAttack
);


// =================================
// 开始游戏
// =================================

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    gameRunning = true;

    score = 0;

    scoreText.textContent =
        score;

    startButton.style.display =
        "none";

    message.style.opacity = 0;

    player.x =
        W / 2 - 150;

    player.y =
        H / 2;


    spawnHongGe();

}


// =================================
// 红哥重新出现
// =================================

function spawnHongGe() {

    const angle =
        Math.random() *
        Math.PI *
        2;


    const distance =
        Math.min(W, H) *
        0.35;


    hongGe.x =
        player.x +
        Math.cos(angle) *
        distance;


    hongGe.y =
        player.y +
        Math.sin(angle) *
        distance;


    hongGe.x =
        Math.max(
            70,
            Math.min(
                W - 70,
                hongGe.x
            )
        );


    hongGe.y =
        Math.max(
            110,
            Math.min(
                H - 70,
                hongGe.y
            )
        );


    hongGe.speed =
        150 +
        score * 7;


    hongGe.changeTimer =
        0;

}


// =================================
// 玩家移动
// =================================

function updatePlayer(dt) {

    let dx = 0;

    let dy = 0;


    // -------------------------
    // 键盘
    // -------------------------

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy -= 1;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy += 1;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx -= 1;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx += 1;

    }


    // -------------------------
    // 手机摇杆
    // -------------------------

    if (
        Math.abs(joystickX) > 0.08 ||
        Math.abs(joystickY) > 0.08
    ) {

        dx = joystickX;

        dy = joystickY;

    }


    // -------------------------
    // 移动
    // -------------------------

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (length > 0) {

        dx /= length;

        dy /= length;


        player.x +=
            dx *
            player.speed *
            dt;


        player.y +=
            dy *
            player.speed *
            dt;

    }


    // -------------------------
    // 边界
    // -------------------------

    player.x =
        Math.max(
            player.radius,
            Math.min(
                W -
                player.radius,
                player.x
            )
        );


    player.y =
        Math.max(
            90,
            Math.min(
                H -
                player.radius,
                player.y
            )
        );

}


// =================================
// 红哥 AI
// =================================

function updateHongGe(dt) {

    hongGe.changeTimer -= dt;


    if (
        hongGe.changeTimer <= 0
    ) {

        hongGe.changeTimer =
            0.5 +
            Math.random() *
            1.2;


        let dx =
            hongGe.x -
            player.x;


        let dy =
            hongGe.y -
            player.y;


        let distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > 0) {

            dx /= distance;

            dy /= distance;

        }


        // 添加随机方向

        const angle =
            (Math.random() - 0.5) *
            1.0;


        const cos =
            Math.cos(angle);


        const sin =
            Math.sin(angle);


        hongGe.dx =
            dx * cos -
            dy * sin;


        hongGe.dy =
            dx * sin +
            dy * cos;

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
        W -
        hongGe.radius
    ) {

        hongGe.x =
            W -
            hongGe.radius;

        hongGe.dx *= -1;

    }


    if (
        hongGe.y <
        90 +
        hongGe.radius
    ) {

        hongGe.y =
            90 +
            hongGe.radius;

        hongGe.dy *= -1;

    }


    if (
        hongGe.y >
        H -
        hongGe.radius
    ) {

        hongGe.y =
            H -
            hongGe.radius;

        hongGe.dy *= -1;

    }

}


// =================================
// 攻击检测
// =================================

function checkAttack() {

    if (!attackPressed) {
        return;
    }


    if (attackCooldown > 0) {
        return;
    }


    attackPressed = false;


    attackCooldown = 0.35;


    const dx =
        player.x -
        hongGe.x;


    const dy =
        player.y -
        hongGe.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    // 攻击范围

    const attackDistance = 100;


    if (
        distance <=
        attackDistance
    ) {

        hitHongGe();

    }

}


// =================================
// 命中
// =================================

function hitHongGe() {

    score++;

    scoreText.textContent =
        score;


    punchEffect =
        0.35;


    showHitText();


    spawnHongGe();

}


// =================================
// 命中文字
// =================================

function showHitText() {

    message.textContent =
        "💥 打中了！ +1";


    message.style.opacity =
        1;


    message.style.transform =
        "translate(-50%, -50%) scale(1.2)";


    setTimeout(
        function () {

            message.style.opacity =
                0;


            message.style.transform =
                "translate(-50%, -50%) scale(1)";

        },
        400
    );

}


// =================================
// 背景
// =================================

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


    const grid = 50;


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


// =================================
// 玩家
// =================================

function drawPlayer() {

    // 阴影

    ctx.beginPath();

    ctx.ellipse(
        player.x,
        player.y + 8,
        28,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.fill();


    // 玩家圆形

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#13a7ff";

    ctx.fill();


    // 眼睛

    ctx.fillStyle =
        "white";


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


    // 名字

    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 15px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "你",
        player.x,
        player.y + 50
    );

}


// =================================
// 红哥图片
// =================================

function drawHongGe() {

    const maxWidth = 100;

    const maxHeight = 120;


    let width =
        maxWidth;


    let height =
        maxHeight;


    if (
        hongGeImage.complete &&
        hongGeImage.naturalWidth > 0
    ) {

        const ratio =
            hongGeImage.naturalWidth /
            hongGeImage.naturalHeight;


        width =
            maxWidth;


        height =
            width / ratio;


        if (
            height >
            maxHeight
        ) {

            height =
                maxHeight;


            width =
                height *
                ratio;

        }


        // 阴影

        ctx.beginPath();

        ctx.ellipse(
            hongGe.x,
            hongGe.y + 50,
            width * 0.28,
            10,
            0,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(0,0,0,.35)";


        ctx.fill();


        // 人物

        ctx.drawImage(
            hongGeImage,

            hongGe.x -
            width / 2,

            hongGe.y -
            height / 2,

            width,
            height
        );

    }


    // 名字

    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 16px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "红哥",
        hongGe.x,
        hongGe.y +
        maxHeight / 2 +
        15
    );

}


// =================================
// 打击特效
// =================================

function drawPunchEffect() {

    if (
        punchEffect <= 0
    ) {

        return;

    }


    punchEffect -= 0.016;


    ctx.save();


    ctx.strokeStyle =
        "rgba(255,220,0,.9)";


    ctx.lineWidth =
        8;


    ctx.beginPath();


    ctx.arc(
        hongGe.x,
        hongGe.y,

        45 +
        (0.35 -
        punchEffect) *
        100,

        0,
        Math.PI * 2
    );


    ctx.stroke();


    ctx.restore();

}


// =================================
// 游戏循环
// =================================

function gameLoop(time) {

    if (!lastTime) {

        lastTime =
            time;

    }


    let dt =
        (time -
        lastTime) /
        1000;


    lastTime =
        time;


    dt =
        Math.min(
            dt,
            0.05
        );


    if (attackCooldown > 0) {

        attackCooldown -= dt;

    }


    drawBackground();


    if (gameRunning) {

        updatePlayer(dt);

        updateHongGe(dt);

        checkAttack();

    }


    drawPlayer();

    drawHongGe();

    drawPunchEffect();


    requestAnimationFrame(
        gameLoop
    );

}


requestAnimationFrame(
    gameLoop
);


// =================================
// 窗口变化
// =================================

window.addEventListener(
    "resize",
    function () {

        W =
            window.innerWidth;


        H =
            window.innerHeight;


        canvas.width =
            W;


        canvas.height =
            H;

    }
);
