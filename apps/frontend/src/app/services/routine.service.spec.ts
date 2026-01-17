import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RoutineService } from './routine.service';
import { Routine } from '@flexicoach/shared';
import { firstValueFrom } from 'rxjs';

describe('RoutineService', () => {
  let service: RoutineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoutineService],
    });

    service = TestBed.inject(RoutineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should make GET request to /api/routines', async () => {
      const mockRoutines: Routine[] = [
        {
          _id: '1',
          name: 'Routine 1',
          slug: 'routine-1',
          description: 'Description 1',
          exercises: [],
        } as Routine,
        {
          _id: '2',
          name: 'Routine 2',
          slug: 'routine-2',
          description: 'Description 2',
          exercises: [],
        } as Routine,
      ];

      const responsePromise = firstValueFrom(service.getAll());

      const req = httpMock.expectOne('/api/routines');
      expect(req.request.method).toBe('GET');
      req.flush(mockRoutines);

      const routines = await responsePromise;
      expect(routines).toEqual(mockRoutines);
      expect(routines.length).toBe(2);
    });
  });

  describe('getById', () => {
    it('should make GET request to /api/routines/:id', async () => {
      const mockRoutine: Routine = {
        _id: '123',
        name: 'Test Routine',
        slug: 'test-routine',
        description: 'Test Description',
        exercises: [],
      } as Routine;

      const responsePromise = firstValueFrom(service.getById('123'));

      const req = httpMock.expectOne('/api/routines/123');
      expect(req.request.method).toBe('GET');
      req.flush(mockRoutine);

      const routine = await responsePromise;
      expect(routine).toEqual(mockRoutine);
      expect(routine._id).toBe('123');
    });
  });

  describe('getBySlug', () => {
    it('should make GET request to /api/routines/slug/:slug', async () => {
      const mockRoutine: Routine = {
        _id: '123',
        name: 'Test Routine',
        slug: 'test-routine',
        description: 'Test Description',
        exercises: [],
      } as Routine;

      const responsePromise = firstValueFrom(service.getBySlug('test-routine'));

      const req = httpMock.expectOne('/api/routines/slug/test-routine');
      expect(req.request.method).toBe('GET');
      req.flush(mockRoutine);

      const routine = await responsePromise;
      expect(routine).toEqual(mockRoutine);
      expect(routine.slug).toBe('test-routine');
    });
  });

  describe('create', () => {
    it('should make POST request to /api/routines', async () => {
      const newRoutine: Partial<Routine> = {
        name: 'New Routine',
        slug: 'new-routine',
        description: 'New Description',
        exercises: [],
      };

      const mockResponse: Routine = {
        _id: '456',
        ...newRoutine,
      } as Routine;

      const responsePromise = firstValueFrom(service.create(newRoutine));

      const req = httpMock.expectOne('/api/routines');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRoutine);
      req.flush(mockResponse);

      const routine = await responsePromise;
      expect(routine).toEqual(mockResponse);
      expect(routine._id).toBe('456');
    });
  });

  describe('update', () => {
    it('should make PATCH request to /api/routines/:id', async () => {
      const routineId = '123';
      const updateData: Partial<Routine> = {
        name: 'Updated Routine',
        description: 'Updated Description',
      };

      const mockResponse: Routine = {
        _id: routineId,
        name: 'Updated Routine',
        slug: 'test-routine',
        description: 'Updated Description',
        exercises: [],
      } as Routine;

      const responsePromise = firstValueFrom(service.update(routineId, updateData));

      const req = httpMock.expectOne('/api/routines/123');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);

      const routine = await responsePromise;
      expect(routine).toEqual(mockResponse);
      expect(routine.name).toBe('Updated Routine');
    });
  });

  describe('delete', () => {
    it('should make DELETE request to /api/routines/:id', async () => {
      const routineId = '123';
      const mockResponse: Routine = {
        _id: routineId,
        name: 'Deleted Routine',
        slug: 'deleted-routine',
        description: 'Description',
        exercises: [],
      } as Routine;

      const responsePromise = firstValueFrom(service.delete(routineId));

      const req = httpMock.expectOne('/api/routines/123');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      const routine = await responsePromise;
      expect(routine).toEqual(mockResponse);
    });
  });
});
