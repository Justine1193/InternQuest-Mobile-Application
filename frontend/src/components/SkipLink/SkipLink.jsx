/**
 * Skip link for keyboard users to jump to main content.
 */

import React from "react";
import "./SkipLink.css";

const SkipLink = ({ targetId = "main-content" }) => (
  <a href={`#${targetId}`} className="skip-link">
    Skip to main content
  </a>
);

export default SkipLink;
