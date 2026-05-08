import { z } from 'zod';

import { defineResource, getQueryGraph, getResourceRegistry, resetQueryGraph } from '../src';

describe('Battalion Core', () => {
  beforeEach(() => {
    getResourceRegistry().clear();
    resetQueryGraph();
  });

  describe('Resource Definition', () => {
    it('should create a resource with correct configuration', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({ id: z.string(), title: z.string() }),
        endpoints: { list: '/api/pages' },
        transactions: {
          create: 'create_page',
          update: 'update_page',
          delete: 'delete_page',
          resourceType: 'page',
          optimistic: { create: 'append', update: 'merge', delete: 'remove' },
        },
      });

      expect(PageResource.name).toBe('Page');
      expect(PageResource.transactions?.create).toBe('create_page');
      expect(PageResource.transactions?.optimistic?.create).toBe('append');
    });

    it('should register resource in global registry', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      expect(getResourceRegistry().has('Page')).toBe(true);
      expect(getResourceRegistry().get('Page')).toBe(PageResource);
    });

    it('should reuse an already registered resource when a module is evaluated again', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      const ReloadedPageResource = defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      expect(ReloadedPageResource).toBe(PageResource);
      expect(getResourceRegistry().getAll()).toHaveLength(1);
      expect(getQueryGraph().getAllNodes()).toHaveLength(1);
    });

    it('should create a resource with live sync config', () => {
      const PageResource = defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
        liveSync: { enabled: true, strategy: 'polling', interval: 30000 },
      });

      expect(PageResource.liveSync?.enabled).toBe(true);
      expect(PageResource.liveSync?.strategy).toBe('polling');
    });

    it('should create a resource with dependencies', () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      const WidgetResource = defineResource({
        name: 'Widget',
        schema: z.object({ id: z.string(), pageId: z.string() }),
        endpoints: { list: '/api/widgets' },
        dependsOn: [
          { resource: 'Page', extractParams: (pages) => ({ pageIds: (pages as { id: string }[]).map((p) => p.id) }) },
        ],
      });

      expect(WidgetResource.dependsOn).toHaveLength(1);
      expect(WidgetResource.dependsOn?.[0].resource).toBe('Page');
    });
  });

  describe('Query Graph', () => {
    it('should add resource to query graph', () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      expect(getQueryGraph().has('Page')).toBe(true);
    });

    it('should build dependency order', () => {
      defineResource({
        name: 'Page',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/pages' },
      });

      defineResource({
        name: 'Widget',
        schema: z.object({ id: z.string() }),
        endpoints: { list: '/api/widgets' },
        relations: { belongsTo: ['Page'] },
      });

      const order = getQueryGraph().buildDependencyOrder();
      expect(order.indexOf('Page')).toBeLessThan(order.indexOf('Widget'));
    });
  });
});
