import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompanyService } from './company.service';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test/api/companies';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CompanyService,
        ApiService,
        { provide: ConfigService, useValue: { apiUrl: 'http://test/api', config: { apiUrl: 'http://test/api' } } }
      ]
    });
    service = TestBed.inject(CompanyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should return companies', () => {
    const mock = [{ id: 1, name: 'Corp', address: 'Addr' }];
    service.getAll().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Corp');
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById should return a company', () => {
    const mock = { id: 1, name: 'TechCorp', address: 'Berlin' };
    service.getById(1).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.name).toBe('TechCorp');
    });
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getEmployees should return employee list', () => {
    const mock = [{ id: 1, firstName: 'J', lastName: 'D', fullName: 'J D', salary: 100, companyId: 1, companyName: null, department: null, role: null, email: null, createdAt: '' }];
    service.getEmployees(1).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].fullName).toBe('J D');
    });
    const req = httpMock.expectOne(`${baseUrl}/1/employees`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('create should POST and return company', () => {
    const body = { name: 'NewCorp', address: 'Hamburg' };
    const mock = { id: 1, name: 'NewCorp', address: 'Hamburg' };
    service.create(body).subscribe(res => {
      expect(res.name).toBe('NewCorp');
      expect(res.address).toBe('Hamburg');
    });
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mock);
  });

  it('update should PUT and return company', () => {
    const body = { name: 'Updated', address: 'Munich' };
    const mock = { id: 1, name: 'Updated', address: 'Munich' };
    service.update(1, body).subscribe(res => {
      expect(res.name).toBe('Updated');
    });
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });

  it('delete should send DELETE', () => {
    service.delete(1).subscribe(() => {});
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
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
