"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import styles from "./TiltedCard.module.css";

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

type TiltedCardProps = {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
};

export default function TiltedCard({
  children,
  className,
  rotateAmplitude = 8,
  scaleOnHover = 1.025,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!ref.current || reduceMotion || event.pointerType !== "mouse") return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    if (!reduceMotion && event.pointerType === "mouse") scale.set(scaleOnHover);
  }

  function handlePointerLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <figure
      ref={ref}
      className={`${styles.figure}${className ? ` ${className}` : ""}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div className={styles.inner} style={{ rotateX, rotateY, scale }}>
        {children}
      </motion.div>
    </figure>
  );
}
