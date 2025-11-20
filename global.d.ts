
// Minimal global declarations to avoid TypeScript noise for assets and runtime globals.
// Prefer installing proper @types packages for libraries instead of adding module declares.

// allow require in TSX files (used by React Native to load static assets)
declare function require(path: string): any;

// minimal process env to access environment variables in Expo code
declare var process: {
  env: { [key: string]: string | undefined };
};

// allow importing image assets without type errors
declare module '*.png' {
  const value: any;
  export default value;
}

// Minimal declaration for react-native-progress (used for progress bars).
// If more accurate typings are needed, consider installing @types/react-native-progress
declare module 'react-native-progress' {
  import * as React from 'react';
  export const Bar: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const Pie: React.ComponentType<any>;
  export const CircleSnail: React.ComponentType<any>;
  const Progress: any;
  export default Progress;
}
