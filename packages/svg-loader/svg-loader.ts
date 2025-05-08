import { del, get, set } from 'idb-keyval';

import counter from './lib/counter';
import cssUrlFixer from './lib/css-url-fixer';
import cssScope from './lib/scope-css';

interface CacheItem {
  data: string;
  expiry: number;
}

interface RenderOptions {
  enableJs: boolean;
  disableUniqueIds: boolean;
  disableCssScoping: boolean;
  spriteIconId: string;
}

interface IdMap {
  [key: string]: string;
}

interface AttributesSet {
  [key: string]: Set<string>;
}

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const isCacheAvailable = async (url: string): Promise<string | null> => {
  if (!isBrowser) return null;

  let item: string | null = null;

  try {
    const cachedItem = await get<string>(`loader_${url}`);
    if (cachedItem) {
      item = cachedItem;
    }
  } catch (e) {
    // Ignore error
  }

  if (!item) {
    try {
      item = localStorage.getItem(`loader_${url}`);
    } catch (e) {
      // Ignore error
    }
  }

  if (!item) {
    return null;
  }

  try {
    const parsedItem: CacheItem = JSON.parse(item);
    if (Date.now() < parsedItem.expiry) {
      return parsedItem.data;
    } else {
      await del(`loader_${url}`);
      return null;
    }
  } catch (e) {
    return null;
  }
};

const setCache = async (url: string, data: string, cacheOpt: string): Promise<void> => {
  if (!isBrowser) return;

  const cacheExp = parseInt(cacheOpt, 10);
  const dataToSet = JSON.stringify({
    data,
    expiry: Date.now() + (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 * 30 : cacheExp * 1000),
  });

  try {
    await set(`loader_${url}`, dataToSet);
  } catch (e) {
    try {
      localStorage.setItem(`loader_${url}`, dataToSet);
    } catch (e) {
      console.warn('Failed to set cache: ', e);
    }
  }
};

const DOM_EVENTS: string[] = [];
const getAllEventNames = (): string[] => {
  if (!isBrowser) return [];

  if (DOM_EVENTS.length) {
    return DOM_EVENTS;
  }

  for (const prop in document.body) {
    if (prop.startsWith('on')) {
      DOM_EVENTS.push(prop);
    }
  }

  // SVG <animate> events
  DOM_EVENTS.push('onbegin', 'onend', 'onrepeat');

  // Some non-standard events, just in case the browser is handling them
  DOM_EVENTS.push('onfocusin', 'onfocusout', 'onbounce', 'onfinish', 'onshow');

  return DOM_EVENTS;
};

const attributesSet: AttributesSet = {};

const renderBody = (elem: SVGElement, options: RenderOptions, body: string): void => {
  if (!isBrowser) return;

  const { enableJs, disableUniqueIds, disableCssScoping, spriteIconId } = options;

  const isSpriteIcon = !!spriteIconId;
  const parser = new DOMParser();
  const doc = parser.parseFromString(body, 'text/html');
  const fragment = isSpriteIcon ? doc.getElementById(spriteIconId) : doc.querySelector('svg');

  if (!fragment) {
    console.log('No SVG element found in the loaded content', spriteIconId);
    return;
  }

  const eventNames = getAllEventNames();

  // When svg-loader is loading in the same element, it's
  // important to keep track of original properties.
  const elemAttributesSet = attributesSet[elem.getAttribute('data-id') || ''] || new Set<string>();

  const elemUniqueId = elem.getAttribute('data-id') || `svg-loader_${counter.incr()}`;

  const idMap: IdMap = {};

  if (!disableUniqueIds) {
    // Append a unique suffix for every ID so elements don't conflict.
    Array.from(fragment.querySelectorAll('[id]')).forEach((elem) => {
      const id = elem.getAttribute('id');
      if (id) {
        const newId = `${id}_${counter.incr()}`;
        elem.setAttribute('id', newId);
        idMap[id] = newId;
      }
    });
  }

  Array.from(fragment.querySelectorAll('*'))
    .concat(fragment)
    .forEach((el) => {
      // Unless explicitly set, remove JS code (default)
      if (el.tagName === 'script') {
        el.remove();
        if (!enableJs) {
          return;
        } else {
          const scriptEl = document.createElement('script');
          if (el.firstChild) {
            scriptEl.appendChild(el.firstChild);
          }
          elem.appendChild(scriptEl);
        }
      }

      const attributesToRemove: string[] = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const { name, value } = el.attributes[i];

        const newValue = cssUrlFixer(idMap, value, name);

        if (value !== newValue) {
          el.setAttribute(name, newValue);
        }

        // Remove event functions: onmouseover, onclick ... unless specifically enabled
        if (eventNames.includes(name.toLowerCase()) && !enableJs) {
          attributesToRemove.push(name);
          continue;
        }

        // Remove "javascript:..." unless specifically enabled
        if (['href', 'xlink:href', 'values'].includes(name) && value.startsWith('javascript') && !enableJs) {
          attributesToRemove.push(name);
        }
      }

      attributesToRemove.forEach((attr) => el.removeAttribute(attr));

      // .first -> [data-id="svg_loader_341xx"] .first
      // Makes sure that class names don't conflict with each other.
      if (el.tagName === 'style' && !disableCssScoping) {
        let newValue = cssScope(el.innerHTML, `[data-id="${elemUniqueId}"]`, idMap);
        newValue = cssUrlFixer(idMap, newValue, 'style');
        if (newValue !== el.innerHTML) {
          el.innerHTML = newValue;
        }
      }
    });

  // For a sprite we want to include the whole DOM of sprite element
  elem.innerHTML = spriteIconId ? fragment.outerHTML : fragment.innerHTML;

  // This code block basically merges attributes of the original SVG
  // the SVG element where it is called from.
  if (!isSpriteIcon) {
    for (let i = 0; i < fragment.attributes.length; i++) {
      const { name, value } = fragment.attributes[i];

      // Don't override the attributes already defined, but override the ones that
      // were in the original element
      if (!elem.getAttribute(name) || elemAttributesSet.has(name)) {
        elemAttributesSet.add(name);
        elem.setAttribute(name, value);
      }
    }
  }

  attributesSet[elemUniqueId] = elemAttributesSet;

  elem.setAttribute('data-id', elemUniqueId);

  const event = new CustomEvent('iconload', {
    bubbles: true,
  });
  elem.dispatchEvent(event);

  if (elem.getAttribute('oniconload')) {
    const onIconLoad = elem.getAttribute('oniconload');
    if (onIconLoad) {
      elem.setAttribute('onauxclick', onIconLoad);

      const event = new CustomEvent('auxclick', {
        bubbles: false,
      });
      elem.dispatchEvent(event);

      elem.removeAttribute('onauxclick');
    }
  }
};

