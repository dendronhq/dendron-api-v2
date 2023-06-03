import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { minimatch } from "minimatch";
import { IndexVaultsRequest } from "../../api/generated/api";
import { logger } from "../../logger";
import { file2note, readFilesRecursively } from "../../utils/dot2dir";
import { NoteUtils } from "../../utils/note";

const parseTagsFromContent = (body: string): string[] => {
  const tags = body.match(/#[\w\.]+/g) || [];
  return tags.map((tag) => tag.slice(1));
}

//filterFns: ((filename: string) => boolean)[] = []): string[] {
const filterByHierarchies = (hierarchies: string[]) => {
  return (fname: string) => {
    return _.some(hierarchies, (hierarchyMatchPattern) => {
      return minimatch(fname, hierarchyMatchPattern);
    });
  }
}

// TODO: doesn't handle deleted records
export class VaultsIndexService {
  async execute(args: IndexVaultsRequest) {
    const ctx = "VaultsIndexService";
    logger.info({ ctx, msg: "enter", args });
    const dest = args.dest;
    const include = args.include || { hierarchies: [] };
    const pclient = new PrismaClient()
    const vaultName = args.vaultName;


    const notes = readFilesRecursively(args.src, [filterByHierarchies(include.hierarchies)])
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const fpath = `${args.src}/${file}`;
        const note = file2note(fpath);
        return note;
      });

    logger.info({ ctx, msg: "fin:readFiles", numFiles: notes.length });


    if (args.purge) {
      logger.info({ ctx, msg: "purging..." })
      await pclient.note.deleteMany();
    }

    for (const note of notes) {
      const data = NoteUtils.getOrFillData(note);
      const { content, fname } = note;
      const { id, title, created, updated, tags } = data;

      const tagsFromContent = parseTagsFromContent(content);
      tagsFromContent.forEach((tag) => {
        if (!tags.includes(tag)) {
          tags.push(tag)
        }
      })

      const tableData = {
        id, title,
        created: Math.round(created / 1000),
        updated: Math.round(updated / 1000),
        tags: JSON.stringify(tags),
        fname,
        vault_name: vaultName,
        body: content
      }
      try {
        await pclient.note.upsert({ create: tableData, update: tableData, where: { id } })
      } catch (e) {
        logger.error({ ctx, msg: "error", e, note: { fname, data } })
        throw e;
      }
    }

    logger.info({ ctx, msg: "fin:readFiles", numFiles: notes.length });

  }
}