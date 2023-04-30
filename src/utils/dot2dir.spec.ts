import { determineFileTypes, FileType } from './dot2dir';

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
