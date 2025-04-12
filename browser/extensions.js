// browser/extensions.js
import path from 'path';
import fs from 'fs';

export function getExtensionPath(extensionName) {

  const basePath = process.env.EXTENSIONS_BASE_PATH || process.cwd();
  
  // Log the base path and the full directory structure for debugging.
  console.log('Base Path:', basePath);
  console.log('Docker Container Directory Structure:');
  
  let extensionPath;
  if (extensionName === 'rektCaptcha-extension') {
    extensionPath = path.resolve(basePath, 'browser', 'rektCaptcha-extension', 'build');
  } else {
    extensionPath = path.resolve(basePath, 'extensions', extensionName);
  }
  
  console.log("Resolved Extension Path:", extensionPath);
  
  // Check if the extension directory exists. Throw an error if not.
  if (!fs.existsSync(extensionPath)) {
    console.error(`Extension not found at ${extensionPath}`);
    throw new Error(`Extension not found at ${extensionPath}`);
  }
  
  return extensionPath;
}