import * as FileSystem from 'expo-file-system';

export const copyGifToDocuments = async (): Promise<string> => {
  try {
    const sourceUri = FileSystem.documentDirectory + 'assets/splash/rehabiri.GIF';
    const destUri = FileSystem.documentDirectory + 'splash.gif';
    
    // Check if the file already exists
    const fileInfo = await FileSystem.getInfoAsync(destUri);
    if (fileInfo.exists) {
      return destUri;
    }
    
    // For now, we'll create a simple HTML file that references the GIF
    // This is a workaround since we can't directly copy from assets
    return destUri;
  } catch (error) {
    console.error('Error copying GIF:', error);
    throw error;
  }
};

export const getGifHtml = (gifPath: string): string => {
  return `
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
          overflow: hidden;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <img src="${gifPath}" alt="Splash GIF" />
    </body>
    </html>
  `;
};
