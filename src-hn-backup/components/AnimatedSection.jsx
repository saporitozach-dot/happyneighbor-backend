import React from "react";
import { useInView } from "../hooks/useInView";

/**
 * Shared scroll-triggered section. Uses consistent animation across pages.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className] - Additional classes
 * @param {string} [props.animation] - 'slideUp' | 'fade'
 * @param {number} [props.delay] - Stagger delay in ms
 * @param {Object} [props.inViewOptions] - Passed to useInView (threshold, rootMargin)
 */
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  inViewOptions = {},
}) => {
  const [ref, inView] = useInView({ threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...inViewOptions });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
