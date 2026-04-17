import { createCycleRoutes } from './create-cycle.routes';

describe('createCycleRoutes', () => {
  it('exposes a single lazy-loaded route', () => {
    expect(createCycleRoutes.length).toBe(1);
    const [route] = createCycleRoutes;
    expect(route?.path).toBe('');
    expect(route?.pathMatch).toBe('full');
    expect(route?.title).toBe('Start new cycle — LaundryHub');
    expect(typeof route?.loadComponent).toBe('function');
  });

  it('resolves loadComponent to the CreateCycleComponent class', async () => {
    const loaded = await (createCycleRoutes[0]!.loadComponent as () => Promise<unknown>)();
    expect((loaded as { name?: string }).name ?? '').toContain('CreateCycleComponent');
  });
});
