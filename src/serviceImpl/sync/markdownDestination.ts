import { SyncToRequest, SyncToResponse } from "../../api/generated/api";
import { FileData, MatterFiles } from "../../types";
import { fnames2FileTypeMap, materializeFnames2FilesAndFolders } from "../../utils/dot2dir";

export class MarkdownDestination {
  async sync(files: MatterFiles[], opts: SyncToRequest): Promise<SyncToResponse> {
    const fnames = files.map(file => file.fname)
    const fnameFileTypeMapping = fnames2FileTypeMap(fnames);

    const baseDir = opts.dest;
    const fnameDataMapping = new Map<string, FileData>();
    files.forEach(({ fname, content, data }) => {
      fnameDataMapping.set(fname, { content, data })
    });

    await materializeFnames2FilesAndFolders(fnameFileTypeMapping, { baseDir, fnameDataMapping })
    return { numSynced: fnames.length }
  }
}