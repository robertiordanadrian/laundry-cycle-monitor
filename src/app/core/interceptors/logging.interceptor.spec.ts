import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LOGGER, type Logger } from '@core/tokens';

import { loggingInterceptor } from './logging.interceptor';

describe('loggingInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let logger: jasmine.SpyObj<Logger>;

  beforeEach(() => {
    logger = jasmine.createSpyObj<Logger>('Logger', ['debug', 'info', 'warn', 'error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loggingInterceptor])),
        provideHttpClientTesting(),
        { provide: LOGGER, useValue: logger },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('logs request and response on success', () => {
    http.get('/api/cycles').subscribe();
    controller.expectOne('/api/cycles').flush([]);

    expect(logger.debug).toHaveBeenCalledWith(jasmine.stringMatching(/→ GET \/api\/cycles/));
    expect(logger.debug).toHaveBeenCalledWith(jasmine.stringMatching(/← GET \/api\/cycles 200/));
  });

  it('does not call error logger on success', () => {
    http.get('/api/x').subscribe();
    controller.expectOne('/api/x').flush({});
    expect(logger.error).not.toHaveBeenCalled();
  });
});
