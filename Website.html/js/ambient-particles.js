(function () {
  var canvas = document.getElementById("ambient-particles");
  if (!canvas) return;

  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var colors = ["#22d3ee", "#8b5cf6", "#3b82f6", "#ff5d72", "#34e0a1"];
  var particles = [];
  var width = 0;
  var height = 0;
  var dpr = 1;
  var frameId = 0;
  var pointer = { active: false, x: 0, y: 0 };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function center() {
    return {
      x: width * 0.56,
      y: height * 0.46
    };
  }

  function resetParticle(p, fromCore) {
    var c = center();
    var angle = rand(0, Math.PI * 2);
    var radius = fromCore ? rand(18, Math.min(width, height) * 0.26) : rand(0, Math.max(width, height));
    var speed = rand(0.14, 0.48);

    p.x = fromCore ? c.x + Math.cos(angle) * radius : rand(0, width);
    p.y = fromCore ? c.y + Math.sin(angle) * radius : rand(0, height);
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.size = rand(0.7, 1.9);
    p.length = rand(2.5, 7.5);
    p.alpha = rand(0.24, 0.78);
    p.color = colors[Math.floor(rand(0, colors.length))];
    p.phase = rand(0, Math.PI * 2);
  }

  function particleTotal() {
    return Math.max(80, Math.min(180, Math.floor((width * height) / 6200)));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var total = particleTotal();
    particles.length = total;
    for (var i = 0; i < total; i += 1) {
      if (!particles[i]) particles[i] = {};
      resetParticle(particles[i], false);
    }
    draw(0);
  }

  function updateParticle(p) {
    var c = center();
    var dx = p.x - c.x;
    var dy = p.y - c.y;
    var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var outward = 0.0055;
    var spin = 0.0042;

    p.vx += (dx / dist) * outward + (-dy / dist) * spin;
    p.vy += (dy / dist) * outward + (dx / dist) * spin;

    if (pointer.active) {
      var px = p.x - pointer.x;
      var py = p.y - pointer.y;
      var pointerDist = Math.sqrt(px * px + py * py);
      if (pointerDist > 0 && pointerDist < 150) {
        var force = (1 - pointerDist / 150) * 0.045;
        p.vx += (px / pointerDist) * force;
        p.vy += (py / pointerDist) * force;
      }
    }

    p.vx *= 0.986;
    p.vy *= 0.986;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
      resetParticle(p, true);
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      var pulse = 0.72 + Math.sin(time * 0.0016 + p.phase) * 0.28;
      var alpha = p.alpha * pulse;
      var tailX = p.x - p.vx * p.length * 8;
      var tailY = p.y - p.vy * p.length * 8;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function tick(time) {
    for (var i = 0; i < particles.length; i += 1) {
      updateParticle(particles[i]);
    }
    draw(time);
    frameId = window.requestAnimationFrame(tick);
  }

  function start() {
    window.cancelAnimationFrame(frameId);
    resize();
    if (!reduceMotion.matches) {
      frameId = window.requestAnimationFrame(tick);
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (event) {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  window.addEventListener("pointerleave", function () {
    pointer.active = false;
  });

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", start);
  }

  start();
})();
