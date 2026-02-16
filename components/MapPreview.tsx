import { Platform } from 'react-native';

// Provide a stable import path for both native and web.
// Native resolves to `MapPreview.native.tsx`, web resolves to `MapPreview.web.tsx`.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Impl = Platform.select({
  web: require('./MapPreview.web').default,
  default: require('./MapPreview.native').default,
});

export default Impl;
