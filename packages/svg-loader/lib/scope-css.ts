interface IdMap {
  [key: string]: string;
}

/**
 * Scopes CSS selectors with a prefix to avoid conflicts
 * Source: https://github.com/thomaspark/scoper
 * @param css The CSS to scope
 * @param prefix The prefix to add to selectors
 * @param idMap Map of old IDs to new IDs
 * @returns Scoped CSS
 */
const scopeCss = (css: string, prefix: string, idMap: IdMap): string => {
  const re = new RegExp('([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)', 'g');
  css = css.replace(re, function (_: string, g1: string, g2: string) {
    if (g1.match(/^\s*(@media|@.*keyframes|to|from|@font-face|1?[0-9]?[0-9])/)) {
      return g1 + g2;
    }

    const idRegex = /#(\w+)/;
    const match = g1.match(idRegex);

    if (match && idMap[match[1]]) {
      g1 = g1.replace(match[0], `#${idMap[match[1]]}`);
    }

    g1 = g1.replace(/^(\s*)/, '$1' + prefix + ' ');

    return g1 + g2;
  });

  return css;
};

export default scopeCss;
