/**
 * Enhanced keyboard shortcuts hook
 * Provides keyboard shortcuts for common actions
 */

import { useEffect } from 'react';

const shortcuts = {
  // Navigation
  'g d': () => window.location.href = '/dashboard',
  'g s': () => window.location.href = '/StudentDashboard',
  'g h': () => window.location.href = '/helpDesk',
  'g a': () => window.location.href = '/adminManagement',
  
  // Actions
  'ctrl+k': (e) => {
    e.preventDefault();
    // Focus search input if available
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  },
  
  // Escape to close modals
  'escape': () => {
    const modals = document.querySelectorAll('.modal, .confirm-action-overlay, .session-warning-overlay');
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1];
      const closeBtn = lastModal.querySelector('button[aria-label="Close"], .close-btn, .confirm-action-close');
      if (closeBtn) closeBtn.click();
    }
  },
};

/**
 * Hook to register keyboard shortcuts
 * @param {object} customShortcuts - Custom shortcuts to add
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
const useKeyboardShortcuts = (customShortcuts = {}, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const allShortcuts = { ...shortcuts, ...customShortcuts };

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        // Allow Escape and Ctrl+K even in inputs
        if (e.key === 'Escape') {
          allShortcuts['escape']?.(e);
        }
        if (e.ctrlKey && e.key === 'k') {
          allShortcuts['ctrl+k']?.(e);
        }
        return;
      }

      // Handle key combinations
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Check for exact matches
      let shortcutKey = null;

      if (ctrl && key === 'k') {
        shortcutKey = 'ctrl+k';
      } else if (key === 'escape' || key === 'esc') {
        shortcutKey = 'escape';
      } else if (key === 'g' && !ctrl && !shift && !alt) {
        // Wait for next key for 'g' shortcuts
        const handleNextKey = (nextE) => {
          const nextKey = nextE.key.toLowerCase();
          shortcutKey = `g ${nextKey}`;
          if (allShortcuts[shortcutKey]) {
            allShortcuts[shortcutKey](nextE);
          }
          document.removeEventListener('keydown', handleNextKey);
        };
        document.addEventListener('keydown', handleNextKey, { once: true });
        return;
      }

      if (shortcutKey && allShortcuts[shortcutKey]) {
        allShortcuts[shortcutKey](e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [customShortcuts, enabled]);
};

export default useKeyboardShortcuts;
