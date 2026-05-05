/**
 * Application footer with copyright.
 */

import React from "react";
import "./Footer.css";

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <span>© {new Date().getFullYear()} InternQuest. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
