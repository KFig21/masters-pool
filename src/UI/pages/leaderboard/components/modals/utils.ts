import { useEffect, type Dispatch, type SetStateAction } from 'react';

// Close Modal (animation)
export const onClose = (
  setIsClosing: Dispatch<SetStateAction<boolean>>,
  handleModal: () => void,
) => {
  setIsClosing(true);
  // Matches the 0.3s - 0.4s animation duration in SCSS
  setTimeout(() => {
    handleModal();
  }, 300);
};

// Keyboard functionality ('esc' to close)
export const useEscapeKey = (onCloseTrigger: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseTrigger();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Cleanup the listener when the modal closes
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCloseTrigger]);
};
