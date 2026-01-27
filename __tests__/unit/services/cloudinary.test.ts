import type { UploadApiResponse } from 'cloudinary';

// Mock cloudinary v2 shape and streamifier
const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();

jest.mock('cloudinary', () => ({
  __esModule: true,
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((opts: any, cb: Function) => {
        // Return a writable-like object; streamifier.pipe will pass this in
        // We'll trigger the callback from the mocked streamifier
        (mockUploadStream as any).cb = cb;
        return {} as any;
      }),
      destroy: jest.fn((publicId: string) => mockDestroy(publicId)),
    },
  },
}));

jest.mock('streamifier', () => ({
  __esModule: true,
  createReadStream: jest.fn(() => ({
    pipe: (target: any) => {
      // Immediately simulate successful upload via captured callback
      const cb = (mockUploadStream as any).cb;
      if (cb) {
        cb(null, { secure_url: 'https://cdn.example.com/folder/img.png' } as UploadApiResponse);
      }
      return target;
    },
  })),
}));

describe('cloudinary service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cloudinaryUpload resolves with UploadApiResponse', async () => {
    const { cloudinaryUpload } = await import('../../../src/services/cloudinary');
    const file = { buffer: Buffer.from('abc') } as any;
    const res = await cloudinaryUpload(file, 'folder1');
    expect(res.secure_url).toBe('https://cdn.example.com/folder/img.png');
  });

  it('cloudinaryUpload rejects on error from stream', async () => {
    jest.resetModules();
    // Reconfigure streamifier to invoke error path
    jest.doMock('streamifier', () => ({
      __esModule: true,
      createReadStream: jest.fn(() => ({
        pipe: () => {
          const cb = (mockUploadStream as any).cb;
          if (cb) cb(new Error('upload failed'));
          return {};
        },
      })),
    }));

    const { cloudinaryUpload } = await import('../../../src/services/cloudinary');
    const file = { buffer: Buffer.from('abc') } as any;
    await expect(cloudinaryUpload(file, 'folder2')).rejects.toThrow('upload failed');
  });

  it('cloudinaryRemove extracts public id and calls destroy', async () => {
    const { cloudinaryRemove } = await import('../../../src/services/cloudinary');
    const url = 'https://res.cloudinary.com/demo/image/upload/v123/folder/photo_12345.png';
    (mockDestroy as jest.Mock).mockResolvedValue({ result: 'ok' });
    const result = await cloudinaryRemove(url);
    expect(mockDestroy).toHaveBeenCalledWith('photo_12345');
    expect(result).toEqual({ result: 'ok' });
  });
});

