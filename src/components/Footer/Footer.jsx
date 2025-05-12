/**
 * Footer - Application footer displaying copyright
 *
 * @component
 * @example
 * <Footer />
 */

import React from "react";
import "./Footer.css";

// Renders the application footer with copyright text
const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <span>
        © {new Date().getFullYear()} InternQuest. All rights reserved.
      </span>
    </div>
  </footer>
);

export default Footer;
