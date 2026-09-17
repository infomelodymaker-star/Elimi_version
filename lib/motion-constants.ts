/**
 * Emil Kowalski's Design Engineering & Motion Physics Constants
 * 
 * Standards:
 * - Sub-300ms UI interactions with responsive ease-out curves
 * - Custom cubic-bezier easings (never weak built-ins or sluggish ease-in)
 * - Spring physics: { type: "spring", duration: 0.4 - 0.5, bounce: 0.15 - 0.2 }
 * - GPU hardware-accelerated properties only (transform, opacity)
 * - Origin-aware triggers & reduced motion safety
 */

// Custom cubic bezier curves
export const EMIL_EASINGS = {
  // Strong responsive ease-out for entrances and feedback
  easeOut: [0.23, 1, 0.32, 1] as [number, number, number, number],
  // Strong natural acceleration/deceleration for movement across screen
  easeInOut: [0.77, 0, 0.175, 1] as [number, number, number, number],
  // iOS-like sheet / drawer springy curve
  easeDrawer: [0.32, 0.72, 0, 1] as [number, number, number, number],
  // Responsive micro-interaction ease
  subtle: [0.23, 1, 0.32, 1] as [number, number, number, number],
};

// CSS curve strings
export const CSS_EASING_CURVES = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  subtle: 'cubic-bezier(0.23, 1, 0.32, 1)',
};

// Physics-driven springs (Apple-style duration/bounce + traditional stiffness/damping)
export const EMIL_SPRINGS = {
  // Crisp button press or small micro-interaction
  snappy: {
    type: 'spring' as const,
    duration: 0.32,
    bounce: 0.15,
  },
  // Modal / dialog / overlay entrance (settles smoothly, never from scale 0)
  modal: {
    type: 'spring' as const,
    duration: 0.42,
    bounce: 0.16,
  },
  // Toast notifications (asymmetric entering / exiting with momentum)
  toast: {
    type: 'spring' as const,
    duration: 0.45,
    bounce: 0.18,
  },
  // Drawer / bottom sheet slide
  drawer: {
    type: 'spring' as const,
    duration: 0.48,
    bounce: 0.12,
  },
  // Gentle card / list item reveal
  gentle: {
    type: 'spring' as const,
    duration: 0.4,
    bounce: 0.1,
  },
  // Interactive drag / card swipe
  interactive: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 28,
    mass: 0.9,
  },
};

// Motion durations in seconds adhering to Emil's UI budget (<300ms for UI)
export const EMIL_DURATIONS = {
  press: 0.16,
  tooltip: 0.18,
  dropdown: 0.22,
  modal: 0.28,
  toast: 0.38,
};

// Reusable motion variants for lists, grids, and dialogs
export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: EMIL_SPRINGS.modal },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.18, ease: EMIL_EASINGS.easeOut } },
};

export const drawerVariants = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0, transition: EMIL_SPRINGS.drawer },
  exit: { opacity: 0, x: '100%', transition: { duration: 0.22, ease: EMIL_EASINGS.easeOut } },
};

export const toastVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: EMIL_SPRINGS.toast },
  exit: { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.18, ease: EMIL_EASINGS.easeOut } },
};

export const staggerContainer = (staggerMs = 0.045, delayChildren = 0) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerMs,
      delayChildren,
    },
  },
});

export const staggerFadeItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: EMIL_EASINGS.easeOut,
    },
  },
};
