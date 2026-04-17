/**
 * TanStack Router defaults to JSON.parse per search value. Digit-only strings beyond
 * `Number.MAX_SAFE_INTEGER` become rounded numbers, then `stringifySearch` wraps string
 * state in JSON quotes (`%22...%22` in the URL).
 *
 * For those values we throw so `parseSearchWith` keeps the raw string and
 * `stringifySearchWith` skips `JSON.stringify` for the same strings.
 */
export function searchParamJsonParse(str: string): unknown {
  const t = str.trim()
  if (/^-?\d+$/.test(t)) {
    const bi = BigInt(t)
    const max = BigInt(Number.MAX_SAFE_INTEGER)
    const min = BigInt(Number.MIN_SAFE_INTEGER)
    if (bi > max || bi < min) {
      throw new SyntaxError('integer-exceeds-safe-range')
    }
  }
  return JSON.parse(str)
}
