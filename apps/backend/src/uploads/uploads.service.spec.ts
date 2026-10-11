import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ImageFile, UploadsService } from './uploads.service';
import { UploadedImage } from '../schemas/uploaded-image.schema';

describe('UploadsService', () => {
  let service: UploadsService;
  let mockImageModel: any;
  let saved: any[];

  const UUID_NAME =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

  const file = (overrides: Partial<ImageFile> = {}): ImageFile => ({
    buffer: Buffer.from('image-bytes'),
    mimetype: 'image/png',
    originalname: 'ma position.png',
    size: 11,
    ...overrides,
  });

  beforeEach(async () => {
    saved = [];
    mockImageModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockImplementation(async () => {
        saved.push(data);
        return data;
      }),
    }));
    mockImageModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: getModelToken(UploadedImage.name),
          useValue: mockImageModel,
        },
      ],
    }).compile();

    service = module.get(UploadsService);
  });

  describe('saveImage', () => {
    it('should store the image content and its metadata in the database', async () => {
      const result = await service.saveImage(file(), 'user-id');

      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({
        contentType: 'image/png',
        size: 11,
        originalName: 'ma position.png',
        ownerId: 'user-id',
      });
      expect(saved[0].data.equals(Buffer.from('image-bytes'))).toBe(true);
      expect(result).toEqual({
        filename: saved[0].filename,
        originalName: 'ma position.png',
        size: 11,
      });
    });

    it('should generate a random public name', async () => {
      const first = await service.saveImage(file());
      const second = await service.saveImage(file());

      expect(first.filename).toMatch(UUID_NAME);
      expect(second.filename).toMatch(UUID_NAME);
      expect(first.filename).not.toBe(second.filename);
    });

    it.each([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/webp', '.webp'],
    ])('should give a %s image the extension %s', async (mimetype, ext) => {
      const result = await service.saveImage(file({ mimetype }));

      expect(result.filename.endsWith(ext)).toBe(true);
    });

    it('should take the extension from the type, not from the client file name', async () => {
      const result = await service.saveImage(
        file({ mimetype: 'image/png', originalname: 'evil.html' }),
      );

      expect(result.filename).toMatch(/\.png$/);
      expect(result.filename).not.toContain('html');
      // The original name is only kept as a label
      expect(result.originalName).toBe('evil.html');
    });

    it('should accept an image without owner', async () => {
      await service.saveImage(file());

      expect(saved[0].ownerId).toBeUndefined();
    });

    it('should propagate a database error', async () => {
      mockImageModel.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(new Error('db down')),
      }));

      await expect(service.saveImage(file())).rejects.toThrow('db down');
    });
  });

  describe('findImage', () => {
    const NAME = '6d7e95cf-4588-4b06-bd2b-341dd5a13ccc.png';

    it('should return the image stored under this name', async () => {
      const image = { filename: NAME, contentType: 'image/png' };
      mockImageModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(image),
      });

      expect(await service.findImage(NAME)).toBe(image);
      expect(mockImageModel.findOne).toHaveBeenCalledWith({ filename: NAME });
    });

    it('should return null for an unknown image', async () => {
      expect(await service.findImage(NAME)).toBeNull();
    });

    it.each([
      'image.png',
      '../main.js',
      '6d7e95cf-4588-4b06-bd2b-341dd5a13ccc',
      '6d7e95cf-4588-4b06-bd2b-341dd5a13ccc.html',
      '6d7e95cf-4588-4b06-bd2b-341dd5a13ccc.png/../x',
      '',
    ])(
      'should not query the database for the malformed name "%s"',
      async (name) => {
        expect(await service.findImage(name)).toBeNull();
        expect(mockImageModel.findOne).not.toHaveBeenCalled();
      },
    );
  });
});
