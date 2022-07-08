import Crypto from 'crypto'
import Converter from 'hex2dec'

/**
 * Create a challange code according to the fitbit API documentation
 * https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/
 *
 * @returns string Challange Code
 */
export function createCode(): string {
  const randomBytes = Crypto.randomBytes(128)
  const randomDecimalString = Converter.hexToDec(randomBytes.toString('hex'))

  const hash = Crypto.createHash('sha256')
  const hashed = hash.update(randomDecimalString!).digest('base64')

  return hashed.endsWith('=') ? hashed.slice(0, -1) : hashed
}
