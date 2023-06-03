import fs from "fs";
import matter from "gray-matter";
import _ from "lodash";
import { customAlphabet as nanoid } from "nanoid";
import { MatterFile, NoteData } from "../types";

/** Using this length, according to [nanoid collision calculator](https://zelark.github.io/nano-id-cc/),
 * generating 1000 IDs per hour, it would take around 919 years to have 1 percent chance of a single collision.
 * This is okay for the "insecure" generator, which is used in limited cases where collisions are less likely.
 */
/** Default length for nanoids. */
const LONG_ID_LENGTH = 23;

const alphanumericLowercase = "0123456789abcdefghijklmnopqrstuvwxyz";

export class NoteUtils {
  static getOrFillData(note: MatterFile): NoteData {
    return _.defaults(note.data, { tags: [], title: '__MISSING__', created: 1, updated: 1 }) as unknown as NoteData;
  }

  /**
   * Generates a random identifier.
   *
   * Backward compatibility notes:
   * Previously this id has been generated differently including using
   * ------------------------------
   * * uuidv4(); from "uuid/v4";
   * * { v4 } from "uuid";
   * * nanoid(); from "nanoid";  uses: [A-Za-z0-9_-]
   * ------------------------------
   * Hence even though right now we only have alphanumeric ids, previously there
   * has been ids with `-` and `_` around, that still exist in our users notes.
   *
   * @returns A url-safe, random identifier.
   */
  static genId(): string {
    return nanoid(alphanumericLowercase, LONG_ID_LENGTH)();
  }

  static genTitle(note: MatterFile): string {
    return note.fname
  }

  static serialize(props: MatterFile): string {
    const body = props.content;
    const meta = props.data;

    // Make sure title and ID are always strings
    meta.title = _.toString(meta.title);
    meta.id = _.toString(meta.id);

    const stringified = matter.stringify(body || "", meta);
    // Stringify appends \n if it doesn't exist. Remove it if body originally doesn't contain new line
    return !body.endsWith("\n") ? stringified.slice(0, -1) : stringified;
  }

  static write(note: MatterFile, opts: { fpath: string }): void {
    return fs.writeFileSync(opts.fpath, NoteUtils.serialize(note));
  }
}



export async function note2File({
  note,
  vault,
  wsRoot,
}: {
  note: NoteProps;
  vault: DVault;
  wsRoot: string;
}) {
  const ext = ".md";
  const payload = NoteUtils.serialize(note);
  const vpath = vault2Path({ vault, wsRoot });
  return genHash(payload);
}
