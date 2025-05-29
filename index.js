/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-url-polyfill/auto';
import { Provider as PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// e passar o ícone customizado para o Paper (se necessário)


AppRegistry.registerComponent(appName, () => App);
