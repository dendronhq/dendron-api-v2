import fs from "fs-extra";
import path from "path";
import { FileData } from '../types';
import { FileType, fnames2FileTypeMap, materializeFnames2FilesAndFolders } from './dot2dir';

/**
 * This is used for testing. Read a directory recursively 
 * @param dirPath 
 * @returns A map of file names and their contents
 */
function readDirectoryRecursive(dirPath: string): Map<string, string> {
  const filesMap = new Map<string, string>();
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const subFilesMap = readDirectoryRecursive(filePath);
      subFilesMap.forEach((subFileContent, subFilePath) => {
        filesMap.set(subFilePath, subFileContent);
      });
    } else if (stats.isFile()) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      filesMap.set(filePath, fileContent);
    }
  }

  return filesMap;
}



describe('fnames2FileTypeMap', () => {
  test('should correctly identify file types', () => {
    const filenames = [
      'bar',
      'bar.two',
      'bar.alpha',
      'bar.alpha.one',
      'foo.two.three',
    ];
    const expected = new Map<string, FileType>([
      ['bar', 'index'],
      ['bar.two', 'file'],
      ['bar.alpha', 'index'],
      ['bar.alpha.one', 'file'],
      ['foo.two.three', 'file'],
    ]);

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });

  test('should handle empty input', () => {
    const filenames: string[] = [];
    const expected = new Map<string, FileType>();

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });

  test('should handle single-level filenames', () => {
    const filenames = ['foo', 'bar', 'baz'];
    const expected = new Map<string, FileType>([
      ['foo', 'file'],
      ['bar', 'file'],
      ['baz', 'file'],
    ]);

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });

  test('should handle multi-level filenames', () => {
    const filenames = ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.d'];
    const expected = new Map<string, FileType>([
      ['a', 'index'],
      ['a.b', 'index'],
      ['a.b.c', 'index'],
      ['a.b.c.d', 'file'],
      ['a.b.d', 'file'],
    ]);

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });
});


describe('materializeFnames2FilesAndFolders', () => {
  const BASE_DIR = '/tmp/dendron';
  beforeEach(() => {
    fs.emptyDirSync(BASE_DIR);
  });

  test('should correctly materialize files and folders', async () => {
    const filenames = [
      'bar',
      'bar.two',
      'bar.alpha',
      'bar.alpha.one',
      'foo.two.three',
    ];
    const fnameDataMapping = {
      'bar': { content: 'bar', data: { id: 'bar-id' } },
      'bar.two': { content: 'bar.two', data: { id: 'bar-two-id' } },
      'bar.alpha': { content: 'bar.alpha', data: { id: 'bar-alpha-id' } },
      'bar.alpha.one': { content: 'bar.alpha.one', data: { id: 'bar-alpha-one-id' } },
      'foo.two.three': { content: 'foo.two.three', data: { id: 'foo-two-three-id' } },
    };
    const expected = [
      "/tmp/dendron/bar/alpha/index.md",
      "/tmp/dendron/bar/alpha/one.md",
      "/tmp/dendron/bar/index.md",
      "/tmp/dendron/bar/two.md",
      "/tmp/dendron/foo/two/three.md",
    ]

    await materializeFnames2FilesAndFolders(fnames2FileTypeMap(filenames), { baseDir: BASE_DIR, fnameDataMapping: new Map<string, FileData>(Object.entries(fnameDataMapping)) });
    const out = readDirectoryRecursive(BASE_DIR)
    expect(out).toMatchSnapshot();
    expect(Array.from(out.keys())).toEqual(expected)
  });

  describe('transformTags', () => {
    test('should replace dots in tags with slashes', async () => {
      const filenames = [
        'tags.fm-only',
        'tags.body-only',
        'tags.fm-and-body',
      ];
      const fnameDataMapping = {
        'tags.fm-only': { content: '', data: { tags: ['fm.one'] } },
        'tags.fm-mult': { content: '', data: { tags: ['fm.one', 'fm.two'] } },
        'tags.body-only': { content: '#body.one\n#body.one.two', data: {} },
        'tags.fm-and-body': { content: '#body.one', data: { tags: ['fm.one'] } },
      };
      await materializeFnames2FilesAndFolders(fnames2FileTypeMap(filenames),
        { baseDir: BASE_DIR, fnameDataMapping: new Map<string, FileData>(Object.entries(fnameDataMapping)), transformTags: true }
      );
      const out = readDirectoryRecursive(BASE_DIR)
      expect(out).toMatchSnapshot();
    });
  });

});



