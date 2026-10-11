import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: jest.Mocked<Pick<UploadsService, 'saveImage'>>;

  const mockFile = {
    buffer: Buffer.from('image-bytes'),
    originalname: 'position.png',
    mimetype: 'image/png',
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    service = {
      saveImage: jest.fn().mockResolvedValue({
        filename: 'test-uuid.png',
        originalName: 'position.png',
        size: 1024,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [{ provide: UploadsService, useValue: service }],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should return imageUrl when file is uploaded', async () => {
      const result = await controller.uploadImage(mockFile);

      expect(result).toEqual({
        imageUrl: '/uploads/test-uuid.png',
        originalName: 'position.png',
        size: 1024,
      });
    });

    it('should store the image through the service, with its owner', async () => {
      const user = { _id: { toString: () => 'user-id' } } as any;

      await controller.uploadImage(mockFile, user);

      expect(service.saveImage).toHaveBeenCalledWith(mockFile, 'user-id');
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.saveImage).not.toHaveBeenCalled();
    });

    it('should propagate a storage error', async () => {
      service.saveImage.mockRejectedValue(new Error('db down'));

      await expect(controller.uploadImage(mockFile)).rejects.toThrow('db down');
    });
  });
});
