const canvas = document.getElementById("contactParticles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

// --- Particles ---
let particles = [];
const colors = ["#2ecc71","#27ae60","#16a085","#1abc9c"];
function Particle(x,y,radius,dx,dy,color){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.dx = dx;
  this.dy = dy;
  this.color = color;

  this.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  this.update = function(){
    this.x += this.dx;
    this.y += this.dy;

    if(this.x+this.radius>canvas.width || this.x-this.radius<0) this.dx*=-1;
    if(this.y+this.radius>canvas.height || this.y-this.radius<0) this.dy*=-1;

    this.draw();
  }
}

function initParticles(){
  particles = [];
  for(let i=0;i<50;i++){
    let radius = Math.random()*4+2;
    let x = Math.random()*(canvas.width-radius*2)+radius;
    let y = Math.random()*(canvas.height-radius*2)+radius;
    let dx = (Math.random()-0.5)*1.5;
    let dy = (Math.random()-0.5)*1.5;
    let color = colors[Math.floor(Math.random()*colors.length)];
    particles.push(new Particle(x,y,radius,dx,dy,color));
  }
}
initParticles();

function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>p.update());
  requestAnimationFrame(animateParticles);
}
animateParticles();
