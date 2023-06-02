
import { GrayMatterFile } from 'gray-matter';

export type MatterFile = {
  fname: string
  fpath: string
} & GrayMatterFile<string>;

export type FileData = Pick<GrayMatterFile<string>, "content" | "data">

export type NoteData = {
  id: string;
  title: string;
  tags: string[];
  updated: number;
  created: number;
}