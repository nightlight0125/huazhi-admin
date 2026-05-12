/**
 * TanStack Router uses JSON.parse / JSON.stringify for each search value by default.
 * If a value parses as a small integer, route `validateSearch` may normalize it to
 * a string, then `stringifySearch` wraps that string in JSON quotes — so e.g.
 * `bizUserId=0` becomes `bizUserId=%220%22` in the address bar.
 *
 * If a value is digit-only, we always throw (same idea as the previous
 * "integer-exceeds-safe-range" case) so `parseSearchWith` keeps the **raw** digits
 * and `stringifySearchWith` does not re-apply JSON string quoting. Large
 * unsigned/signed integers and `0` all stay as plain `...=123` / `...=0` in the URL.
 */
export function searchParamJsonParse(str: string): unknown {
  const t = str.trim()
  if (/^-?\d+$/.test(t)) {
    throw new SyntaxError('integer-search-param-raw')
  }
  return JSON.parse(str)
}
