// Jest setup file - runs BEFORE jest-expo preset
// This file patches React 19 compatibility issues

// Polyfill for React Native globals that jest-expo expects
if (typeof global !== 'undefined') {
  // Ensure these exist before jest-expo tries to configure them
  global.setImmediate = global.setImmediate || ((fn) => setTimeout(fn, 0));
  global.clearImmediate = global.clearImmediate || clearTimeout;

  // Mock React Native's NativeModules if not already mocked
  if (!global.NativeModules) {
    global.NativeModules = {};
  }

  // Prevent jest-expo from trying to define properties on undefined objects
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Only call if obj is actually an object
    if (obj && typeof obj === 'object') {
      return originalDefineProperty(obj, prop, descriptor);
    }
    // Silently ignore attempts to define properties on non-objects
    return obj;
  };
}
