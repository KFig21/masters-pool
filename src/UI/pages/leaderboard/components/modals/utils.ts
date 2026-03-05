import type { Dispatch, SetStateAction } from 'react';

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
