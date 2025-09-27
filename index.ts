import { registerRootComponent } from 'expo';

import App from './App';
// import TestQuestion1 from './TestQuestion1';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

// Use TestQuestion1 to demo the new component - uncomment next line and comment the App line below
// registerRootComponent(TestQuestion1);
registerRootComponent(App);
