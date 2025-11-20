import { z } from 'zod';

import { defineResource, defineView, getResourceRegistry, getViewRegistry } from '../src';

describe('Battalion Core', () => {
  beforeEach(() => {
    // Reset registries before each test
    const resourceRegistry = getResourceRegistry();
    const viewRegistry = getViewRegistry();
    resourceRegistry.clear();
    viewRegistry.clear();
  });

  describe('Resource Definition', () => {
    it('should create a resource with correct configuration', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({
          id: z.string(),
          title: z.string(),
        }),
        endpoints: {
          list: '/api/pages',
          create: '/api/pages',
        },
        behaviors: {
          optimistic: {
            create: 'append',
          },
          liveSync: true,
        },
      });

      expect(PageResource.name).toBe('Page');
      expect(PageResource.behaviors.optimistic?.create).toBe('append');
      expect(PageResource.behaviors.liveSync).toBe(true);
    });

    it('should register resource in global registry', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({
          id: z.string(),
          title: z.string(),
        }),
        endpoints: {
          list: '/api/pages',
        },
      });

      const registry = getResourceRegistry();
      expect(registry.has('Page')).toBe(true);
      expect(registry.get('Page')).toBe(PageResource);
    });
  });

  describe('View Definition', () => {
    it('should create a view with dependencies', () => {
      const DashboardView = defineView({
        name: 'Dashboard',
        uses: [
          { entity: 'Page', alias: 'pages' },
          { entity: 'Sheet', alias: 'sheets', dependsOn: ['pages'] },
        ],
      });

      expect(DashboardView.name).toBe('Dashboard');
      expect(DashboardView.uses).toHaveLength(2);
      expect(DashboardView.uses[0].entity).toBe('Page');
      expect(DashboardView.uses[1].dependsOn).toEqual(['pages']);
    });

    it('should register view in global registry', () => {
      const DashboardView = defineView({
        name: 'Dashboard',
        uses: [{ entity: 'Page', alias: 'pages' }],
      });

      const registry = getViewRegistry();
      expect(registry.has('Dashboard')).toBe(true);
      expect(registry.get('Dashboard')).toBe(DashboardView);
    });

    it('should validate view dependencies', () => {
      expect(() => {
        defineView({
          name: 'CircularView',
          uses: [
            { entity: 'Page', alias: 'pages', dependsOn: ['sheets'] },
            { entity: 'Sheet', alias: 'sheets', dependsOn: ['pages'] },
          ],
        });
      }).toThrow('Circular dependency detected');
    });
  });

  describe('Registry Management', () => {
    it('should manage resources correctly', () => {
      const registry = getResourceRegistry();

      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      expect(registry.getAll()).toHaveLength(1);
      expect(registry.getNames()).toEqual(['Page']);

      registry.unregister('Page');
      expect(registry.has('Page')).toBe(false);
    });

    it('should manage views correctly', () => {
      const registry = getViewRegistry();

      defineView({
        name: 'Dashboard',
        uses: [{ entity: 'Page', alias: 'pages' }],
      });

      expect(registry.getAll()).toHaveLength(1);
      expect(registry.getNames()).toEqual(['Dashboard']);

      registry.unregister('Dashboard');
      expect(registry.has('Dashboard')).toBe(false);
    });
  });
});
