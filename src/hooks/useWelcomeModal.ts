"use client";

import { useEffect, useState } from "react";

interface UseWelcomeModalReturn {
  showModal: boolean;
  handleAccept: () => void;
  resetModal: () => void;
}

const STORAGE_KEY = 'brandtize-welcome-modal-shown';
const STORAGE_VALUE = 'true';

/**
 * Custom hook to manage welcome modal state and persistence
 * Uses localStorage to track if the modal has been shown before
 */
const useWelcomeModal = (): UseWelcomeModalReturn => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check localStorage on mount to determine if modal should be shown
  useEffect(() => {
    if (!isClient) return;

    try {
      const hasSeenModal = localStorage.getItem(STORAGE_KEY);
      if (!hasSeenModal) {
        setShowModal(true);
      }
    } catch (error) {
      // Fallback if localStorage is not available (e.g., private browsing)
      console.warn('localStorage not available, showing welcome modal:', error);
      setShowModal(true);
    }
  }, [isClient]);

  /**
   * Handle modal acceptance - hide modal and store preference
   */
  const handleAccept = (): void => {
    setShowModal(false);
    
    if (!isClient) return;

    try {
      localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
    } catch (error) {
      // Silently fail if localStorage is not available
      console.warn('Could not save welcome modal preference:', error);
    }
  };

  /**
   * Reset modal state - useful for testing or admin purposes
   * Removes the localStorage entry and shows the modal again
   */
  const resetModal = (): void => {
    if (!isClient) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setShowModal(true);
    } catch (error) {
      console.warn('Could not reset welcome modal preference:', error);
    }
  };

  return {
    showModal,
    handleAccept,
    resetModal
  };
};

export default useWelcomeModal;
export type { UseWelcomeModalReturn };
export { STORAGE_KEY, STORAGE_VALUE };