import { FileData } from '../types';
import { fnames2FileTypeMap, FileType, materializeFnames2FilesAndFolders } from './dot2dir';
import fs from "fs-extra";
import path from 'path';

function readDirectoryRecursive(dirPath: string): Map<string, string> {
  const filesMap = new Map<string, string>();
  const files = fs.readdirSync(dirPath);
  console.log(dirPath);

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



describe('determineFileType', () => {
  test('should correctly identify file types', () => {
    const filenames = [
      'bar',
      'bar.two',
      'bar.alpha',
      'bar.alpha.one',
      'foo.two.three',
    ];
    const expected: Map<string, FileType> = new Map([
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
    const expected: Map<string, FileType> = new Map();

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });

  test('should handle single-level filenames', () => {
    const filenames = ['foo', 'bar', 'baz'];
    const expected: Map<string, FileType> = new Map([
      ['foo', 'file'],
      ['bar', 'file'],
      ['baz', 'file'],
    ]);

    expect(fnames2FileTypeMap(filenames)).toEqual(expected);
  });

  test('should handle multi-level filenames', () => {
    const filenames = ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.d'];
    const expected: Map<string, FileType> = new Map([
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

    await materializeFnames2FilesAndFolders(fnames2FileTypeMap(filenames), { baseDir: '/tmp/dendron', fnameDataMapping: new Map<string, FileData>(Object.entries(fnameDataMapping)) });
    const out = readDirectoryRecursive('/tmp/dendron')
    expect(out).toMatchSnapshot();
    expect(Array.from(out.keys())).toEqual(expected)
  });

  // test('should handle empty input', () => {
  //   const filenames: string[] = [];
  //   const expected: string[] = [];

  //   expect(dot2dirPath(filenames)).toEqual(expected);
  // });

  // test('should handle single-level filenames', () => {
  //   const filenames = ['foo', 'bar', 'baz'];
  //   const expected = [
  //     "foo.md", "bar.md", "baz.md"
  //   ];

  //   expect(dot2dirPath(filenames)).toEqual(expected);
  // });

  // test('should handle multi-level filenames', () => {
  //   const filenames = ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.d'];
  //   const expected = [
  //     'a/index.md',
  //     'a/b/index.md',
  //     'a/b/c/index.md',
  //     'a/b/c/d.md',
  //     'a/b/d.md',
  //   ]

  //   expect(dot2dirPath(filenames)).toEqual(expected);
  // });
});
