import { ConsoleLogger, SilentLogger } from './logger.token';

describe('ConsoleLogger', () => {
  it('filters out messages below the configured threshold', () => {
    const debugSpy = spyOn(console, 'debug');
    const infoSpy = spyOn(console, 'info');
    const warnSpy = spyOn(console, 'warn');
    const errorSpy = spyOn(console, 'error');

    const logger = new ConsoleLogger('warn');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('w');
    expect(errorSpy).toHaveBeenCalledWith('e');
  });

  it('passes through all levels at debug threshold', () => {
    const debugSpy = spyOn(console, 'debug');
    const infoSpy = spyOn(console, 'info');

    const logger = new ConsoleLogger('debug');
    logger.debug('d');
    logger.info('i');

    expect(debugSpy).toHaveBeenCalledWith('d');
    expect(infoSpy).toHaveBeenCalledWith('i');
  });

  it('silent logger swallows every level', () => {
    const logger = new SilentLogger();
    expect(() => {
      logger.debug('x');
      logger.info('x');
      logger.warn('x');
      logger.error('x');
    }).not.toThrow();
  });
});
