import fs from "fs-extra";
import matter from "gray-matter";
import _ from "lodash";
import path from "path";
import { FileData } from "../types";

export type FileType = "file" | "index";

export function fnames2FileTypeMap(filenames: string[]): Map<string, FileType> {
  const fileTypes = new Map<string, FileType>();

  // Populate fileTypes with all filenames as keys and "file" as default value
  for (const filename of filenames) {
    fileTypes.set(filename, "file");
  }

  for (const filename of filenames) {
    const parts = filename.split(".");

    // Iterate through prefixes and update fileTypes if a parent is found
    for (let i = parts.length - 1; i > 0; i--) {
      const prefix = parts.slice(0, i).join(".");

      if (fileTypes.has(prefix)) {
        fileTypes.set(prefix, "index");
        break;
      }
    }
  }

  return fileTypes;
}

export function fname2FilePath(fname: string, fileType: FileType) {
  const _path = fname.replace(/\./g, '/');
  if (fileType === "file") {
    return _path + ".md"
  } else {
    return _path + "/index.md"
  }
}

/**
 *  Materialize files and folders in the file system
 */
export async function materializeFnames2FilesAndFolders(fileMappings: Map<string, FileType>, opts: { fnameDataMapping: Map<string, FileData>, baseDir: string }) {
  const fileMappingArray = Array.from(fileMappings.entries());
  await Promise.all(_.map(fileMappingArray, ([fname, fileType]) => {
    const _fpath = path.join(opts.baseDir, fname2FilePath(fname, fileType))
    return fs.ensureDir(path.dirname(_fpath))
  }));
  // // create all folders
  // await Promise.all(fileMappings.map(fpath => {
  //   return fs.ensureDir(path.dirname(fpath))
  // }));

  // create all files
  await Promise.all(_.map(fileMappingArray, ([fname, fileType]) => {
    const _fpath = path.join(opts.baseDir, fname2FilePath(fname, fileType))

    const { content, data } = opts.fnameDataMapping.get(fname)!
    const matterResult = matter.stringify(content, data);
    return fs.writeFile(_fpath, matterResult)
  }));
}

export function readFilesRecursively(dir: string,
  filterFns: ((filename: string) => boolean)[] = []): string[] {
  const files: string[] = [];

  function readDirRecursive(directory: string, currentPath = ''): void {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        const nextPath = path.join(currentPath, item);
        readDirRecursive(itemPath, nextPath);
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
  }

  readDirRecursive(dir);
  return files;
}

export function file2note(fpath: string) {
  const contents = fs.readFileSync(fpath, "utf8");
  const fname = path.basename(fpath).replace(/\.md$/, "")
  return { ...matter(contents), fname, fpath };
}