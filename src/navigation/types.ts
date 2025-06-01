import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  PdfList: undefined;
  PdfViewer: {
    uri: string;
    title: string;
  };
  About: undefined;
};

export type NavigationProp = any; 