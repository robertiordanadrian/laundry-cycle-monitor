import { cyclesListRoutes } from './cycles-list.routes';

describe('cyclesListRoutes', () => {
  it('exposes the list route at the empty path', () => {
    const list = cyclesListRoutes.find((r) => r.path === '');
    expect(list).toBeDefined();
    expect(list?.pathMatch).toBe('full');
    expect(list?.title).toBe('Cycles — LaundryHub');
    expect(typeof list?.loadComponent).toBe('function');
  });

  it('exposes the create route at /new', () => {
    const create = cyclesListRoutes.find((r) => r.path === 'new');
    expect(create).toBeDefined();
    expect(create?.title).toBe('Start new cycle — LaundryHub');
    expect(typeof create?.loadComponent).toBe('function');
  });

  it('loads the CyclesListComponent module lazily', async () => {
    const list = cyclesListRoutes.find((r) => r.path === '')!;
    const loaded = await (list.loadComponent as () => Promise<unknown>)();
    expect((loaded as { name?: string }).name ?? '').toContain('CyclesListComponent');
  });

  it('loads the CreateCycleComponent module lazily under /new', async () => {
    const create = cyclesListRoutes.find((r) => r.path === 'new')!;
    const loaded = await (create.loadComponent as () => Promise<unknown>)();
    expect((loaded as { name?: string }).name ?? '').toContain('CreateCycleComponent');
  });
});
