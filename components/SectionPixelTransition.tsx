'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import PixelSwap from './PixelSwap';

interface SectionPixelTransitionProps {
  children: React.ReactNode;
}

export default function SectionPixelTransition({ children }: SectionPixelTransitionProps) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const [active, setActive] = useState(false);
  const [slotA, setSlotA] = useState<React.ReactNode>(children);
  const [slotB, setSlotB] = useState<React.ReactNode>(children);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;

      setActive((currentActive) => {
        const nextActive = !currentActive;
        if (nextActive) {
          // Navigated to a new section, loading new section into Slot B
          setSlotB(children);
        } else {
          // Navigated to a new section, loading new section into Slot A
          setSlotA(children);
        }
        return nextActive;
      });
    } else {
      // In-page reactive update without route change
      if (active) {
        setSlotB(children);
      } else {
        setSlotA(children);
      }
    }
  }, [pathname, children, isMounted, active]);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <PixelSwap
      firstContent={<div className="w-full h-full min-h-[400px]">{slotA}</div>}
      secondContent={<div className="w-full h-full min-h-[400px]">{slotB}</div>}
      active={active}
      trigger="manual"
      pixelSize={56}
      gap={0}
      pixelRadius={0}
      pixelSpin={0}
      pixelScale={0.35}
      duration={1000}
      pixelDuration={350}
      pattern="random"
      randomness={0.15}
      fade={true}
      aspectRatio="unset"
      className="w-full min-h-[400px]"
    />
  );
}
