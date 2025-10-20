// TaskFlow Color Scheme - Ported to React Native

export const colors = {
  // Primary Colors
  primary: {
    dark: '#1e3a5f',    // Dark blue (header background)
    main: '#2874a6',    // Medium blue (primary actions)
    light: '#5dade2',   // Light blue (accents)
  },

  // Accent Colors
  accent: {
    gold: '#f7dc6f',    // Time display highlight
  },

  // Semantic Colors
  semantic: {
    success: '#10b981', // Green - completed tasks
    warning: '#f59e0b', // Amber - due soon
    error: '#ef4444',   // Red - overdue
    danger: '#ef4444',  // Alias for error
    info: '#06b6d4',    // Cyan - information
  },

  // Category Colors (10 colors, same as TaskFlow)
  categories: [
    '#6366f1', // Indigo - Category 1
    '#8b5cf6', // Purple - Category 2
    '#ec4899', // Pink - Category 3
    '#f59e0b', // Amber - Category 4
    '#10b981', // Emerald - Category 5
    '#06b6d4', // Cyan - Category 6
    '#ef4444', // Red - Category 7
    '#f97316', // Orange - Category 8
    '#84cc16', // Lime - Category 9
    '#3b82f6', // Blue - Category 10
  ],

  // UI Colors
  ui: {
    background: '#ffffff',      // Pure white
    surface: '#f9fafb',         // Light gray cards
    surfaceDark: '#1f2937',     // Dark surface
    border: '#e5e7eb',          // Borders
    borderDark: '#374151',      // Dark borders
    textPrimary: '#1f2937',     // Dark gray text
    textSecondary: '#6b7280',   // Medium gray text
    textDisabled: '#9ca3af',    // Light gray disabled
    textInverse: '#ffffff',     // White text
  },

  // Aliases for easier access in components
  surface: {
    white: '#ffffff',
    light: '#f9fafb',
    medium: '#e5e7eb',
    dark: '#1f2937',
  },

  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },
};

// Export CATEGORY_COLORS as an alias for compatibility
export const CATEGORY_COLORS = colors.categories;

// Gradient definitions
export const gradients = {
  header: ['#1e3a5f', '#2874a6', '#5dade2'], // Primary gradient
  background: ['#1e3a5f', '#2874a6'],        // Background gradient
};

// Spacing scale (8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Typography
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Text style presets for components
  h1: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 1.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
  },
};

// Shadows (for cards, modals, etc.)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
};

// Export combined theme
export const theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
  zIndex,
};

export type Theme = typeof theme;
