/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows users to skip to main content
 */

import React from 'react';
import './SkipLink.css';

const SkipLink = ({ targetId = 'main-content' }) => {
  return (
    <a href={`#${targetId}`} className="skip-link">
      Skip to main content
    </a>
  );
};

export default SkipLink;

