"use client";

import React, { useEffect, useRef } from "react";
import { animate, svg, utils } from "animejs";

function generatePoints() {
  const total = utils.random(4, 64);
  const r1 = utils.random(4, 56);
  const r2 = 56;
  const isOdd = (n) => n % 2;
  let points = "";
  for (let i = 0, l = isOdd(total) ? total + 1 : total; i < l; i++) {
    const r = isOdd(i) ? r1 : r2;
    const a = (2 * Math.PI * i) / l - Math.PI / 2;
    const x = 152 + utils.round(r * Math.cos(a), 0);
    const y = 56 + utils.round(r * Math.sin(a), 0);
    points += `${x},${y} `;
  }
  return points;
}

export default function Morph() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $path1 = root.querySelector("#path-1");
    const $path2 = root.querySelector("#path-2");

    let running = true;

    function animateRandomPoints() {
      if (!running) return;
      // Update the points attribute on #path-2
      utils.set($path2, { points: generatePoints() });
      // Morph the points of #path-1 into #path-2
      animate($path1, {
        points: svg.morphTo($path2),
        ease: "inOutCirc",
        duration: 500,
        onComplete: animateRandomPoints,
      });
    }

    animateRandomPoints();

    return () => {
      running = false;
    };
  }, []);

  return (
    <div className="z-50 flex">
      <svg ref={rootRef} viewBox="0 0 304 112" width="304" height="112" className="h-28 w-auto">
        <g strokeWidth="2" stroke="#00ff00" strokeLinejoin="round" fill="none" fillRule="evenodd">
          <polygon
            id="path-1"
            points="152,4 170,38 204,56 170,74 152,108 134,74 100,56 134,38"
          ></polygon>
          <polygon
            style={{ opacity: 0 }}
            id="path-2"
            points="152,4 170,38 204,56 170,74 152,108 134,74 100,56 134,38"
          ></polygon>
        </g>
      </svg>
    </div>
  );
}
