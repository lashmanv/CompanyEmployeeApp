import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('toasts$ should emit when show is called', (done) => {
    service.toasts$.subscribe(msg => {
      expect(msg.message).toBe('Test');
      expect(msg.type).toBe('info');
      done();
    });
    service.show('Test');
  });

  it('success should emit with type success', (done) => {
    service.toasts$.subscribe(msg => {
      expect(msg.message).toBe('Done');
      expect(msg.type).toBe('success');
      done();
    });
    service.success('Done');
  });

  it('error should emit with type error', (done) => {
    service.toasts$.subscribe(msg => {
      expect(msg.message).toBe('Failed');
      expect(msg.type).toBe('error');
      done();
    });
    service.error('Failed');
  });
});
