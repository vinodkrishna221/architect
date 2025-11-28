"use client";

import React, { useEffect, useRef } from "react";

export const KineticBackground = ({ children }: { children?: React.ReactNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const cursorRing = cursorRingRef.current;
        if (!canvas || !cursorRing) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width: number, height: number;
        let cubes: Cube[] = [];
        let animationFrameId: number;
        let lastTime = 0;
        let idleTimer = 0;
        let isIdle = false;

        // Mouse state
        let mouse = { x: -1000, y: -1000 };
        let smoothMouse = { x: -1000, y: -1000 };

        // Physics state
        let kineticEnergy = 0;

        // Configuration
        let gridSize = 35; // Increased from 30 for better performance
        const cubeSize = 14;
        const influenceRadius = 150; // Reduced from 250 as requested
        const decayRate = 0.94;

        // Helper
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

        class Cube {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            flipAngle: number;
            localEnergy: number;
            phase: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.flipAngle = 0;
                this.localEnergy = 0;
                this.phase = Math.random() * Math.PI;
            }

            update() {
                const dx = this.x - smoothMouse.x;
                const dy = this.y - smoothMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < influenceRadius) {
                    const proximity = 1 - dist / influenceRadius;
                    const ease = proximity * proximity;
                    this.localEnergy += kineticEnergy * ease * 0.1;
                }

                this.localEnergy *= 0.93;
                this.flipAngle += this.localEnergy * 0.8;

                this.x = this.baseX;
                this.y = this.baseY;
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (this.localEnergy < 0.05) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.x - cubeSize / 2, this.y - cubeSize / 2, cubeSize, cubeSize);
                    return;
                }

                ctx.save();
                ctx.translate(this.x, this.y);

                const scaleY = Math.cos(this.flipAngle);
                ctx.scale(1, scaleY);

                const r = Math.floor(80 + this.localEnergy * 140);
                const g = Math.floor(this.localEnergy * 100);
                const b = Math.floor(200 + this.localEnergy * 55);
                const alpha = Math.min(1, this.localEnergy * 1.5);

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fillRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);

                ctx.restore();
            }
        }

        function createGrid() {
            cubes = [];
            // Mobile optimization: Increase grid size to reduce cube count on small screens
            gridSize = window.innerWidth < 768 ? 50 : 35;

            for (let y = 0; y < height; y += gridSize) {
                for (let x = 0; x < width; x += gridSize) {
                    cubes.push(new Cube(x + gridSize / 2, y + gridSize / 2));
                }
            }
        }

        function resize() {
            width = canvas!.width = window.innerWidth;
            height = canvas!.height = window.innerHeight;
            createGrid();
        }

        function animate(time: number) {
            // Throttling: If idle for > 5 seconds and low energy, skip frames or stop
            if (kineticEnergy < 0.01 && Date.now() - idleTimer > 5000) {
                isIdle = true;
                // Continue loop but at lower rate or just check mouse
                // For now, we'll just keep running but we could optimize here
            } else {
                isIdle = false;
            }

            smoothMouse.x = lerp(smoothMouse.x, mouse.x, 0.25); // Snappier tracking (0.1 -> 0.25)
            smoothMouse.y = lerp(smoothMouse.y, mouse.y, 0.25);

            if (cursorRing) {
                cursorRing.style.left = smoothMouse.x + "px";
                cursorRing.style.top = smoothMouse.y + "px";
            }

            // Clear with transparency for Hybrid Background
            ctx!.clearRect(0, 0, width, height);

            ctx!.globalCompositeOperation = "lighter";

            kineticEnergy *= decayRate;
            if (kineticEnergy < 0.001) kineticEnergy = 0;

            cubes.forEach((cube) => {
                cube.update();
                cube.draw(ctx!);
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        // Event Handlers
        const handleMouseMove = (e: MouseEvent) => {
            idleTimer = Date.now();
            if (isIdle) isIdle = false;

            if (mouse.x === -1000) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                smoothMouse.x = e.clientX;
                smoothMouse.y = e.clientY;
            }

            const dx = e.clientX - mouse.x;
            const dy = e.clientY - mouse.y;
            const speed = Math.sqrt(dx * dx + dy * dy);

            mouse.x = e.clientX;
            mouse.y = e.clientY;

            kineticEnergy += speed * 0.008;
            if (kineticEnergy > 3) kineticEnergy = 3;

            if (cursorRing) {
                const size = 40 + kineticEnergy * 20;
                cursorRing.style.width = size + "px";
                cursorRing.style.height = size + "px";
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            idleTimer = Date.now();
            const tx = e.touches[0].clientX;
            const ty = e.touches[0].clientY;

            if (mouse.x === -1000) {
                mouse.x = tx;
                mouse.y = ty;
                smoothMouse.x = tx;
                smoothMouse.y = ty;
            }

            const dx = tx - mouse.x;
            const dy = ty - mouse.y;
            const speed = Math.sqrt(dx * dx + dy * dy);

            mouse.x = tx;
            mouse.y = ty;

            kineticEnergy += speed * 0.02;
            if (kineticEnergy > 3) kineticEnergy = 3;
        };

        const handleResize = () => resize();

        // Initialize
        resize();
        animate(0);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-transparent">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full z-0 cursor-none"
            />
            <div
                ref={cursorRingRef}
                className="fixed top-0 left-0 w-[40px] h-[40px] border border-white/30 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10 transition-[width,height] duration-200 mix-blend-difference"
            />
            <div className="relative z-20 w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};
