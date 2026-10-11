import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UploadService, UploadResult } from './upload.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UploadService', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UploadService],
    });
    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadImage', () => {
    it('should POST FormData and return UploadResult', () => {
      const mockFile = new File(['test'], 'position.png', {
        type: 'image/png',
      });
      const mockResponse: UploadResult = {
        imageUrl: '/uploads/abc-123.png',
        originalName: 'position.png',
        size: 4,
      };

      let result: UploadResult | null = null;
      service.uploadImage(mockFile).subscribe((res) => (result = res));

      const req = httpMock.expectOne('/api/uploads/image');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });
});
