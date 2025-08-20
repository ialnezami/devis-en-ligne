import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RNScreens = require('react-native-screens/mock');
  return RNScreens;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    useSafeAreaInsets: jest.fn().mockImplementation(() => inset),
    useSafeAreaFrame: jest.fn().mockImplementation(() => ({ x: 0, y: 0, width: 390, height: 844 })),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  abandonPermissions: jest.fn(),
  checkPermissions: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  getInitialNotification: jest.fn(),
  getBadgeCount: jest.fn(),
  setBadgeCount: jest.fn(),
  clearAll: jest.fn(),
  createChannel: jest.fn(),
  channelExists: jest.fn(),
  deleteChannel: jest.fn(),
  getChannels: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  scheduleLocalNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  getInitialNotification: jest.fn(),
  getBadgeCount: jest.fn(),
  setBadgeCount: jest.fn(),
  clearAll: jest.fn(),
  createChannel: jest.fn(),
  channelExists: jest.fn(),
  deleteChannel: jest.fn(),
  getChannels: jest.fn(),
}));

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: 'RNCamera',
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
  pickMultiple: jest.fn(),
  types: {
    allFiles: 'allFiles',
    plainText: 'plainText',
    audio: 'audio',
    pdf: 'pdf',
    zip: 'zip',
    images: 'images',
  },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/data',
  LibraryDirectoryPath: '/data',
  MainBundlePath: '/data',
  CachesDirectoryPath: '/data',
  ExternalDirectoryPath: '/data',
  ExternalCachesDirectoryPath: '/data',
  TemporaryDirectoryPath: '/data',
  PicturesDirectoryPath: '/data',
  DownloadDirectoryPath: '/data',
  readFile: jest.fn(),
  writeFile: jest.fn(),
  appendFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
  moveFile: jest.fn(),
  unlink: jest.fn(),
  readDir: jest.fn(),
  stat: jest.fn(),
  hash: jest.fn(),
  copyFileAssets: jest.fn(),
  copyFileAssetsIOS: jest.fn(),
  copyAssetsVideoIOS: jest.fn(),
  existsAssets: jest.fn(),
  readDirAssets: jest.fn(),
  readFileAssets: jest.fn(),
  downloadFile: jest.fn(),
  uploadFiles: jest.fn(),
  touch: jest.fn(),
  MainBundlePath: '/data',
  CachesDirectoryPath: '/data',
  DocumentDirectoryPath: '/data',
  ExternalDirectoryPath: '/data',
  ExternalCachesDirectoryPath: '/data',
  TemporaryDirectoryPath: '/data',
  PicturesDirectoryPath: '/data',
  DownloadDirectoryPath: '/data',
}));

// Mock react-native-share
jest.mock('react-native-share', () => ({
  open: jest.fn(),
  share: jest.fn(),
  isPackageInstalled: jest.fn(),
}));

// Mock react-native-pdf
jest.mock('react-native-pdf', () => 'PDFView');

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
  ContributionGraph: 'ContributionGraph',
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TextPath: View,
    TSpan: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Defs: View,
    Use: View,
    Mask: View,
    Pattern: View,
    Marker: View,
    Title: View,
    Desc: View,
  };
});

// Mock react-native-socket-io
jest.mock('react-native-socket-io', () => 'SocketIO');

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(),
  createKeys: jest.fn(),
  deleteKeys: jest.fn(),
  createSignature: jest.fn(),
  simplePrompt: jest.fn(),
  deleteKeys: jest.fn(),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  getSupportedBiometryType: jest.fn(),
  canImplyAuthentication: jest.fn(),
  getInternetCredentials: jest.fn(),
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  getAllInternetCredentials: jest.fn(),
  getAllGenericPasswords: jest.fn(),
  getSecurityLevel: jest.fn(),
  canImplyAuthentication: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  getSecurityLevel: jest.fn(),
  canImplyAuthentication: jest.fn(),
  getSupportedBiometryType: jest.fn(),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(),
  getBuildNumber: jest.fn(),
  getBundleId: jest.fn(),
  getSystemName: jest.fn(),
  getSystemVersion: jest.fn(),
  getDeviceId: jest.fn(),
  getDeviceName: jest.fn(),
  getDeviceType: jest.fn(),
  getDeviceToken: jest.fn(),
  getUniqueId: jest.fn(),
  getManufacturer: jest.fn(),
  getModel: jest.fn(),
  getCarrier: jest.fn(),
  getTimezone: jest.fn(),
  getFontScale: jest.fn(),
  isLocationEnabled: jest.fn(),
  isCameraEnabled: jest.fn(),
  isMicrophoneEnabled: jest.fn(),
  isBatteryCharging: jest.fn(),
  getBatteryLevel: jest.fn(),
  getPowerState: jest.fn(),
  getFirstInstallTime: jest.fn(),
  getLastUpdateTime: jest.fn(),
  getAppName: jest.fn(),
  getAppVersion: jest.fn(),
  getBuildNumber: jest.fn(),
  getBundleId: jest.fn(),
  getInstallReferrer: jest.fn(),
  getReadableVersion: jest.fn(),
  getSystemName: jest.fn(),
  getSystemVersion: jest.fn(),
  getDeviceId: jest.fn(),
  getDeviceName: jest.fn(),
  getDeviceType: jest.fn(),
  getDeviceToken: jest.fn(),
  getUniqueId: jest.fn(),
  getManufacturer: jest.fn(),
  getModel: jest.fn(),
  getCarrier: jest.fn(),
  getTimezone: jest.fn(),
  getFontScale: jest.fn(),
  isLocationEnabled: jest.fn(),
  isCameraEnabled: jest.fn(),
  isMicrophoneEnabled: jest.fn(),
  isBatteryCharging: jest.fn(),
  getBatteryLevel: jest.fn(),
  getPowerState: jest.fn(),
  getFirstInstallTime: jest.fn(),
  getLastUpdateTime: jest.fn(),
  getAppName: jest.fn(),
  getAppVersion: jest.fn(),
  getBuildNumber: jest.fn(),
  getBundleId: jest.fn(),
  getInstallReferrer: jest.fn(),
  getReadableVersion: jest.fn(),
}));

// Mock react-native-network-info
jest.mock('react-native-network-info', () => ({
  getSSID: jest.fn(),
  getBSSID: jest.fn(),
  getBroadcast: jest.fn(),
  getIPAddress: jest.fn(),
  getIPV4Address: jest.fn(),
  getSubnet: jest.fn(),
  getGatewayIP: jest.fn(),
  getDNSServers: jest.fn(),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    IOS: {
      LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  check: jest.fn(),
  request: jest.fn(),
  checkMultiple: jest.fn(),
  requestMultiple: jest.fn(),
  openSettings: jest.fn(),
}));

// Mock react-native-splash-screen
jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock react-native-orientation-locker
jest.mock('react-native-orientation-locker', () => ({
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
  lockToLandscapeLeft: jest.fn(),
  lockToLandscapeRight: jest.fn(),
  unlockAllOrientations: jest.fn(),
  getOrientation: jest.fn(),
  getDeviceOrientation: jest.fn(),
  isLocked: jest.fn(),
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
  addDeviceOrientationListener: jest.fn(),
  removeDeviceOrientationListener: jest.fn(),
}));

// Global test setup
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
