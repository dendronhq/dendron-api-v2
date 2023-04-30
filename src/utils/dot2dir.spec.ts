import { determineFileTypes, dot2dirPath, FileType } from './dot2dir';

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

    expect(determineFileTypes(filenames)).toEqual(expected);
  });

  test('should handle empty input', () => {
    const filenames: string[] = [];
    const expected: Map<string, FileType> = new Map();

    expect(determineFileTypes(filenames)).toEqual(expected);
  });

  test('should handle single-level filenames', () => {
    const filenames = ['foo', 'bar', 'baz'];
    const expected: Map<string, FileType> = new Map([
      ['foo', 'file'],
      ['bar', 'file'],
      ['baz', 'file'],
    ]);

    expect(determineFileTypes(filenames)).toEqual(expected);
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

    expect(determineFileTypes(filenames)).toEqual(expected);
  });
});


describe('dot2dirPath', () => {
  test('should correctly identify file types', () => {
    const filenames = [
      'bar',
      'bar.two',
      'bar.alpha',
      'bar.alpha.one',
      'foo.two.three',
    ];
    const expected = [
      'bar/index.md',
      'bar/two.md',
      'bar/alpha/index.md',
      'bar/alpha/one.md',
      'foo/two/three.md',
    ];

    expect(dot2dirPath(filenames)).toEqual(expected);
  });

  test('should handle empty input', () => {
    const filenames: string[] = [];
    const expected: string[] = [];

    expect(dot2dirPath(filenames)).toEqual(expected);
  });

  test('should handle single-level filenames', () => {
    const filenames = ['foo', 'bar', 'baz'];
    const expected = [
      "foo.md", "bar.md", "baz.md"
    ];

    expect(dot2dirPath(filenames)).toEqual(expected);
  });

  test('should handle multi-level filenames', () => {
    const filenames = ['a', 'a.b', 'a.b.c', 'a.b.c.d', 'a.b.d'];
    const expected = [
      'a/index.md',
      'a/b/index.md',
      'a/b/c/index.md',
      'a/b/c/d.md',
      'a/b/d.md',
    ]

    expect(dot2dirPath(filenames)).toEqual(expected);
  });
});
