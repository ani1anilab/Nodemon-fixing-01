// browser/extensions.js
import path from 'path';
import fs from 'fs';

export function getExtensionPath(extensionName) {
  // Get the absolute path to the extension
  let extensionPath;
  if (extensionName === 'rektCaptcha-extension') {
    // Use the full path to your extension build directory
    extensionPath = path.resolve(process.cwd(), 'browser' , 'extensions', 'rektCaptcha-extension', 'build');
  } else {
    extensionPath = path.resolve(process.cwd(), 'extensions', extensionName);
  }
  
  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension not found at ${extensionPath}`);
    throw new Error(`Extension not found at ${extensionPath}`);
  }
  
  return extensionPath;
}