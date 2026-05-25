import { memo, useRef, useEffect } from "react";

function ParticleField({ isDark, reduced, parallaxRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic density budget
    const isMobile = width < 768;
    const particleCount = isDark ? (isMobile ? 40 : 100) : (isMobile ? 20 : 50);

    const particles = [];
    const colors = isDark
      ? [
          "rgba(6, 182, 212, ",  // cyan
          "rgba(59, 130, 246, ",  // blue
          "rgba(139, 92, 246, ",  // purple
          "rgba(167, 139, 250, ", // indigo
        ]
      : [
          "rgba(99, 102, 241, ",  // indigo
          "rgba(147, 197, 253, ", // blue
          "rgba(196, 181, 253, ", // lavender
          "rgba(255, 255, 255, ", // white
        ];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const depth = 0.2 + Math.random() * 0.8; // z-depth [0.2, 1.0]
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width, // Store base coordinate for drift
        baseY: Math.random() * height,
        size: depth * (isDark ? 2.5 : 2.0) + 0.5,
        speedX: (Math.random() - 0.5) * 0.2 * depth,
        speedY: -(0.1 + Math.random() * 0.35) * depth, // float upward
        alpha: 0.15 + Math.random() * 0.55 * depth,
        baseAlpha: 0.15 + Math.random() * 0.55 * depth,
        colorPrefix: colors[i % colors.length],
        depth,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.01,
        oscillationRadius: 5 + Math.random() * 15,
      });
    }

    // Handle mouse tracking
    let mouse = { x: null, y: null, targetX: null, targetY: null };
    const onMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.targetX = null;
      mouse.targetY = null;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // Handle resize
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      // Parallax values based on hook ref (global mouse coords)
      let parallaxX = 0;
      let parallaxY = 0;
      if (parallaxRef && parallaxRef.current) {
        parallaxX = (parallaxRef.current.x - 0.5) * 45;
        parallaxY = (parallaxRef.current.y - 0.5) * 30;
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic horizontal drift (sinusoidal)
        p.angle += p.angularSpeed;
        const driftX = Math.sin(p.angle) * p.oscillationRadius * 0.02;

        // Apply velocities
        p.x += p.speedX + driftX;
        p.y += p.speedY;

        // Wrap around top/sides
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Calculate active visual position with depth parallax
        let renderX = p.x + parallaxX * p.depth;
        let renderY = p.y + parallaxY * p.depth;

        // Mouse interaction: push away particles that are close
        if (mouse.x !== null && mouse.y !== null) {
          const dx = renderX - mouse.x;
          const dy = renderY - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 160;

          if (distance < forceRadius) {
            const force = (forceRadius - distance) / forceRadius; // [0, 1]
            // Push away proportional to distance and inversely proportional to depth (farther items resist more)
            const pushDirX = dx / distance;
            const pushDirY = dy / distance;
            const pushDistance = force * 45 * (p.depth + 0.3);

            renderX += pushDirX * pushDistance;
            renderY += pushDirY * pushDistance;

            // Brighten particle slightly on mouse approach
            p.alpha = Math.min(1.0, p.baseAlpha + force * 0.4);
          } else {
            p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.1;
          }
        } else {
          p.alpha = p.alpha + (p.baseAlpha - p.alpha) * 0.1;
        }

        // Draw particle
        ctx.beginPath();
        
        // Draw soft glowing particle
        const grad = ctx.createRadialGradient(
          renderX,
          renderY,
          0,
          renderX,
          renderY,
          p.size * (isDark ? 3.0 : 2.0)
        );
        
        grad.addColorStop(0, `${p.colorPrefix}${p.alpha})`);
        grad.addColorStop(0.3, `${p.colorPrefix}${p.alpha * 0.4})`);
        grad.addColorStop(1, `${p.colorPrefix}0)`);

        ctx.fillStyle = grad;
        ctx.arc(renderX, renderY, p.size * (isDark ? 3.0 : 2.0), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [isDark, reduced, parallaxRef]);

  return (
    <canvas
      ref={canvasRef}
      className="home-cinematic-layer absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ willChange: "transform" }}
      aria-hidden
    />
  );
}

export default memo(ParticleField);
