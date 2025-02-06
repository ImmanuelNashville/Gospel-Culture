import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { CSSProperties, Fragment } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  removeLineHeight?: boolean;
  fitToScreen?: boolean;
  showCloseButton?: boolean;
  closeButton?: React.ReactNode;
  children?: React.ReactNode;
}

const Modal = ({
  open,
  onClose,
  children,
  removeLineHeight = false,
  fitToScreen = false,
  showCloseButton = false,
  closeButton,
}: ModalProps) => {
  const customStyle: CSSProperties = {};

  if (removeLineHeight) {
    customStyle.lineHeight = 0;
  }

  if (fitToScreen) {
    customStyle.maxHeight = '90vh';
    customStyle.maxWidth = '95vw';
  }

  const close = closeButton ?? (
    <div className="absolute top-0 right-0 z-10 pt-4 pr-4">
      <button
        type="button"
        className="focus:outline-none text-white hover:text-gray-300 focus:ring-2 focus:ring-bt-teal focus:ring-offset-2"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <XIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gradient-to-tr from-gray-900/75 to-gray-600/75 dark:from-gray-950 dark:to-gray-950/90 transition-opacity backdrop-blur-sm" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className="inline-block transform overflow-hidden rounded-lg bg-bt-off-white align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:max-w-screen-xl sm:align-middle"
              style={customStyle}
            >
              {showCloseButton && close}
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
