import Crypto from "crypto";
import Converter from "hex2dec";
import base64url from "base64url";

/**
 * Create a challange code according to the fitbit API documentation
 * https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/
 *
 * @returns string Challange Code
 */
export function createCodeChallange(codeVerifier: string): string {
  const hash = Crypto.createHash("sha256");
  const hashed = hash.update(codeVerifier).digest("base64");

  return base64url.fromBase64(hashed);
}

export function createCodeVerifier(): string {
  const randomBytes = Crypto.randomBytes(128);
  const string = Converter.hexToDec(randomBytes.toString("hex"))!;
  return string.slice(0, 127);
}
