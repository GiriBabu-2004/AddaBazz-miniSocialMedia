import React, { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  children,
}) => {
  const canvasRef = useRef(null);
  const sparks = useRef([]);
  const animationFrameId = useRef(null);

  // Resize canvas with devicePixelRatio support
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = time || performance.now();

      sparks.current = sparks.current.filter(spark => {
        const progress = (now - spark.start) / duration;
        if (progress > 1) return false;

        const dist = progress * sparkRadius;
        const lineLength = sparkSize * (1 - progress);

        const xStart = spark.x + Math.cos(spark.angle) * dist;
        const yStart = spark.y + Math.sin(spark.angle) * dist;
        const xEnd = spark.x + Math.cos(spark.angle) * (dist + lineLength);
        const yEnd = spark.y + Math.sin(spark.angle) * (dist + lineLength);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - progress;

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();

        ctx.globalAlpha = 1;

        return true;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [sparkColor, sparkRadius, sparkSize, duration]);

  const handleClick = useCallback(
    (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        start: now,
      }));

      sparks.current.push(...newSparks);
    },
    [sparkCount]
  );

  return (
    <div
      onClick={handleClick}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
