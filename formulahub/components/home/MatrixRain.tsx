'use client';

/**
 * MatrixRain.tsx — Efeito canvas de "chuva de fórmulas" estilo terminal.
 *
 * Responsabilidade única: renderizar a animação de fundo da seção Hero.
 * Isolado aqui para não poluir o componente pai e facilitar testes visuais.
 */

import { useEffect, useRef } from 'react';

const CHARS = '0123456789+=−×÷∑∫πΣΔ√∞≈≠≤≥∂∏∈∉∀∃fxFXSUMIFCOUNTLEFTRIGHTVLOOKUP'.split('');
const FONT_SIZE = 14;
const TARGET_FPS = 22; // frames por segundo — sutil, não distrai

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let columns: number;
    let drops: number[];

    const init = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      columns = Math.floor(canvas.offsetWidth / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.random() * -150);
    };

    init();

    let lastTime = 0;
    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);
      if (time - lastTime < 1000 / TARGET_FPS) return;
      lastTime = time;

      ctx.fillStyle = 'rgba(9, 9, 11, 0.06)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        const ratio = Math.min(1, Math.max(0, drops[i] / (canvas.offsetHeight / FONT_SIZE)));
        const alpha = drops[i] > 0 ? 0.15 - ratio * 0.12 : 0;

        ctx.fillStyle = i % 3 === 0
          ? `rgba(56, 189, 248, ${alpha * 0.7})`  // sky
          : `rgba(139, 92, 246, ${alpha})`;         // violet

        ctx.fillText(char, x, y);

        if (y > canvas.offsetHeight && Math.random() > 0.98) drops[i] = 0;
        drops[i] += 0.25 + Math.random() * 0.35;
      }
    };

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      init();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

