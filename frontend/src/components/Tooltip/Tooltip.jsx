/**
 * Tooltip on hover/focus with configurable position and delay.
 */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./Tooltip.css";

const PADDING = 8;

const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 200,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({});
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!wrapperRef.current || !tooltipRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = wrapperRect.top + scrollY - tooltipRect.height - PADDING;
        left =
          wrapperRect.left +
          scrollX +
          wrapperRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "bottom":
        top = wrapperRect.bottom + scrollY + PADDING;
        left =
          wrapperRect.left +
          scrollX +
          wrapperRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "left":
        top =
          wrapperRect.top +
          scrollY +
          wrapperRect.height / 2 -
          tooltipRect.height / 2;
        left = wrapperRect.left + scrollX - tooltipRect.width - PADDING;
        break;
      case "right":
        top =
          wrapperRect.top +
          scrollY +
          wrapperRect.height / 2 -
          tooltipRect.height / 2;
        left = wrapperRect.right + scrollX + PADDING;
        break;
      default:
        top = wrapperRect.top + scrollY - tooltipRect.height - PADDING;
        left =
          wrapperRect.left +
          scrollX +
          wrapperRect.width / 2 -
          tooltipRect.width / 2;
    }

    left = Math.max(PADDING, Math.min(left, window.innerWidth - tooltipRect.width - PADDING));
    top = Math.max(
      PADDING + scrollY,
      Math.min(top, window.innerHeight + scrollY - tooltipRect.height - PADDING)
    );

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (!isVisible) return;
    calculatePosition();
    window.addEventListener("scroll", calculatePosition);
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isVisible]);

  if (!content || disabled) return <>{children}</>;

  return (
    <>
      <span
        ref={wrapperRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="tooltip-wrapper"
        style={{ display: "inline-block" }}
      >
        {children}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          style={tooltipPosition}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string,
  position: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  delay: PropTypes.number,
  disabled: PropTypes.bool,
};

export default Tooltip;
