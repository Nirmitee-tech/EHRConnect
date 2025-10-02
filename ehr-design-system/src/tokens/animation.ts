// Animation tokens for smooth, accessible healthcare interfaces
// Respects user preferences for reduced motion

export const duration = {
  fastest: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
} as const;

export const easing = {
  // Standard easing curves
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier curves for healthcare interfaces
  subtle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',      // Gentle, non-distracting
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',              // Material design
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',    // Playful bounce
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',               // Quick, decisive
  medical: 'cubic-bezier(0.25, 0.1, 0.25, 1)',         // Professional, clinical
} as const;

// Keyframe animations
export const keyframes = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  
  // Scale animations
  scaleIn: {
    from: { 
      opacity: 0,
      transform: 'scale(0.9)',
    },
    to: { 
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  scaleOut: {
    from: { 
      opacity: 1,
      transform: 'scale(1)',
    },
    to: { 
      opacity: 0,
      transform: 'scale(0.95)',
    },
  },
  
  // Slide animations
  slideInFromTop: {
    from: { 
      opacity: 0,
      transform: 'translateY(-10px)',
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  slideInFromBottom: {
    from: { 
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  slideInFromLeft: {
    from: { 
      opacity: 0,
      transform: 'translateX(-10px)',
    },
    to: { 
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  slideInFromRight: {
    from: { 
      opacity: 0,
      transform: 'translateX(10px)',
    },
    to: { 
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  
  // Pulse animation (for vital signs, notifications)
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.7 },
  },
  
  // Heartbeat animation (for critical alerts)
  heartbeat: {
    '0%': { transform: 'scale(1)' },
    '14%': { transform: 'scale(1.1)' },
    '28%': { transform: 'scale(1)' },
    '42%': { transform: 'scale(1.1)' },
    '70%': { transform: 'scale(1)' },
  },
  
  // Shake animation (for form errors)
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
  },
  
  // Spin animation (for loading states)
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  
  // Accordion animations
  accordionDown: {
    from: { height: 0 },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  accordionUp: {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: 0 },
  },
} as const;

// Semantic animations for healthcare components
export const semanticAnimations = {
  // Component entry/exit
  componentEnter: {
    animation: 'fadeIn',
    duration: duration.fast,
    easing: easing.medical,
  },
  componentExit: {
    animation: 'fadeOut',
    duration: duration.fast,
    easing: easing.medical,
  },
  
  // Modal animations
  modalEnter: {
    animation: 'scaleIn',
    duration: duration.normal,
    easing: easing.smooth,
  },
  modalExit: {
    animation: 'scaleOut',
    duration: duration.fast,
    easing: easing.smooth,
  },
  
  // Drawer/Sidebar animations
  drawerEnter: {
    animation: 'slideInFromRight',
    duration: duration.normal,
    easing: easing.medical,
  },
  drawerExit: {
    animation: 'slideInFromRight',
    duration: duration.normal,
    easing: easing.medical,
    direction: 'reverse',
  },
  
  // Dropdown animations
  dropdownEnter: {
    animation: 'slideInFromTop',
    duration: duration.fast,
    easing: easing.medical,
  },
  dropdownExit: {
    animation: 'fadeOut',
    duration: duration.fastest,
    easing: easing.medical,
  },
  
  // Toast/Notification animations
  toastEnter: {
    animation: 'slideInFromBottom',
    duration: duration.normal,
    easing: easing.smooth,
  },
  toastExit: {
    animation: 'slideInFromBottom',
    duration: duration.fast,
    easing: easing.smooth,
    direction: 'reverse',
  },
  
  // Loading animations
  loading: {
    animation: 'spin',
    duration: '1s',
    easing: easing.linear,
    iteration: 'infinite',
  },
  
  // Pulse for vital signs
  vitalsPulse: {
    animation: 'pulse',
    duration: '2s',
    easing: easing.ease,
    iteration: 'infinite',
  },
  
  // Heartbeat for critical alerts
  criticalAlert: {
    animation: 'heartbeat',
    duration: '1.5s',
    easing: easing.ease,
    iteration: 'infinite',
  },
  
  // Error shake
  formError: {
    animation: 'shake',
    duration: duration.slow,
    easing: easing.ease,
  },
  
  // Hover animations
  buttonHover: {
    duration: duration.fast,
    easing: easing.medical,
    properties: ['background-color', 'border-color', 'color', 'box-shadow'],
  },
  cardHover: {
    duration: duration.normal,
    easing: easing.subtle,
    properties: ['transform', 'box-shadow'],
  },
} as const;

// CSS custom properties for animation
export const cssAnimationVars = {
  '--duration-fastest': duration.fastest,
  '--duration-fast': duration.fast,
  '--duration-normal': duration.normal,
  '--duration-slow': duration.slow,
  '--duration-slower': duration.slower,
  '--duration-slowest': duration.slowest,
  
  '--easing-linear': easing.linear,
  '--easing-ease': easing.ease,
  '--easing-ease-in': easing.easeIn,
  '--easing-ease-out': easing.easeOut,
  '--easing-ease-in-out': easing.easeInOut,
  '--easing-subtle': easing.subtle,
  '--easing-smooth': easing.smooth,
  '--easing-bounce': easing.bounce,
  '--easing-sharp': easing.sharp,
  '--easing-medical': easing.medical,
} as const;

// Reduced motion support
export const reducedMotion = {
  // Respect user's motion preferences
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Alternative animations for reduced motion
  reducedAnimations: {
    fadeIn: { opacity: 1 },
    fadeOut: { opacity: 0 },
    slideIn: { opacity: 1 },
    slideOut: { opacity: 0 },
    scaleIn: { opacity: 1 },
    scaleOut: { opacity: 0 },
  },
} as const;

export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type Keyframe = keyof typeof keyframes;