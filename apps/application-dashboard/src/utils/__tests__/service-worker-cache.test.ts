import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

type ListenerMap = Record<
  string,
  (event: { request: Request; respondWith: (response: Promise<Response> | Response) => void }) => void
>;

class TestHeaders {
  get() {
    return null;
  }
}

class TestRequest {
  method = 'GET';
  mode = 'same-origin';

  constructor(public url: string) {}
}

class TestResponse {
  headers = new TestHeaders();
  status = 200;
  type = 'basic';

  constructor(private body: string) {}

  clone() {
    return new TestResponse(this.body);
  }

  async text() {
    return this.body;
  }
}

function loadServiceWorker({
  cachedResponse,
  networkResponse,
}: {
  cachedResponse?: Response;
  networkResponse: Response;
}) {
  const listeners: ListenerMap = {};
  const fetch = jest.fn().mockResolvedValue(networkResponse);
  const caches = {
    delete: jest.fn().mockResolvedValue(true),
    keys: jest.fn().mockResolvedValue([]),
    match: jest.fn().mockResolvedValue(cachedResponse),
    open: jest.fn().mockResolvedValue({
      keys: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(true),
    }),
  };
  const context = {
    URL,
    Headers: TestHeaders,
    Request: TestRequest,
    Response: TestResponse,
    fetch,
    caches,
    indexedDB: undefined,
    self: {
      location: { origin: 'https://local.zamp.ai' },
      clients: { claim: jest.fn().mockResolvedValue(undefined) },
      skipWaiting: jest.fn(),
      addEventListener: jest.fn((type: string, listener: ListenerMap[string]) => {
        listeners[type] = listener;
      }),
    },
  };

  const swPath = path.resolve(__dirname, '../../../public/sw.js');
  const source = fs.readFileSync(swPath, 'utf8');

  vm.runInNewContext(source, context);

  async function dispatchFetch(request: Request) {
    let responsePromise: Promise<Response> | undefined;

    listeners.fetch({
      request,
      respondWith: (response) => {
        responsePromise = Promise.resolve(response);
      },
    });

    return responsePromise ? responsePromise : fetch(request);
  }

  return { caches, dispatchFetch, fetch };
}

describe('service worker caching', () => {
  it('bypasses the service worker cache for Next.js static chunks', async () => {
    const staleResponse = new TestResponse('stale-chunk') as unknown as Response;
    const networkResponse = new TestResponse('fresh-chunk') as unknown as Response;
    const { caches, dispatchFetch, fetch } = loadServiceWorker({
      cachedResponse: staleResponse,
      networkResponse,
    });

    const response = await dispatchFetch(
      new TestRequest('https://local.zamp.ai/_next/static/chunks/app.js') as Request,
    );

    expect(await response.text()).toBe('fresh-chunk');
    expect(caches.match).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
