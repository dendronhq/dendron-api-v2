
import fs from "fs";
import matter from "gray-matter";
import { Result, errAsync, ok } from "neverthrow";
import path from "path";
import { MergeVaultsRequest, MergeVaultsResponse } from "../../api/generated/api";
import { logger } from "../../logger";

interface Counts {
  allFiles: number;
  merged: number;
}

export class VaultsMergeService {
  async execute(opts: MergeVaultsRequest): Promise<Result<MergeVaultsResponse, Error>> {
    const ctx = "VaultsMergeService"
    const { src, dest } = opts;
    if (!fs.existsSync(src)) {
      logger.error(`Source directory ${src} does not exist.`);
      return errAsync(new Error(`Source directory ${src} does not exist.`))
    }
    if (!fs.existsSync(dest)) {
      logger.error(`Destination directory ${dest} does not exist.`);
      return errAsync(new Error(`Destination directory ${dest} does not exist.`))
    }
    logger.info({ ctx, msg: "enter", opts });

    const extraMetadataOnTarget = opts.extraMetadata ?? {
    };
    const resp = await this.mergeFiles({ srcDir: src, destDir: dest, dryRun: false, extraMetadataOnTarget })
    return ok({
      numNotesMerged: resp.counts.merged,
      numNotesNew: resp.counts.allFiles - resp.counts.merged,
    });
  }

  mergeFiles({
    extraMetadataOnTarget,
    srcDir,
    destDir,
    dryRun = false
  }: {
    extraMetadataOnTarget: any,
    srcDir: string,
    destDir: string,
    dryRun: boolean
  }): { merged: string[]; counts: Counts } {

    // NOTE: update this for custom filters
    const allFiles = readAllFiles(srcDir, [(_fpath) => {
      // const fname = path.basename(fpath);
      // return minimatch(fpath, "tags.**.md")
      return true
    }]);
    logger.info(`Found ${allFiles.length} files in ${srcDir}`)
    const merged: string[] = [];

    for (const fileName of allFiles) {
      const srcFilePath = path.join(srcDir, fileName);
      const ext = path.extname(fileName);

      // we found a file that doesn't exist in the target, copy it over
      if (!fs.existsSync(path.join(destDir, fileName))) {
        const content = fs.readFileSync(srcFilePath, "utf-8");

        // if md, add frontmatter
        if (ext === ".md") {
          const { data: metadata, content: fileContent } = matter(content);
          Object.assign(metadata, extraMetadataOnTarget);
          if (!dryRun) writeWithFrontmatter(fileName, metadata, fileContent, destDir);
        } else {
          // otherwise, just copy
          if (!dryRun) fs.writeFileSync(path.join(destDir, fileName), content);
        }
      } else {
        // fileName exists, figure out merge
        const fSrcContents = fs.readFileSync(
          path.join(srcDir, fileName),
          "utf-8"
        );
        const fTargetContents = fs.readFileSync(
          path.join(destDir, fileName),
          "utf-8"
        );
        const mergedContents = fTargetContents + fSrcContents;
        if (!dryRun) {
          fs.writeFileSync(path.join(destDir, fileName), mergedContents);
        }
        merged.push(fileName);
      }
    }
    const counts: Counts = { allFiles: allFiles.length, merged: merged.length };
    return { merged, counts };
  }

}


function readAllFiles(
  targetDir: string,
  filterFns: ((filename: string) => boolean)[] = []
): string[] {
  const BLACKLIST = [".DS_Store", ".dendron.cache.json", "root.schema.yml", "package.json", ".gitignore"];
  const allFiles = fs.readdirSync(targetDir);
  const filteredFiles = allFiles.filter((filename) => {
    const filePath = path.join(targetDir, filename);
    const isFile = fs.statSync(filePath).isFile();
    const isInBlacklist = BLACKLIST.includes(filename);
    return filterFns.reduce(
      (prev, currFn) => prev && currFn(filePath),
      isFile && !isInBlacklist
    );
  });
  return filteredFiles;
}

function writeWithFrontmatter(
  filePath: string,
  metadata: any,
  content: string,
  to: string
): void {
  const matterResult = matter.stringify(content, metadata);
  fs.writeFileSync(path.join(to, filePath), matterResult);
}