import { uploadApplicationFile } from '../../..//src/services/uploadService';

jest.mock('../../../src/services/cloudinary', () => ({
  __esModule: true,
  cloudinaryUpload: jest.fn(),
}));

const { cloudinaryUpload } = require('../../../src/services/cloudinary');

describe('uploadService.uploadApplicationFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns secure_url from cloudinary response', async () => {
    const mockFile = { buffer: Buffer.from('x'), originalname: 'file.pdf' } as any;
    (cloudinaryUpload as jest.Mock).mockResolvedValue({ secure_url: 'https://cdn/x.pdf' });

    const url = await uploadApplicationFile(mockFile, 'applications');

    expect(cloudinaryUpload).toHaveBeenCalledWith(mockFile, 'applications');
    expect(url).toBe('https://cdn/x.pdf');
  });
});

