import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('apiUrl should return default before load', () => {
    expect(service.apiUrl).toBeDefined();
    expect(typeof service.apiUrl).toBe('string');
  });

  it('load should fetch /config.json and update config when apiUrl present', async () => {
    const promise = service.load();
    const req = httpMock.expectOne('/config.json');
    expect(req.request.method).toBe('GET');
    req.flush({ apiUrl: 'http://custom/api' });
    const config = await promise;
    expect(config.apiUrl).toBe('http://custom/api');
    expect(service.apiUrl).toBe('http://custom/api');
  });

  it('load should keep default on fetch error', async () => {
    const defaultUrl = service.apiUrl;
    const promise = service.load();
    const req = httpMock.expectOne('/config.json');
    req.error(new ProgressEvent('error'));
    const config = await promise;
    expect(config.apiUrl).toBe(defaultUrl);
  });

  it('load should not refetch when already loaded', async () => {
    const p1 = service.load();
    const req = httpMock.expectOne('/config.json');
    req.flush({ apiUrl: 'http://loaded/api' });
    await p1;
    await service.load(); // should return cached, no new request
    httpMock.verify();
  });
});
