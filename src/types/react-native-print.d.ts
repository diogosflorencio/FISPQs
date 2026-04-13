declare module 'react-native-print' {
  type PrintOptions = {
    printerURL?: string;
    isLandscape?: boolean;
    jobName?: string;
    baseUrl?: string;
  } & ({ html: string; filePath?: never } | { filePath: string; html?: never });

  interface RNPrintModule {
    print(options: PrintOptions): Promise<unknown>;
    selectPrinter?(options: { x: string; y: string }): Promise<{ name: string; url: string }>;
  }

  const RNPrint: RNPrintModule;
  export default RNPrint;
}
