import { IndexVaultsRequest } from "../../api/generated/api";
import { logger } from "../../logger";
import { file2note, readFilesRecursively } from "../../utils/dot2dir";


export class VaultsIndexService {
  async execute(args: IndexVaultsRequest) {
    const ctx = "VaultsIndexService";
    logger.info({ ctx, msg: "enter", args });
    const files = readFilesRecursively(args.src)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const fpath = `${args.src}/${file}`;
        return file2note(fpath)
      });
    logger.info({ ctx, msg: "fin:readFiles", numFiles: files.length });
  }
}