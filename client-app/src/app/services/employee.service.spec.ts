import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test/api/employees';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EmployeeService,
        ApiService,
        { provide: ConfigService, useValue: { apiUrl: 'http://test/api', config: { apiUrl: 'http://test/api' } } }
      ]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPaged should return a paged result', () => {
    const mock = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
    service.getPaged({ pageNumber: 1, pageSize: 10 }).subscribe(res => {
      expect(res.totalCount).toBe(0);
      expect(res.items).toEqual([]);
    });
    const req = httpMock.expectOne(r => r.url.startsWith(baseUrl) && r.params.has('pageNumber'));
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById should return an employee detail', () => {
    const mock = { id: 1, firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe', salary: 100, companyId: 1, companyName: 'Corp', createdAt: '', updatedAt: '' };
    service.getById(1).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.fullName).toBe('Jane Doe');
    });
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create should POST and return employee detail', () => {
    const body = { firstName: 'J', lastName: 'D', salary: 50, companyId: 1 };
    const mock = { id: 1, firstName: 'J', lastName: 'D', fullName: 'J D', salary: 50, companyId: 1, companyName: null, createdAt: '', updatedAt: '' };
    service.create(body).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.firstName).toBe('J');
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update should PUT and return employee detail', () => {
    const body = { firstName: 'J', lastName: 'D', salary: 60, companyId: 1 };
    const mock = { id: 1, firstName: 'J', lastName: 'D', fullName: 'J D', salary: 60, companyId: 1, companyName: null, createdAt: '', updatedAt: '' };
    service.update(1, body).subscribe(res => {
      expect(res.salary).toBe(60);
    });
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });

  it('archive should POST to archive endpoint', () => {
    service.archive(1).subscribe(() => {});
    const req = httpMock.expectOne(`${baseUrl}/1/archive`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('delete should send DELETE', () => {
    service.delete(1).subscribe(() => {});
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getDepartments should return string array', () => {
    service.getDepartments().subscribe(res => {
      expect(res).toEqual(['Engineering', 'Sales']);
    });
    const req = httpMock.expectOne(`${baseUrl}/departments`);
    expect(req.request.method).toBe('GET');
    req.flush(['Engineering', 'Sales']);
  });

  it('getRoles should return string array', () => {
    service.getRoles().subscribe(res => {
      expect(res).toEqual(['Developer']);
    });
    const req = httpMock.expectOne(`${baseUrl}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(['Developer']);
  });

  it('should propagate error on failed request', () => {
    service.getById(999).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err).toBeDefined()
    });
    const req = httpMock.expectOne(`${baseUrl}/999`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