const requestsInProgress: { [key: string]: boolean } = {};
const memoryCache: { [key: string]: string } = {};

const renderIcon = async (elem: SVGElement): Promise<void> => {
  if (!isBrowser) return;

  const dataSrc = elem.getAttribute('data-src');
  if (!dataSrc) {
    console.warn('No data-src attribute found on SVG element');
    return;
  }

  try {
    const url = new URL(dataSrc, window.location.href);
    const src = url.toString().replace(url.hash, '');
    const spriteIconId = url.hash.replace('#', '') || '';

    const cacheOpt = elem.getAttribute('data-cache') || '';

    const enableJs = elem.getAttribute('data-js') === 'enabled';
    const disableUniqueIds = elem.getAttribute('data-unique-ids') === 'disabled';
    const disableCssScoping = elem.getAttribute('data-css-scoping') === 'disabled';

    const lsCache = await isCacheAvailable(src);
    const isCachingEnabled = cacheOpt !== 'disabled';

    const renderBodyCb = renderBody.bind(self, elem, { enableJs, disableUniqueIds, disableCssScoping, spriteIconId });

    // Memory cache optimizes same icon requested multiple
    // times on the page
    if (memoryCache[src] || (isCachingEnabled && lsCache)) {
      const cache = memoryCache[src] || lsCache;
      if (cache) {
        renderBodyCb(cache);
      }
    } else {
      // If the same icon is being requested to rendered
      // avoid firing multiple XHRs
      if (requestsInProgress[src]) {
        setTimeout(() => renderIcon(elem), 20);
        return;
      }

      requestsInProgress[src] = true;

      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();

        if (isCachingEnabled) {
          await setCache(src, data, cacheOpt);
        }

        memoryCache[src] = data;
        renderBodyCb(data);
      } catch (error) {
        console.error('Error loading SVG:', error);
      } finally {
        delete requestsInProgress[src];
      }
    }
  } catch (e) {
    console.error('Invalid URL:', dataSrc);
  }
};

function renderAllSVGs(): void {
  if (!isBrowser) return;

  document.querySelectorAll('svg[data-src]').forEach((elem) => {
    if (elem instanceof SVGElement) {
      renderIcon(elem);
    }
  });
}

const addObservers = (): void => {
  if (!isBrowser) return;

  // Watch for DOM changes and render any new SVGs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.tagName === 'svg' && node.hasAttribute('data-src')) {
            renderIcon(node as SVGElement);
          }
          node.querySelectorAll('svg[data-src]').forEach((elem) => {
            if (elem instanceof SVGElement) {
              renderIcon(elem);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

function init(): void {
  if (!isBrowser) return;

  renderAllSVGs();
  addObservers();
}

// Initialize when DOM is ready
if (isBrowser) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export default {
  renderIcon,
  renderAllSVGs,
};
