import fs from "fs-extra";
import matter from "gray-matter";
import _ from "lodash";
import { minimatch } from "minimatch";
import path from "path";
import * as z from "zod";
import { SyncToRequest } from "../../api/generated/api";
import { logger } from "../../logger";
import { MarkdownDestination } from "./markdownDestination";

type IncludeOption = {
  hierarchies: string[];
};

type ExcludeOption = {
  tags: { key: string; value: any }[];
  hierarchies: string[];
};

// --- Utils

const processIncludeOption = (value: string): IncludeOption => {
  const out = value
    .split(",")
    .reduce((acc: Partial<IncludeOption>, param: string) => {
      const [key, value] = param.split("=");
      let cvalue: any = value;
      switch (key) {
        case "hierarchies":
          cvalue = value.split("|");
          acc[key] = cvalue;
          break;
        default:
          throw new Error(`Invalid key "${key}"`);
      }
      return acc;
    }, {});
  return _.defaults(out, { hierarchies: ["*"] });
};

const processExcludeOption = (value: string): ExcludeOption => {
  const out = value
    .split(",")
    .reduce((acc: Partial<ExcludeOption>, param: string) => {
      const [key, value] = param.split("=");
      let cvalue: any = value;
      switch (key) {
        case "tags": {
          const [tagKey, tagValue] = value.split(":");
          cvalue = [{ key: tagKey, tagValue }];
          acc[key] = cvalue;
          break;
        }
        case "hierarchies":
          cvalue = value.split("|");
          acc[key] = cvalue;
          break;
        default:
          throw new Error(`Invalid key "${key}"`);
      }
      return acc;
    }, {});
  return _.defaults(out, { tags: [], hierarchies: [] });
};

function readFilesRecursively(dir: string): string[] {
  const files: string[] = [];

  function readDirRecursive(directory: string, currentPath = ''): void {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      console.log(item)
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        const nextPath = path.join(currentPath, item);
        readDirRecursive(itemPath, nextPath);
      } else if (stat.isFile()) {
        const filePath = path.join(currentPath, item);
        files.push(filePath);
      }
    }
  }

  readDirRecursive(dir);
  return files;
}

const optionsSchema = z.object({
  include: z.string().transform(processIncludeOption),
  exclude: z.string().transform(processExcludeOption),
  targetFormat: z.string(),
  src: z.string(),
  dest: z.string(),
  deleteMissing: z.boolean().default(false),
});

export class SyncToService {
  async execute(args: SyncToRequest) {
    const ctx = "SyncToService";
    const _args = optionsSchema.parse(args);
    logger.info({ ctx, msg: "enter", args: _args });

    // Read all files with frontmatter using the "gray-matter" library
    const files = readFilesRecursively(args.src)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const contents = fs.readFileSync(`${args.src}/${file}`, "utf8");
        const fname = path.basename(file).replace(/\.md$/, "")
        logger.error({ ctx, fname });
        return { ...matter(contents), fname, fpath: `${args.src}/${file}` };
      });
    logger.info({ ctx, msg: "fin:readFiles", numFiles: files.length });

    // include
    const hierarchies = _args.include.hierarchies;
    let filesToSync = hierarchies.flatMap((hierarchyMatchPattern) => {
      return files.filter((file) =>
        minimatch(file.fname, hierarchyMatchPattern)
      );
    }) as unknown as typeof files;
    logger.info({
      ctx,
      msg: "fin:filterHierarchies",
      numFiles: filesToSync.length,
    });

    // exclude
    filesToSync = _args.exclude.hierarchies.flatMap((hierarchyMatchPattern) => {
      return filesToSync.filter(
        (file) => !minimatch(file.fname, hierarchyMatchPattern)
      );
    }) as unknown as typeof files;
    // _args.exclude.tags.forEach(tag => {
    //   filesToSync = filesToSync.filter(file => file.data[tag.key] !== tag.value);
    // });
    // awlays exclude `public: false`

    filesToSync = filesToSync.filter(file => file.data.published !== false)
    // filesToSync = filesToSync.filter(file => (!('public' in file.data) || file.data.public));
    logger.info({ ctx, msg: "fin:excludeTags", numFiles: filesToSync.length });

    logger.info({
      ctx,
      matches: filesToSync.map((file) => file.fname).join("\n"),
    });
    // TODO: support incremental sync

    if (_args.deleteMissing) {
      logger.info({ ctx, msg: "deleteMissing", dest: _args.dest });
      fs.emptyDirSync(_args.dest);
    }

    switch (args.targetFormat) {
      case "markdown": {
        const dest = new MarkdownDestination();
        return dest.sync(filesToSync, args);
      }
      default:
        throw new Error(
          `Error: "${args.targetFormat}" is not a supported exclude parameter.`
        );
    }
  }
}
