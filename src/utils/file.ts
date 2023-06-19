
import fs from "fs-extra";
import path from "path";

/**
 * Read a directory recursively and return all files
 * @param directory 
 * @param currentPath 
 * @param filterFns : array of functions that take a filename and return true if it should be included
 * @returns 
 */
export function readDirRecursive(directory: string, currentPath = '', filterFns: ((filename: string) => boolean)[] = []): string[] {
  const items = fs.readdirSync(directory);
  const files: string[] = [];
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      const nextPath = path.join(currentPath, item);
      files.push(...readDirRecursive(itemPath, nextPath, filterFns));
    } else if (stat.isFile()) {
      const filePath = path.join(currentPath, item);
      const shouldInclude = filterFns.reduce(
        (prev, currFn) => prev && currFn(filePath),
        true
      );
      if (shouldInclude) {
        files.push(filePath);
      }
    }
  }
  return files;
}