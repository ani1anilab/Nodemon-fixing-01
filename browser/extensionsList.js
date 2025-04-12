import path from 'path';
import fs from 'fs';

/**
 * Logs the entire directory tree starting at the given directory.
 * This recursive function prints files and folders to the console.
 *
 * @param {string} dir - The directory path to log.
 * @param {string} indent - Used for formatting nested directories.
 */
function logDirectoryTree(dir, indent = "") {
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      console.log(indent + item);
      if (fs.statSync(fullPath).isDirectory()) {
        logDirectoryTree(fullPath, indent + "  ");
      }
    });
  } catch (err) {
    console.error("Error while reading directory:", dir, err);
  }
}

/**
 * Returns the absolute path for a given extension by
 * using a base path from an environment variable (or process.cwd()).
 *
 * Also logs the container's directory structure for debugging.
 *
 * @param {string} extensionName - The name of the extension.
 * @returns {string} - The resolved absolute path for the extension.
 * @throws Will throw an error if the extension path does not exist.
 */
export function getExtensionPathList(extensionName) {
  // Use the environment variable or process.cwd() as the base path.
  const basePath = process.env.EXTENSIONS_BASE_PATH || process.cwd();
  
  // Log the base path and the full directory structure for debugging.
  console.log('Base Path:', basePath);
  console.log('Docker Container Directory Structure:');
  logDirectoryTree(basePath);
  
  let extensionPath;
  if (extensionName === 'rektCaptcha-extension') {
    extensionPath = path.resolve(basePath, 'browser', 'extensions', 'rektCaptcha-extension', 'build');
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
