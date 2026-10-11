import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, StreamableFile } from '@nestjs/common';
import { UploadedFilesController } from './uploaded-files.controller';
import { UploadsService } from './uploads.service';

describe('UploadedFilesController', () => {
  let controller: UploadedFilesController;
  let service: jest.Mocked<Pick<UploadsService, 'findImage'>>;

  const NAME = '6d7e95cf-4588-4b06-bd2b-341dd5a13ccc.webp';

  beforeEach(async () => {
    service = { findImage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadedFilesController],
      providers: [{ provide: UploadsService, useValue: service }],
    }).compile();

    controller = module.get(UploadedFilesController);
  });

  it('should serve the stored image with its type and length', async () => {
    const data = Buffer.from('webp-bytes');
    service.findImage.mockResolvedValue({
      filename: NAME,
      contentType: 'image/webp',
      size: data.length,
      data,
    } as any);

    const result = await controller.getImage(NAME);

    expect(service.findImage).toHaveBeenCalledWith(NAME);
    expect(result).toBeInstanceOf(StreamableFile);
    expect(result.getHeaders()).toMatchObject({
      type: 'image/webp',
      length: data.length,
    });
    const chunks: Buffer[] = [];
    for await (const chunk of result.getStream()) {
      chunks.push(Buffer.from(chunk));
    }
    expect(Buffer.concat(chunks).equals(data)).toBe(true);
  });

  it('should answer 404 for an unknown image', async () => {
    service.findImage.mockResolvedValue(null);

    await expect(controller.getImage(NAME)).rejects.toThrow(NotFoundException);
  });

  it('should be cacheable for a long time (names are never reused)', () => {
    const headers = Reflect.getMetadata(
      '__headers__',
      UploadedFilesController.prototype.getImage,
    );

    expect(headers).toEqual([
      { name: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ]);
  });

  it('should not require authentication (images are shown by <img> tags)', () => {
    expect(
      Reflect.getMetadata('__guards__', UploadedFilesController),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        '__guards__',
        UploadedFilesController.prototype.getImage,
      ),
    ).toBeUndefined();
  });
});
