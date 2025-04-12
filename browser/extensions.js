// browser/extensions.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export function getExtensionPath(extensionName) {
  // Get the absolute path to the extension
  let extensionPath;
  if (extensionName === 'rektCaptcha-extension') {
    // Use the full path to your extension build directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Construct path relative to the current file's directory
    extensionPath = path.join(__dirname, 'extensions', 'rektCaptcha-extension', 'build');
  } else {
    extensionPath = path.resolve(process.cwd(), 'extensions', extensionName);
  }
  
  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension not found at ${extensionPath}`);
    throw new Error(`Extension not found at ${extensionPath}`);
  }
  
  return extensionPath;
}