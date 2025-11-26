"use client";

import { useEffect, useRef } from "react";

export const WarpBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: { x: number; y: number; z: number; o: number }[] = [];
        const numStars = 500;
        const speed = 2;
        let width = 0;
        let height = 0;
        let centerX = 0;
        let centerY = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
            canvas.width = width;
            canvas.height = height;
            initStars();
        };

        const initStars = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: (Math.random() - 0.5) * width,
                    y: (Math.random() - 0.5) * height,
                    z: Math.random() * width,
                    o: Math.random(),
                });
            }
        };

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Trail effect
            ctx.fillRect(0, 0, width, height);

            stars.forEach((star) => {
                star.z -= speed;

                if (star.z <= 0) {
                    star.z = width;
                    star.x = (Math.random() - 0.5) * width;
                    star.y = (Math.random() - 0.5) * height;
                }

                const x = (star.x / star.z) * width + centerX;
                const y = (star.y / star.z) * height + centerY;
                const size = (1 - star.z / width) * 3;
                const opacity = (1 - star.z / width);

                if (x >= 0 && x <= width && y >= 0 && y <= height) {
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(100, 150, 255, ${opacity})`;
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        />
    );
};
