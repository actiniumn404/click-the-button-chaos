// Variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let curScreen = "home";
let mouseX = -1;
let mouseY = -1;
let mouseDown = false;
let frameControl = -1;
let auxloops = new Map(); // auxiliary elements frame loops

let button1 = new Image(100, 200);
button1.src = "assets/button.png";

let theifImg = new Image(100, 200);
theifImg.src = "assets/thief.png";

let pages = {
	home: f_homescreen,
	game: f_game,
};

let pre = {
	home: function () {},
	game: function () {
		game__button__transtimer = 0;
		num_clicks = 0;
		game__timer = 30.0;
		buttonx = 400;
		buttony = 250;
		buttonSpeedX = 2.5;
		buttonSpeedY = 2.5;
	},
};

// Handle the mouse coords
document.body.onmousemove = function (e) {
	c = canvas.getBoundingClientRect();
	mouseX = e.clientX - c.left;
	mouseY = e.clientY - c.top;
	//document.getElementById("span").innerHTML = mouseX + ", " + mouseY;
};

canvas.onmousedown = function () {
	mouseDown = true;
};

canvas.onmouseup = function () {
	mouseDown = false;
};

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Frames
function f_homescreen() {
	ctx.globalAlpha = 1;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Text 1
	ctx.font = "50px Monospace";
	ctx.textAlign = "center";
	ctx.fontWeight = "bolder";
	ctx.fillStyle = "black";
	ctx.fillText("Click the Button Chaos", 500, 100);

	// Text 2
	ctx.font = "30px Monospace";
	ctx.textAlign = "center";
	ctx.fillStyle = "#474747";
	ctx.fontWeight = "normal";
	ctx.fillText("Adapted from Scratch", 500, 150);

	// Start
	ctx.beginPath();
	if (325 <= mouseX && mouseX <= 775 && 200 <= mouseY && mouseY <= 270) {
		ctx.fillStyle = "#bedce6";
		if (mouseDown) {
			curScreen = "game";
			restartFrames();
		}
	} else {
		ctx.fillStyle = "lightblue";
	}
	ctx.fillRect(325, 200, 350, 70);
	ctx.stroke();
	ctx.fillStyle = "black";
	ctx.fillText("Play Multiplayer", 500, 240);
}

class Thief {
	constructor(x, y, speed = 2) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.before = false;
	}
	frame() {
		ctx.drawImage(theifImg, this.x, this.y, 50, 50);
		if (
			this.x - 25 <= mouseX &&
			mouseX <= this.x + 50 &&
			this.y <= mouseY &&
			mouseY <= this.y + 50 &&
			mouseDown
		) {
			auxloops.delete(this);
			num_clicks += 5;
		} else if (
			buttonx - 100 <= this.x &&
			this.x <= buttonx + 200 &&
			buttony <= this.y &&
			this.y <= buttony + 200
		) {
			auxloops.delete(this);
			num_clicks -= 5;
		} else {
			if (this.x < buttonx) {
				this.x += this.speed;
			} else if (this.x > buttonx) {
				this.x -= this.speed;
			}
			if (this.y < buttony) {
				this.y += this.speed;
			} else if (this.x > buttony) {
				this.y -= this.speed;
			}
		}
	}
}

async function f_game() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (loop in auxloops.keys()) {
		if (loop.before) {
			loop.frame();
		}
	}

	// Button madness
	if (
		buttonx - 100 <= mouseX &&
		mouseX <= buttonx + 200 &&
		buttony <= mouseY &&
		mouseY <= buttony + 200 &&
		mouseDown
	) {
		ctx.globalAlpha = 0.7;
		game__button__transtimer = Date.now() + 100;
		num_clicks += 1;
		mouseDown = false;
	}
	if (Date.now() <= game__button__transtimer) {
		ctx.globalAlpha = 0.7;
	}
	ctx.drawImage(button1, buttonx, buttony, 200, 200);

	if (0 >= buttonx || 800 <= buttonx) {
		buttonSpeedX = -buttonSpeedX;
	}
	if (0 >= buttony || 500 <= buttony) {
		buttonSpeedY = -buttonSpeedY;
	}
	buttonx += buttonSpeedX;
	buttony += buttonSpeedY;
	ctx.globalAlpha = 1;

	// Teleport
	if (Math.random() <= 0.01) {
		buttonx = randint(100, 900);
		buttony = randint(100, 600);
	}

	if (Math.random() <= 0.003) {
		x = new Thief(randint(100, 800), randint(100, 800), auxloops.length, 2);
		auxloops.set(x, x);
	}

	// Score
	ctx.font = "40px Monospace";
	ctx.textAlign = "end";
	ctx.fillStyle = "#ad9402";
	ctx.fontWeight = "bolder";
	ctx.fillText(num_clicks + (num_clicks != 1 ? " clicks" : " click "), 970, 50);

	if (game__timer >= 20) {
		ctx.fillStyle = "green";
	} else if (game__timer >= 10) {
		ctx.fillStyle = "#ad9402";
	} else {
		ctx.fillStyle = "red";
	}

	ctx.textAlign = "start";
	ctx.fillText(Math.max(0, game__timer).toFixed(2), 30, 50);

	game__timer -= 60 / 24 / 500;

	if (game__timer <= 0) {
		clearInterval(frameControl);
	}
	for (loop of auxloops.keys()) {
		if (!loop.before) {
			loop.frame();
		}
	}
}

function restartFrames() {
	auxloops = new Map();
	mouseDown = false;
	clearInterval(frameControl);
	pre[curScreen]();
	frameControl = setInterval(pages[curScreen], 60 / 24);
}

restartFrames();

function randint(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
