"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [cursorVariant, setCursorVariant] = useState<"default" | "chaos" | "order">("default");

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6); // Center the 12px circle
      cursorY.set(e.clientY - 6);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorType = target.getAttribute("data-cursor") || target.closest("[data-cursor]")?.getAttribute("data-cursor");
      
      if (cursorType === "chaos") {
        setCursorVariant("chaos");
      } else if (cursorType === "order") {
        setCursorVariant("order");
      } else {
        setCursorVariant("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "transparent",
      border: "1px solid #71717a", // zinc-500
      borderRadius: "50%",
    },
    chaos: {
      width: 24,
      height: 24,
      backgroundColor: "#ef4444", // red-500
      border: "none",
      borderRadius: "50%",
      x: [0, -2, 2, -2, 2, 0], // Jitter
      transition: {
        x: { repeat: Infinity, duration: 0.1 }
      }
    },
    order: {
      width: 20,
      height: 20,
      backgroundColor: "#6366f1", // indigo-500
      border: "none",
      borderRadius: "0%", // Square
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
      variants={variants}
      animate={cursorVariant}
    />
  );
}
