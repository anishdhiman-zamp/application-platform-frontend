import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface RouteMatchOptions {
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

interface RouteMatchResult {
  isExact: boolean;
  params: Record<string, string>;
  path: string;
  url: string;
}

/**
 * A hook that matches the current URL against a pattern, similar to React Router's useRouteMatch.
 * @param options - Configuration options for route matching
 * @returns RouteMatchResult | null - The match result if the route matches, null otherwise
 */
export const useRouteMatch = (options?: RouteMatchOptions): RouteMatchResult | null => {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams() ?? '';

  return useMemo(() => {
    if (!options?.path) {
      return {
        isExact: true,
        params: {},
        path: pathname,
        url: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
      };
    }

    const pattern = options.path;
    const exact = options.exact ?? false;
    const strict = options.strict ?? false;
    const sensitive = options.sensitive ?? false;

    // Normalize paths for strict matching
    const normalizedPathname = strict ? pathname.replace(/\/+$/, '') : pathname;
    const normalizedPattern = strict ? pattern.replace(/\/+$/, '') : pattern;

    // Convert pattern to regex
    const patternRegex = new RegExp(
      '^' +
        normalizedPattern
          .replace(/:[^/]+/g, '([^/]+)') // Replace :param with capture group
          .replace(/\//g, '\\/') + // Escape forward slashes
        (exact ? '$' : ''),
      sensitive ? '' : 'i',
    );

    const match = normalizedPathname.match(patternRegex);

    if (!match) {
      return null;
    }

    // Extract params from the URL
    const params: Record<string, string> = {};
    const paramNames = normalizedPattern.match(/:[^/]+/g) || [];

    paramNames.forEach((param, index) => {
      const paramName = param.slice(1); // Remove the : prefix

      params[paramName] = match[index + 1];
    });

    const isExact = normalizedPathname === normalizedPattern;

    return {
      isExact,
      params,
      path: pattern,
      url: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
    };
  }, [pathname, searchParams, options]);
};
