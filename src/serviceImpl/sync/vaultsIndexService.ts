import { PrismaClient } from "@prisma/client";
import { IndexVaultsRequest } from "../../api/generated/api";
import { logger } from "../../logger";
import { file2note, readFilesRecursively } from "../../utils/dot2dir";
import { NoteUtils } from "../../utils/note";


export class VaultsIndexService {
  async execute(args: IndexVaultsRequest) {
    const ctx = "VaultsIndexService";
    logger.info({ ctx, msg: "enter", args });
    // TODO
    const dest = args.dest;
    const pclient = new PrismaClient()
    const vaultName = args.vaultName;

    const notes = readFilesRecursively(args.src)
      .filter((file) => file.endsWith(".md"))
      // TODO: tmp
      .slice(0, 10)
      .map((file) => {
        const fpath = `${args.src}/${file}`;
        const note = file2note(fpath);
        return note;
      });

    for (const note of notes) {
      const data = NoteUtils.getData(note);
      const { content, fname } = note;
      const { id, title, created, updated, tags } = data;
      try {
        await pclient.note.create({
          data: {
            id, title,
            created: Math.round(created / 1000),
            updated: Math.round(updated / 1000),
            tags: JSON.stringify(tags),
            fname,
            vault_name: vaultName,
            body: content
          }
        })
      } catch (e) {
        logger.error({ ctx, msg: "error", e, note: { fname, data } })
        throw e;
      }
    }

    logger.info({ ctx, msg: "fin:readFiles", numFiles: notes.length });

  }
}