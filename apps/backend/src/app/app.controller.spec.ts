import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get(AppService) as jest.Mocked<AppService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getData', () => {
    it('should return data from appService', () => {
      const mockData = { message: 'Hello API' };
      appService.getData.mockReturnValue(mockData);

      const result = controller.getData();

      expect(appService.getData).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
});
