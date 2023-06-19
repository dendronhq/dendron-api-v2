import fs from "fs-extra";
import matter from "gray-matter";
import _ from "lodash";
import path from "path";
import { FileData } from "../types";
import { readDirRecursive } from "./file";

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
export async function materializeFnames2FilesAndFolders(fileMappings: Map<string, FileType>,
  opts: { fnameDataMapping: Map<string, FileData>, baseDir: string, transformTags?: boolean }) {

  // make sure all folders exist
  const fileMappingArray = Array.from(fileMappings.entries());
  await Promise.all(_.map(fileMappingArray, ([fname, fileType]) => {
    const _fpath = path.join(opts.baseDir, fname2FilePath(fname, fileType))
    return fs.ensureDir(path.dirname(_fpath))
  }));

  // create all files
  await Promise.all(_.map(fileMappingArray, ([fname, fileType]) => {
    const _fpath = path.join(opts.baseDir, fname2FilePath(fname, fileType))

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, prefer-const
    let { content, data } = opts.fnameDataMapping.get(fname)!

    // regex that matches all tags with dots and replaces them with forward slash
    if (opts.transformTags) {
      ({ content, data } = transfromTags({ content, data }))
    }

    const matterResult = matter.stringify(content, data);
    return fs.writeFile(_fpath, matterResult)
  }));
}

export function readFilesRecursively(dir: string,
  filterFns: ((filename: string) => boolean)[] = []): string[] {
  return readDirRecursive(dir, '', filterFns)
}

function transfromTags(opts: { data: any, content: string }) {
  const { data, content } = opts;
  let cleanTags = _.get(data, 'tags', []);
  // TODO: we have bad casees like 
  // tags:
  //   - - - tags.dendron.lvl2
  if (cleanTags && _.isArray(cleanTags) && _.isString(cleanTags[0])) {
    cleanTags = cleanTags.map((tag: string) => {
      return tag.replace(/\./g, '/')
    });
  }
  data.tags = cleanTags;
  const cleanContent = content.replace(/#([^\s]+)/g, (_, tag) => {
    return `#${tag.replace(/\./g, '/')}`
  });
  return { data, content: cleanContent }
}

export function file2note(fpath: string) {
  const contents = fs.readFileSync(fpath, "utf8");
  const fname = path.basename(fpath).replace(/\.md$/, "")
  return { ...matter(contents), fname, fpath };
}