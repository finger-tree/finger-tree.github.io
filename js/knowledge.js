// CALCULUS DEMO: sine curve + moving tangent line
const calcCanvas = document.getElementById("calcCanvas");
if (calcCanvas) {
  const ctx = calcCanvas.getContext("2d");
  const w = calcCanvas.width;
  const h = calcCanvas.height;

  let t = 0;

  function drawCurve() {
    ctx.clearRect(0, 0, w, h);

    // axes
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // sine curve
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      let y = h / 2 - 50 * Math.sin((x / w) * 4 * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // moving point
    let px = (t % w);
    let py = h / 2 - 50 * Math.sin((px / w) * 4 * Math.PI);

    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // tangent line
    let slope = -50 * (4 * Math.PI / w) * Math.cos((px / w) * 4 * Math.PI);
    ctx.strokeStyle = "#e67e22";
    ctx.beginPath();
    for (let dx = -50; dx <= 50; dx++) {
      let x1 = px + dx;
      let y1 = py + slope * dx;
      if (dx === -50) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
    }
    ctx.stroke();

    t += 2;
    requestAnimationFrame(drawCurve);
  }

  drawCurve();
}

// --- Linear Algebra: vectors + rotation ---
const laCanvas = document.getElementById("laCanvas");
if (laCanvas) {
  const ctx = laCanvas.getContext("2d");
  const w = laCanvas.width;
  const h = laCanvas.height;
  let angle = 0;

  function drawLA() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;

    const vectors = [
      {x: 50, y: 0},
      {x: 0, y: 50},
      {x: 35, y: 35}
    ];

    vectors.forEach(v => {
      ctx.beginPath();
      ctx.moveTo(w/2, h/2);
      const x = w/2 + v.x*Math.cos(angle) - v.y*Math.sin(angle);
      const y = h/2 + v.x*Math.sin(angle) + v.y*Math.cos(angle);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    angle += 0.02;
    requestAnimationFrame(drawLA);
  }
  drawLA();
}

// --- Complex Analysis: rotating points on circle under z^2 map ---
const caCanvas = document.getElementById("caCanvas");
if (caCanvas) {
  const ctx = caCanvas.getContext("2d");
  const w = caCanvas.width;
  const h = caCanvas.height;
  const n = 30;
  let t = 0;

  function drawCA() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#2ecc71";

    for (let i=0;i<n;i++){
      let theta = (i/n)*Math.PI*2 + t;
      let x = Math.cos(theta);
      let y = Math.sin(theta);

      // z -> z^2 map
      let x2 = x*x - y*y;
      let y2 = 2*x*y;

      ctx.beginPath();
      ctx.arc(w/2 + x2*60, h/2 + y2*60, 5, 0, Math.PI*2);
      ctx.fill();
    }

    t += 0.02;
    requestAnimationFrame(drawCA);
  }
  drawCA();
}

// --- Number Theory: primes pulse ---
const ntCanvas = document.getElementById("ntCanvas");
if (ntCanvas) {
  const ctx = ntCanvas.getContext("2d");
  const w = ntCanvas.width;
  const h = ntCanvas.height;
  const primes = [2,3,5,7,11,13,17,19,23,29,31];
  let t = 0;

  function drawNT() {
    ctx.clearRect(0,0,w,h);
    primes.forEach((p,i) => {
      ctx.beginPath();
      let radius = 5 + 3*Math.sin(t + i);
      ctx.arc(30 + i*25, h/2, radius, 0, Math.PI*2);
      ctx.fillStyle = "#2ecc71";
      ctx.fill();
    });
    t += 0.1;
    requestAnimationFrame(drawNT);
  }
  drawNT();
}

// --- Fourier Analysis: additive sine waves forming square wave ---
const faCanvas = document.getElementById("faCanvas");
if (faCanvas) {
  const ctx = faCanvas.getContext("2d");
  const w = faCanvas.width;
  const h = faCanvas.height;
  let t = 0;
  const harmonics = [1,3,5,7];

  function drawFA() {
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x=0;x<w;x++){
      let y = 0;
      harmonics.forEach(n => {
        y += (1/n)*Math.sin(2*Math.PI*n*(x/w) + t);
      });
      y *= 20; // scale
      if (x===0) ctx.moveTo(x,h/2 - y);
      else ctx.lineTo(x,h/2 - y);
    }
    ctx.stroke();
    t += 0.05;
    requestAnimationFrame(drawFA);
  }
  drawFA();
}
