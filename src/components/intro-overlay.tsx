"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import BlurText from "./BlurText";

interface IntroOverlayProps {
  onComplete: () => void;
}

export const IntroOverlay = ({ onComplete }: IntroOverlayProps) => {
  const [blurDone, setBlurDone] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const handleBlurComplete = () => {
    setTimeout(() => {
      setBlurDone(true);
      setTimeout(() => {
        setAnimationDone(true);
      }, 100);
    }, 200);
  };

  return (
    <AnimatePresence
      onExitComplete={onComplete}
    >
      {!animationDone && (
        <motion.div
          key="intro-overlay"
          className="fixed inset-0 z-99999 flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className={blurDone ? "hidden" : ""}>
            <BlurText
              text="Abdul Rahman"
              delay={50}
              animateBy="letters"
              direction="top"
              className="text-4xl md:text-6xl font-bold text-foreground"
              onAnimationComplete={handleBlurComplete}
              stepDuration={0.4}
            />
          </div>

          <motion.h1
            layoutId="name-heading"
            className="text-4xl md:text-6xl font-bold text-foreground absolute"
            style={{ visibility: blurDone ? "visible" : "hidden" }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            Abdul Rahman
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
