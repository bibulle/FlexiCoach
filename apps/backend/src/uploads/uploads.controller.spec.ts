import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { BadRequestException } from '@nestjs/common';

describe('UploadsController', () => {
  let controller: UploadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should return imageUrl when file is uploaded', () => {
      const mockFile = {
        filename: 'test-uuid.png',
        originalname: 'position.png',
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      const result = controller.uploadImage(mockFile);
      expect(result).toEqual({
        imageUrl: '/uploads/test-uuid.png',
        originalName: 'position.png',
        size: 1024,
      });
    });

    it('should throw BadRequestException when no file provided', () => {
      expect(() => controller.uploadImage(null as any)).toThrow(
        BadRequestException,
      );
    });
  });
});
