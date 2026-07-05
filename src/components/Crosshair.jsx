/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const lerp = (a, b, n) => (1 - n) * a + n * b;

const getMousePos = (event, container) => {
  if (container) {
    const bounds = container.getBoundingClientRect();

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  return { x: event.clientX, y: event.clientY };
};

const Crosshair = ({ color = "white", containerRef = null }) => {
  const lineHorizontalRef = useRef(null);
  const lineVerticalRef = useRef(null);
  const filterXRef = useRef(null);
  const filterYRef = useRef(null);

  useEffect(() => {
    const target = containerRef?.current || window;
    const mouse = { x: 0, y: 0 };
    let frameId = 0;

    const renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.15 },
      ty: { previous: 0, current: 0, amt: 0.15 },
    };

    const render = () => {
      renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.current = mouse.y;

      Object.keys(renderedStyles).forEach((key) => {
        renderedStyles[key].previous = lerp(
          renderedStyles[key].previous,
          renderedStyles[key].current,
          renderedStyles[key].amt,
        );
      });

      if (lineHorizontalRef.current && lineVerticalRef.current) {
        gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
        gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });
      }

      frameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (event) => {
      mouse.x = getMousePos(event, containerRef?.current).x;
      mouse.y = getMousePos(event, containerRef?.current).y;

      if (!containerRef?.current) {
        return;
      }

      const bounds = containerRef.current.getBoundingClientRect();
      const isOutside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;

      gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
        opacity: isOutside ? 0 : 1,
      });
    };

    gsap.set([lineHorizontalRef.current, lineVerticalRef.current], {
      opacity: 0,
    });

    const onFirstMouseMove = () => {
      renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;

      gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
        duration: 0.9,
        ease: "power3.out",
        opacity: 1,
      });

      frameId = requestAnimationFrame(render);
      target.removeEventListener("mousemove", onFirstMouseMove);
    };

    const primitiveValues = { turbulence: 0 };
    const timeline = gsap
      .timeline({
        paused: true,
        onStart: () => {
          if (lineHorizontalRef.current && lineVerticalRef.current) {
            lineHorizontalRef.current.style.filter = "url(#filter-noise-x)";
            lineVerticalRef.current.style.filter = "url(#filter-noise-y)";
          }
        },
        onUpdate: () => {
          if (filterXRef.current && filterYRef.current) {
            filterXRef.current.setAttribute(
              "baseFrequency",
              primitiveValues.turbulence,
            );
            filterYRef.current.setAttribute(
              "baseFrequency",
              primitiveValues.turbulence,
            );
          }
        },
        onComplete: () => {
          if (lineHorizontalRef.current && lineVerticalRef.current) {
            lineHorizontalRef.current.style.filter = "none";
            lineVerticalRef.current.style.filter = "none";
          }
        },
      })
      .to(primitiveValues, {
        duration: 0.5,
        ease: "power1",
        startAt: { turbulence: 1 },
        turbulence: 0,
      });

    const enter = () => timeline.restart();
    const leave = () => timeline.progress(1).kill();
    const links = containerRef?.current
      ? containerRef.current.querySelectorAll("a")
      : document.querySelectorAll("a");

    target.addEventListener("mousemove", handleMouseMove);
    target.addEventListener("mousemove", onFirstMouseMove);
    links.forEach((link) => {
      link.addEventListener("mouseenter", enter);
      link.addEventListener("mouseleave", leave);
    });

    return () => {
      cancelAnimationFrame(frameId);
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mousemove", onFirstMouseMove);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", enter);
        link.removeEventListener("mouseleave", leave);
      });
      timeline.kill();
    };
  }, [containerRef]);

  return (
    <div
      className="cursor"
      style={{
        position: containerRef ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <filter id="filter-noise-x">
            <feTurbulence
              ref={filterXRef}
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="filter-noise-y">
            <feTurbulence
              ref={filterYRef}
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          background: color,
          pointerEvents: "none",
          transform: "translateY(50%)",
          opacity: 0,
        }}
      />
      <div
        ref={lineVerticalRef}
        style={{
          position: "absolute",
          height: "100%",
          width: "1px",
          background: color,
          pointerEvents: "none",
          transform: "translateX(50%)",
          opacity: 0,
        }}
      />
    </div>
  );
};

export default Crosshair;
