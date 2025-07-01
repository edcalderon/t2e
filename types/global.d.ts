// Extend the Window interface to include your custom properties
declare global {
  interface Window {
    hideLoadingScreen?: () => void;
  }
}

// This export is needed for TypeScript to treat this file as a module
export {};
