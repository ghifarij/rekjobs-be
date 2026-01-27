// We mock multer to capture provided storage and its constructors
jest.mock('multer', () => {
  const multerFn = jest.fn((args: any) => ({
    __storage: args.storage,
    single: jest.fn(),
    array: jest.fn(),
    fields: jest.fn(),
  }));
  (multerFn as any).memoryStorage = jest.fn(() => 'MEM_STORAGE');
  (multerFn as any).diskStorage = jest.fn((opts: any) => ({ kind: 'DISK', opts }));
  return {
    __esModule: true,
    default: multerFn,
  };
});

describe('uploader', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('uses memoryStorage by default', () => {
    jest.isolateModules(() => {
      const multer = require('multer').default as jest.Mock;
      const { uploader } = require('../../../src/services/uploader');
      const mw = uploader(undefined as any, 'pre-');
      expect((multer as any).memoryStorage).toHaveBeenCalled();
      expect((mw as any).__storage).toBe('MEM_STORAGE');
    });
  });

  it('configures diskStorage with destination and filename', () => {
    jest.isolateModules(() => {
      const multer = require('multer').default as jest.Mock;
      const { uploader } = require('../../../src/services/uploader');
      const mw = uploader('diskStorage', 'pre-', '/uploads');
      const storage = (mw as any).__storage;
      expect((multer as any).diskStorage).toHaveBeenCalled();
      expect(storage.kind).toBe('DISK');
      const { destination, filename } = storage.opts;

      // Test destination callback appends folderName
      const cbDest = jest.fn();
      destination({} as any, { originalname: 'a.txt' } as any, cbDest);
      expect(cbDest).toHaveBeenCalledWith(null, expect.any(String));
      const destPath = (cbDest.mock.calls[0][1] as string) || '';
      expect(destPath).toEqual(expect.stringContaining('/uploads'));

      // Test filename callback uses prefix and extension
      const cbFile = jest.fn();
      filename({} as any, { originalname: 'doc.image.png' } as any, cbFile);
      expect(cbFile).toHaveBeenCalledWith(null, expect.any(String));
      const produced = cbFile.mock.calls[0][1] as string;
      expect(produced.startsWith('pre-')).toBe(true);
      expect(produced.endsWith('.png')).toBe(true);
    });
  });
});

