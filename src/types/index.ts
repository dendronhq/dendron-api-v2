
import { GrayMatterFile } from 'gray-matter';

export type MatterFiles = {
  fname: string
  fpath: string
} & GrayMatterFile<string>;

export type FileData = Pick<GrayMatterFile<string>, "content" | "data">