const calcCanvas = document.getElementById("calcCanvas");
if (calcCanvas) {
  const ctx = calcCanvas.getContext("2d");
  const w = calcCanvas.width;
  const h = calcCanvas.height;
  const a = 0; // Interval start
  const b = 2 * Math.PI; // Interval end
  let t = 0;
  const maxRectangles = 50; // Maximum number of rectangles

  function f(x) {
    return Math.sin(x) + 2; // Function to integrate
  }

  function drawCalc() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(0, h); // Move origin to bottom-left
    ctx.scale(1, -1); // Flip y-axis for standard coordinates

    // Scale factors
    const scaleX = w / (b - a);
    const scaleY = h / 4; // Scale to fit function values (max f(x) ≈ 3)

    // Draw axes
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0); // x-axis
    ctx.moveTo(0, 0);
    ctx.lineTo(0, h); // y-axis
    ctx.stroke();

    // Draw function curve
    ctx.beginPath();
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 1) {
      const mathX = (x / scaleX) + a;
      const y = f(mathX) * scaleY;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Calculate number of rectangles (increasing over time)
    const numRectangles = Math.floor(5 + (maxRectangles - 5) * (0.5 + 0.5 * Math.sin(t * 0.1)));
    const dx = (b - a) / numRectangles;

    // Draw Riemann sum rectangles (left endpoint method)
    ctx.fillStyle = `rgba(255, 85, 85, ${0.5 + 0.2 * Math.sin(t)})`;
    for (let i = 0; i < numRectangles; i++) {
      const x = a + i * dx;
      const height = f(x); // Left endpoint
      ctx.beginPath();
      ctx.rect(i * dx * scaleX, 0, dx * scaleX, height * scaleY);
      ctx.fill();
    }

    // Draw points on curve to emphasize animation
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + 0.3 * Math.sin(t)})`;
    for (let x = 0; x <= w; x += 20) {
      const mathX = (x / scaleX) + a;
      const y = f(mathX) * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    t += 0.1; // Animation speed
    requestAnimationFrame(drawCalc);
  }
  drawCalc();
}

// --- Linear Algebra: vectors + rotation ---
const laCanvas = document.getElementById("laCanvas");
if (laCanvas) {
  const ctx = laCanvas.getContext("2d");
  const w = laCanvas.width;
  const h = laCanvas.height;
  const scale = 10; // Scale factor for grid and vectors
  const gridSize = 10; // Grid spans -5 to 5 in both x and y
  let t = 0;

  function drawLA() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2); // Center origin
    ctx.scale(1, -1); // Flip y-axis for standard Cartesian coordinates

    // Define time-varying transformation matrix (rotation and scaling)
    const theta = t; // Rotation angle
    const s = 1 + 2 * Math.sin(t); // Scaling factor
    const matrix = [
      [s * Math.cos(theta), -Math.sin(theta)],
      [Math.sin(theta), s * Math.cos(theta)]
    ];

    // Draw transformed grid
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    for (let i = -gridSize; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      const startV = [i, -gridSize];
      const endV = [i, gridSize];
      const transformedStartV = [
        matrix[0][0] * startV[0] + matrix[0][1] * startV[1],
        matrix[1][0] * startV[0] + matrix[1][1] * startV[1]
      ];
      const transformedEndV = [
        matrix[0][0] * endV[0] + matrix[0][1] * endV[1],
        matrix[1][0] * endV[0] + matrix[1][1] * endV[1]
      ];
      ctx.moveTo(transformedStartV[0] * scale, transformedStartV[1] * scale);
      ctx.lineTo(transformedEndV[0] * scale, transformedEndV[1] * scale);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      const startH = [-gridSize, i];
      const endH = [gridSize, i];
      const transformedStartH = [
        matrix[0][0] * startH[0] + matrix[0][1] * startH[1],
        matrix[1][0] * startH[0] + matrix[1][1] * startH[1]
      ];
      const transformedEndH = [
        matrix[0][0] * endH[0] + matrix[0][1] * endH[1],
        matrix[1][0] * endH[0] + matrix[1][1] * endH[1]
      ];
      ctx.moveTo(transformedStartH[0] * scale, transformedStartH[1] * scale);
      ctx.lineTo(transformedEndH[0] * scale, transformedEndH[1] * scale);
      ctx.stroke();
    }

    // Draw original axes
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-gridSize * scale, 0);
    ctx.lineTo(gridSize * scale, 0);
    ctx.moveTo(0, -gridSize * scale);
    ctx.lineTo(0, gridSize * scale);
    ctx.stroke();

    // Draw a vector and its transformation
    const vector = [2, 1]; // Initial vector
    const transformedVector = [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1]
    ];

    // Original vector
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(vector[0] * scale, vector[1] * scale);
    ctx.stroke();
    ctx.fillStyle = `rgba(46, 204, 113, ${0.7 + 0.3 * Math.sin(t)})`;
    ctx.beginPath();
    ctx.arc(vector[0] * scale, vector[1] * scale, 5, 0, Math.PI * 2);
    ctx.fill();

    // Transformed vector
    ctx.strokeStyle = "#ff5555";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(transformedVector[0] * scale, transformedVector[1] * scale);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 85, 85, ${0.7 + 0.3 * Math.sin(t + 1)})`;
    ctx.beginPath();
    ctx.arc(transformedVector[0] * scale, transformedVector[1] * scale, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    t += 0.05; // Slower animation for smooth effect
    requestAnimationFrame(drawLA);
  }
  drawLA();
}

