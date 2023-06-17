import execa from "execa";
import _ from "lodash";
import path from "path";
import { RepairVaultsRequest } from "../../api/generated/api";
import { logger } from "../../logger";
import { MatterFile } from "../../types";
import { file2note, readFilesRecursively } from "../../utils/dot2dir";
import { NoteUtils } from "../../utils/note";

// TODO: properly get updated/created
function getCreatedFromGit(fpath: string) {
  const fbasename = path.basename(fpath)
  const resp = execa.commandSync(`git log --diff-filter=A --follow --format=%aD -1 -- ${fbasename} `, {
    cwd: path.dirname(fpath)
  }).stdout
  return Date.parse(resp)
}

function getUpdatedFromGit(fpath: string) {
  const fbasename = path.basename(fpath)
  const resp = execa.commandSync(`git log --format=%aD -1 -- ${fbasename} `, {
    cwd: path.dirname(fpath)
  }).stdout
  return Date.parse(resp)
}


/**
 * See pkg.dendronv2-api.vaults.repair.md
 */
export class VaultsRepairService {
  async execute(args: RepairVaultsRequest) {
    const ctx = "VaultsIndexService";
    logger.info({ ctx, msg: "enter", args });

    const needsRepair = [] as MatterFile[];
    const allFiles = readFilesRecursively(args.src)
      .filter((file) => file.endsWith(".md"));

    let progress = 0;
    const totalFiles = allFiles.length;
    const increment = totalFiles / 10;

    function repairNotes() {
      for (const file of allFiles) {
        const fpath = `${args.src}/${file}`;
        const note = file2note(fpath);
        let repaired = false;

        if (note.data.id === undefined) {
          repaired = true;
          note.data.id = NoteUtils.genId();
        }

        if (note.data.title === undefined || note.data.title === '__MISSING__' || note.data.title === null || !_.isString(note.data.title)) {
          repaired = true;
          note.data.title = NoteUtils.genTitle(note);
        }

        if (note.data.updated === undefined) {
          repaired = true;
          note.data.updated = 1;
        }

        if (note.data.created === undefined) {
          repaired = true;
          // TODO: figure this out later
          note.data.created = 1;
        }

        if (!_.isArray(note.data.tags)) {
          repaired = true;
          // TODO: figure this out later
          note.data.tags = []
        }

        if (repaired) {
          needsRepair.push(note);
        }

        progress += 1;
        if (progress % increment === 0) {
          logger.info({
            ctx,
            msg: `Repair progress: ${progress * 100 / totalFiles}%`,
          });
        }
      }
    }

    // Call the async function
    repairNotes();


    logger.info({ ctx, msg: "repairing", numNotes: needsRepair.length });
    await Promise.all(_.map(needsRepair, async (note) => {
      return NoteUtils.write(note, { fpath: note.fpath })
    }));


  }
}