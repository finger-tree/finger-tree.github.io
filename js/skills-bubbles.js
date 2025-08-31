const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// --- BUBBLE CLASS ---
class Bubble {
    constructor(x, y, radius, imgSrc) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.img = new Image();
        this.img.src = imgSrc;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
            this.img,
            this.x - this.radius,
            this.y - this.radius,
            this.radius * 2,
            this.radius * 2
        );

        ctx.restore();
    }

    update(bubbles, mouse) {
        // attraction to center
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let ax = (centerX - this.x) * 0.001;
        let ay = (centerY - this.y) * 0.001;
        this.dx += ax;
        this.dy += ay;

        // move
        this.x += this.dx/100;
        this.y += this.dy/100;

        // bounce on edges (elastic)
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx *= -1;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.dx *= -1;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy *= -1;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy *= -1;
        }

        // collisions with other bubbles
        for (let other of bubbles) {
            if (other === this) continue;
            let dist = Math.hypot(this.x - other.x, this.y - other.y);
            if (dist < this.radius + other.radius) {
                let angle = Math.atan2(this.y - other.y, this.x - other.x);
                let overlap = this.radius + other.radius - dist;
                this.x += Math.cos(angle) * overlap / 2;
                this.y += Math.sin(angle) * overlap / 2;
                other.x -= Math.cos(angle) * overlap / 2;
                other.y -= Math.sin(angle) * overlap / 2;
            }
        }

        // mouse hover effect
        if (mouse.x && Math.hypot(this.x - mouse.x, this.y - mouse.y) < this.radius) {
            this.radius = Math.min(this.baseRadius * 1.6, this.radius + 2);
        } else {
            if (this.radius > this.baseRadius) this.radius -= 1;
        }

        this.draw();
    }

}

// --- INIT BUBBLES ---
let logos = [
    "assets/python.png",
    "assets/hackerrank.png",
    "assets/c.png",
    "assets/cpp.png",
    "assets/codewars.png",
    "assets/java.png",
    "assets/javascript.png",
    "assets/sql.png",
    "assets/html.png",
    "assets/css.png",
    "assets/shell.png"
];

let bubbles = [];
function init() {
    bubbles = [];
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    logos.forEach((src, i) => {
        let angle = (i / logos.length) * Math.PI * 2;
        let x = centerX + Math.cos(angle) * 150;
        let y = centerY + Math.sin(angle) * 150;
        bubbles.push(new Bubble(x, y, 100, src));
    });
}
init();

// --- MOUSE TRACKING ---
let mouse = { x: null, y: null };
canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
});

// --- ANIMATION LOOP ---
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach((b) => b.update(bubbles, mouse));
    requestAnimationFrame(animate);
}
animate();
