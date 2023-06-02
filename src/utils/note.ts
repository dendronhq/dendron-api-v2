import _ from "lodash";
import { MatterFile, NoteData } from "../types";

export class NoteUtils {
  static getData(note: MatterFile): NoteData {
    return _.defaults(note.data, { tags: [] }) as unknown as NoteData;
  }
}