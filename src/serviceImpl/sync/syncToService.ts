import fs from "fs-extra";
import matter from 'gray-matter';
import minimatch from 'minimatch';
import { SyncToRequest } from "../../api/generated/api";
import { MarkdownDestination } from "./markdownDestination";
// import { SyncToRequest } from "../../api/generated/serialization/resources/dendron/types/SyncToRequest";


export class SyncToService {

  async execute(args: SyncToRequest) {
    console.log(`Syncing: ${args.src}`);

    // Read all files with frontmatter using the "gray-matter" library
    let files = fs.readdirSync(args.src)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const contents = fs.readFileSync(`${args.src}/${file}`, 'utf8');
        const fname = file.replace(/\.md$/, '');
        return { ...matter(contents), fname, fpath: `${args.src}/${file}` };
      });


    // Parse the "include" option using AWS Structured Parameters shorthand syntax
    let includeParams: Record<string, string> = {};
    if (args.include) {
      includeParams = args.include.split(',').reduce((acc: Record<string, string>, param: string) => {
        const [key, value] = param.split('=');
        acc[key.toLowerCase()] = value;
        return acc;
      }, {});
    }

    // Parse the "exclude" option using AWS Structured Parameters shorthand syntax
    let excludeParams: Record<string, string> = {};
    if (args.exclude) {
      excludeParams = args.exclude.split(',').reduce((acc: Record<string, string>, param: string) => {
        const [key, value] = param.split('=');
        acc[key.toLowerCase()] = value;
        return acc;
      }, {});
    }

    console.log({ includeParams, excludeParams });

    for (const [key, value] of Object.entries(includeParams)) {
      switch (key) {
        case 'hierarchy':
          files = files.filter(file => minimatch(file.fname, value));
          break;
        default:
          throw new Error(`Error: "${key}" is not a supported include parameter.`);
      }
    }

    for (const [key, value] of Object.entries(excludeParams)) {
      switch (key) {
        case 'tags': {
          const [tagKey, tagValue] = value.split(':');
          files = files.filter(file => file.data[tagKey] !== tagValue);
          break;
        }
        default:
          throw new Error(`Error: "${key}" is not a supported exclude parameter.`);
          break;
      }
    }

    console.log('Matching files:');
    console.log(files.map(file => file.fname).join('\n'));
    files[0].content
    switch (args.targetFormat) {
      case 'markdown':
        const dest = new MarkdownDestination()
        dest.sync(files, args.dest)
        break;
      default:
        throw new Error(`Error: "${args.targetFormat}" is not a supported exclude parameter.`);
    }

  };

}
