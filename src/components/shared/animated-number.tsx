"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const [displayValue, setDisplayValue] = useState(`${prefix}${value.toFixed(decimals)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.on("change", (v) => {
      setDisplayValue(`${prefix}${v.toFixed(decimals)}${suffix}`);
    });
    spring.set(value);
  }, [spring, value, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
