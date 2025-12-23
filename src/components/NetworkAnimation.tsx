import { useEffect, useRef } from "react";

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
}

export function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const nodes: NetworkNode[] = [];
    const nodeCount = 30;
    const connectionDistance = 150;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2,
          active: Math.random() > 0.7,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        // Glow effect for active nodes
        if (node.active) {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 4
          );
          gradient.addColorStop(0, "hsla(172, 66%, 50%, 0.3)");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.active
          ? "hsl(172, 66%, 50%)"
          : "hsl(217, 91%, 60%)";
        ctx.fill();

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.offsetWidth) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.offsetHeight) node.vy *= -1;

        // Randomly toggle active state
        if (Math.random() < 0.001) node.active = !node.active;
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createNodes();
    draw();

    window.addEventListener("resize", () => {
      resize();
      createNodes();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-50"
      style={{ pointerEvents: "none" }}
    />
  );
}
