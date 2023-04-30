import fs from "fs-extra";
import _ from "lodash";
import path from "path";
import matter from "gray-matter";
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