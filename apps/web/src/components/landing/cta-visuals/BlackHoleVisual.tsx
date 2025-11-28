"use client";

import { useEffect, useRef } from "react";

export function BlackHoleVisual() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width: number, height: number, centerX: number, centerY: number;
        let particles: Particle[] = [];
        let animationFrameId: number;
        let isHovering = false;

        // CONFIGURATION
        const particleCount = 400; // Optimized for low-end devices
        let suctionSpeed = 3; // Start fast for "warp" effect
        const targetSuctionSpeed = 1;
        const particleBaseSize = 1.5;
        const artifacts = ["{ }", "</>", "[]", "#", "::"];

        class Particle {
            radius: number;
            angle: number;
            size: number;
            alpha: number;
            velocity: number;
            char: string | null;

            constructor() {
                this.radius = 0;
                this.angle = 0;
                this.size = 0;
                this.alpha = 0;
                this.velocity = 0;
                this.char = null;
                this.reset();
                this.radius = Math.random() * width;
            }

            reset() {
                this.radius = Math.random() * width + 200;
                this.angle = Math.random() * Math.PI * 2;
                this.size = Math.random() * particleBaseSize + 0.5;
                this.alpha = Math.random() * 0.8 + 0.2;
                this.velocity = (Math.random() * 0.005) + 0.002;
                // 5% chance to be an artifact character
                this.char = Math.random() < 0.05 ? artifacts[Math.floor(Math.random() * artifacts.length)] : null;
            }

            update() {
                // Warp entrance effect: slow down suction speed over time
                if (suctionSpeed > targetSuctionSpeed) {
                    suctionSpeed -= 0.01;
                }

                // Orbital physics
                this.angle += this.velocity + (150 / (this.radius + 50)) * 0.02;

                // Gravity suction
                this.radius -= suctionSpeed + (300 / (this.radius + 50));

                // Mouse interaction: Repel/Attract
                if (isHovering) {
                    const dx = mouseRef.current.x - (centerX + Math.cos(this.angle) * this.radius);
                    const dy = mouseRef.current.y - (centerY + Math.sin(this.angle) * this.radius * 0.6);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 200) {
                        // Subtle repulsion to create a path
                        this.angle += 0.01;
                        this.radius += 2;
                    }
                }

                // Event Horizon threshold
                if (this.radius < 35) {
                    this.reset();
                }
            }

            draw(context: CanvasRenderingContext2D) {
                const x = centerX + Math.cos(this.angle) * this.radius;
                const y = centerY + Math.sin(this.angle) * this.radius * 0.6;

                const distanceFade = Math.min(1, 1000 / this.radius);
                context.fillStyle = `rgba(255, 255, 255, ${this.alpha * distanceFade})`;

                if (this.char) {
                    context.font = `${this.size * 8}px monospace`;
                    context.fillText(this.char, x, y);
                } else {
                    context.beginPath();
                    context.arc(x, y, this.size, 0, Math.PI * 2);
                    context.fill();
                }
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function resize() {
            if (!canvas) return;
            // Force DPR to 1 for performance
            width = canvas.width = canvas.clientWidth;
            height = canvas.height = canvas.clientHeight;
            centerX = width / 2;
            centerY = height / 2;
        }

        function animate() {
            if (!ctx) return;

            ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            // Accretion Disk Glow - REMOVED expensive shadowBlur for performance

            // Event Horizon
            ctx.beginPath();
            ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();

            // Photon Ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 3;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(animate);
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            isHovering = true;
        };

        const handleMouseLeave = () => {
            isHovering = false;
        };

        resize();
        createParticles();
        animate();

        const handleResize = () => {
            resize();
            createParticles();
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            style={{
                filter: 'brightness(1.1) contrast(1.1) grayscale(100%)',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}
        />
    );
}
