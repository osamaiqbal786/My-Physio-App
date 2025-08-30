import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

interface GifViewerProps {
  gifPath: string;
  style?: any;
}

export default function GifViewer({ gifPath, style }: GifViewerProps) {
  const [gifUri, setGifUri] = React.useState<string>('');

  React.useEffect(() => {
    const loadGif = async () => {
      try {
        // Get the file URI for the GIF
        const assetUri = FileSystem.documentDirectory + 'assets/splash/rehabiri.GIF';
        
        // Copy the GIF to the document directory if it doesn't exist
        const fileInfo = await FileSystem.getInfoAsync(assetUri);
        if (!fileInfo.exists) {
          // For now, we'll use a base64 approach or copy from assets
          // This is a workaround since we can't directly access the asset
          setGifUri('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        } else {
          setGifUri(assetUri);
        }
      } catch (error) {
        console.error('Error loading GIF:', error);
      }
    };

    loadGif();
  }, [gifPath]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <img src="${gifPath}" alt="Splash GIF" />
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        javaScriptEnabled={false}
        domStorageEnabled={false}
        startInLoadingState={false}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