// --- Complex Analysis: Residue theorem demo ---
const caCanvas = document.getElementById("caCanvas");
if (caCanvas) {
  const ctx = caCanvas.getContext("2d");
  const w = caCanvas.width;
  const h = caCanvas.height;
  const centerDomain = {x: w/4, y: h/2};
  const centerRange = {x: 3*w/4, y: h/2};
  const scale = Math.min(w/4, h/2) / 2; // Scale to fit |z| up to ~2.5
  const numRays = 12;
  const numCircles = 5;
  const rMin = 0.1;
  const rMax = 1.5;
  let t = 0;

  function drawCA() {
    ctx.clearRect(0, 0, w, h);

    // Labels
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Domain (z-plane)", centerDomain.x, 30);
    ctx.fillText("Range (w = z²)", centerRange.x, 30);

    // Draw fixed circles in domain and range
    for (let i = 1; i <= numCircles; i++) {
      const r = i / numCircles * rMax;

      // Domain circle
      ctx.beginPath();
      ctx.arc(centerDomain.x, centerDomain.y, r * scale, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(68, 68, 68, ${0.7 + 0.3 * Math.sin(t + i)})`; // Pulsing opacity
      ctx.lineWidth = 1;
      ctx.stroke();

      // Range circle (r²)
      ctx.beginPath();
      ctx.arc(centerRange.x, centerRange.y, (r * r) * scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw rotating rays in domain and transformed in range
    for (let k = 0; k < numRays; k++) {
      const phi = k * 2 * Math.PI / numRays + t * 0.1; // Rotate slowly

      // Domain ray
      ctx.beginPath();
      const x1d = centerDomain.x + rMin * scale * Math.cos(phi);
      const y1d = centerDomain.y + rMin * scale * Math.sin(phi);
      const x2d = centerDomain.x + rMax * scale * Math.cos(phi);
      const y2d = centerDomain.y + rMax * scale * Math.sin(phi);
      ctx.moveTo(x1d, y1d);
      ctx.lineTo(x2d, y2d);
      ctx.strokeStyle = `hsl(${k * 360 / numRays}, 100%, 50%)`; // Color by initial angle
      ctx.lineWidth = 2 + Math.sin(t + k);
      ctx.stroke();

      // Range ray: angle doubled, radius squared
      const phi2 = 2 * phi; // Angle doubling
      ctx.beginPath();
      const x1r = centerRange.x + (rMin * rMin) * scale * Math.cos(phi2);
      const y1r = centerRange.y + (rMin * rMin) * scale * Math.sin(phi2);
      const x2r = centerRange.x + (rMax * rMax) * scale * Math.cos(phi2);
      const y2r = centerRange.y + (rMax * rMax) * scale * Math.sin(phi2);
      ctx.moveTo(x1r, y1r);
      ctx.lineTo(x2r, y2r);
      ctx.stroke();
    }

    // Pulsing dots on unit circle in domain and range
    for (let k = 0; k < numRays; k++) {
      const phi = k * 2 * Math.PI / numRays + t * 0.1;

      // Domain dot
      const xd = centerDomain.x + scale * Math.cos(phi); // At r=1
      const yd = centerDomain.y + scale * Math.sin(phi);
      ctx.beginPath();
      ctx.arc(xd, yd, 3 + 2 * Math.sin(t + k), 0, 2 * Math.PI);
      ctx.fillStyle = "#2ecc71";
      ctx.fill();

      // Range dot: at r=1 (since 1²=1), angle 2*phi
      const phi2 = 2 * phi;
      const xr = centerRange.x + scale * Math.cos(phi2);
      const yr = centerRange.y + scale * Math.sin(phi2);
      ctx.beginPath();
      ctx.arc(xr, yr, 3 + 2 * Math.sin(t + k * 2), 0, 2 * Math.PI); // Pulse at double frequency
      ctx.fill();
    }

    t += 0.1;
    requestAnimationFrame(drawCA);
  }
  drawCA();
}

//number theorem
const ntCanvas = document.getElementById("ntCanvas");
if (ntCanvas) {
  const ctx = ntCanvas.getContext("2d");
  const w = ntCanvas.width;
  const h = ntCanvas.height;
  const n = 36; // Numbers from 1 to 36
  const gridSize = 6; // 6x6 grid
  const cellSize = 30;
  const offsetX = (w - gridSize * cellSize) / 2;
  const offsetY = (h - gridSize * cellSize) / 2;
  let numbers = Array(n).fill(true); // true means not marked as composite
  numbers[0] = numbers[1] = false; // 0 and 1 are not primes
  let currentPrime = 2;
  let t = 0;
  let markingIndex = currentPrime * currentPrime;

  function drawNT() {
    ctx.clearRect(0, 0, w, h);
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw grid
    for (let i = 1; i <= n; i++) {
      const row = Math.floor((i - 1) / gridSize);
      const col = (i - 1) % gridSize;
      const x = offsetX + col * cellSize + cellSize / 2;
      const y = offsetY + row * cellSize + cellSize / 2;

      // Draw cell background
      ctx.beginPath();
      ctx.rect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize, cellSize);
      ctx.strokeStyle = "#444";
      ctx.stroke();

      // Determine color and pulse effect
      let isPrime = i > 1 && numbers[i];
      for (let j = 2; j <= Math.sqrt(i) && isPrime; j++) {
        if (i % j === 0) isPrime = false;
      }
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      if (!numbers[i]) {
        ctx.fillStyle = `rgba(255, 50, 50, ${0.3 + 0.2 * Math.sin(t)})`; // Fading composites
      } else if (isPrime) {
        ctx.fillStyle = `rgba(46, 204, 113, ${0.7 + 0.3 * Math.sin(t + i)})`; // Pulsing primes
      } else {
        ctx.fillStyle = "#ccc"; // Unmarked numbers
      }
      ctx.fill();

      // Draw number
      ctx.fillStyle = "#fff";
      ctx.fillText(i, x, y);
    }

    // Highlight current prime and update sieve
    if (currentPrime <= Math.sqrt(n) && markingIndex <= n) {
      const row = Math.floor((currentPrime - 1) / gridSize);
      const col = (currentPrime - 1) % gridSize;
      const x = offsetX + col * cellSize + cellSize / 2;
      const y = offsetY + row * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 0, ${0.7 + 0.3 * Math.sin(t * 2)})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Update sieve
      if (t % 2 < 0.01) { // Slow down updates for visibility
        numbers[markingIndex] = false;
        markingIndex += currentPrime;
        if (markingIndex > n) {
          currentPrime++;
          while (currentPrime <= Math.sqrt(n) && !numbers[currentPrime]) {
            currentPrime++;
          }
          markingIndex = currentPrime * currentPrime;
        }
      }
    } else if (t % 2 < 0.01) { // Reset when sieve is complete
      numbers = Array(n).fill(true);
      numbers[0] = numbers[1] = false;
      currentPrime = 2;
      markingIndex = currentPrime * currentPrime;
      t = 0; // Reset time for smooth pulsing
    }

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
  const numTerms = 5; // Number of Fourier terms (odd harmonics)
  let t = 0;

  function drawFA() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(0, h / 2); // Center y-axis
    ctx.scale(1, -1); // Flip y-axis for standard coordinates

    // Draw axes
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, h / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();

    // Initialize cumulative sum
    const points = [];
    const scaleX = w / (2 * Math.PI); // Scale x to fit one period
    const scaleY = h / 4; // Scale y for amplitude

    // Draw individual sine waves and compute cumulative sum
    for (let x = 0; x < w; x += 1) {
      const theta = (x / scaleX) + t; // Animate by shifting phase
      let sum = 0;
      for (let n = 1; n <= numTerms; n++) {
        const k = 2 * n - 1; // Odd harmonics: 1, 3, 5, ...
        const amplitude = 4 / (Math.PI * k); // Fourier coefficient for square wave
        const y = amplitude * Math.sin(k * theta);

        // Draw individual sine wave (fainter)
        if (x === 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(46, 204, 113, ${0.3 + 0.1 * Math.sin(t + n)})`;
          ctx.lineWidth = 1;
        }
        ctx.lineTo(x, y * scaleY);
        if (x === w - 1) ctx.stroke();

        sum += y;
      }
      points.push([x, sum * scaleY]);
    }

    // Draw cumulative sum (approximating square wave)
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 85, 85, ${0.7 + 0.3 * Math.sin(t)})`;
    ctx.lineWidth = 3;
    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points on cumulative wave to emphasize animation
    for (let i = 0; i < points.length; i += 20) {
      const [x, y] = points[i];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + 0.3 * Math.sin(t + i * 0.1)})`;
      ctx.fill();
    }

    ctx.restore();
    t += 0.05; // Slow animation for smooth effect
    requestAnimationFrame(drawFA);
  }
  drawFA();
}
