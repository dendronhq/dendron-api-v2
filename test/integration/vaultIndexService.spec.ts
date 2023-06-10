import { PrismaClient } from '@prisma/client';
import { VaultsIndexService } from '../../src/serviceImpl/sync/vaultsIndexService';
import { file2note, readFilesRecursively } from "../../src/utils/dot2dir";

jest.mock("../../src/utils/dot2dir");

let pclient: PrismaClient;

beforeAll(async () => {
  pclient = new PrismaClient();
  await pclient.note.deleteMany();
});

afterAll(async () => {
  await pclient.$disconnect();
});

describe('when calling VaultsIndexService', () => {
  describe("when parsing tags", () => {
    it('should parse tags', async () => {
      // Mock the utilities
      (readFilesRecursively as jest.Mock).mockReturnValue(['test.md']);
      (file2note as jest.Mock).mockReturnValue({
        content: 'test content #foo',
        fname: 'test.md',
        data: {
          id: '1',
          title: 'Test Note',
          created: Date.now(),
          updated: Date.now(),
          tags: ['test'],
        },
      });

      const service = new VaultsIndexService();
      const result = await service.execute({
        vaultName: 'testVault',
        src: '/path/to/src',
        include: { hierarchies: ['*'] },
        dest: ""
      });

      // Check the results
      expect(result).toEqual({ numNotesIndexed: 1 });

      // Check that the note has been stored in the database
      const dbNote = await pclient.note.findUnique({ where: { id: '1' } });
      expect(dbNote).not.toBeNull();
      expect(dbNote?.title).toBe('Test Note');
      expect(dbNote?.tags).toEqual(JSON.stringify(["test", "foo"]))
      // expect(dbNote).toMatchSnapshot()
    });
  });

  describe("when parsing tags with number", () => {
    it('should parse tags', async () => {
      // Mock the utilities
      (readFilesRecursively as jest.Mock).mockReturnValue(['test.md']);
      (file2note as jest.Mock).mockReturnValue({
        content: 'test content #foo.1',
        fname: 'test.md',
        data: {
          id: '1',
          title: 'Test Note',
          created: Date.now(),
          updated: Date.now(),
          tags: ['test'],
        },
      });

      const service = new VaultsIndexService();
      const result = await service.execute({
        vaultName: 'testVault',
        src: '/path/to/src',
        include: { hierarchies: ['*'] },
        dest: ""
      });

      // Check the results
      expect(result).toEqual({ numNotesIndexed: 1 });

      // Check that the note has been stored in the database
      const dbNote = await pclient.note.findUnique({ where: { id: '1' } });
      expect(dbNote).not.toBeNull();
      expect(dbNote?.title).toBe('Test Note');
      expect(dbNote?.tags).toEqual(JSON.stringify(["test", "foo.1"]))
      expect(dbNote).toMatchSnapshot()
    });
  });

});
