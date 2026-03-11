// jest-expo setup runs `require('expo/src/winter')` which installs lazy getters
// on global for several APIs. These getters use `require()` that fails in Jest
// with "import outside scope" when the getter fires during test execution.
// Override them all with plain values after expo's setup runs.

function overrideLazyGetter(name, value) {
  const desc = Object.getOwnPropertyDescriptor(global, name);
  if (desc && desc.get) {
    Object.defineProperty(global, name, {
      value,
      configurable: true,
      writable: true,
      enumerable: desc.enumerable ?? false,
    });
  }
}

// expo/src/winter/runtime.native.ts installs these lazy getters:
overrideLazyGetter('__ExpoImportMetaRegistry', { url: '' });
overrideLazyGetter('structuredClone', (obj) => JSON.parse(JSON.stringify(obj)));
// TextDecoder / TextEncoder are available in Node.js already
overrideLazyGetter('TextDecoder', global.TextDecoder ?? class TextDecoder {});
overrideLazyGetter('TextDecoderStream', global.TextDecoderStream ?? class TextDecoderStream {});
overrideLazyGetter('TextEncoderStream', global.TextEncoderStream ?? class TextEncoderStream {});
overrideLazyGetter('URL', global.URL ?? class URL {});
overrideLazyGetter('URLSearchParams', global.URLSearchParams ?? class URLSearchParams {});

// Mock AsyncStorage (not provided by jest-expo)
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));
