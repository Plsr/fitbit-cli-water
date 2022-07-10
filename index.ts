import {
  createCodeChallange,
  createCodeVerifier,
} from "./src/util/codeChallange";
import {
  storeItem,
  getItem,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ID_KEY,
} from "./src/util/keyChain";
import Api from "./src/util/api";
import dotenv from "dotenv";
import open from "open";
import express from "express";
import https from "https";
import fs from "fs";

dotenv.config();

/**
 * Auth flow
 * - [ ] Check if auth needed
 * - [x] If needed, start auth server
 * - [x] Make request to gain permissions
 * - [x] On response, change auth code for Access and Refresh Tokens
 * - [x] Save auth code to keychain if retrieved
 */

let server: https.Server;
let codeVerifier: string;
let challengeCode: string;
let api: Api;

main();

async function main() {
  if (await authNeeded()) {
    // TODO: Should be a distinct file
    startAuthServer();
    authorizationRequest();
  }
}

async function authNeeded(): Promise<boolean> {
  try {
    const accessToken = await getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await getItem(REFRESH_TOKEN_KEY);
    const userId = await getItem(USER_ID_KEY);

    if (!accessToken || !refreshToken || !userId) return true;

    api = new Api(accessToken, refreshToken, userId);
    const res = await api.getWaterLog();
    console.log(res);
  } catch (error) {
    console.log("Auth data not saved, need to obtain new");
    return true;
  }
  return false;
}

function authorizationRequest() {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const scope = "nutrition";
  codeVerifier = createCodeVerifier();
  challengeCode = createCodeChallange(codeVerifier);
  const codeChallangeMethod = "S256";
  const responseType = "code";

  const url = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&code_challenge=${challengeCode}&code_challenge_method=${codeChallangeMethod}&scope=${scope}`;
  open(url);
}

function startAuthServer() {
  // TODO: Check if present and throw useful error otherwise
  const key = fs.readFileSync("./key.pem");
  const cert = fs.readFileSync("./cert.pem");

  const port = 7777;
  const app = express();

  server = https.createServer({ key: key, cert: cert }, app);

  server.listen(port, () => {
    console.log(`Auth callback server is running on http://localhost:${port}`);
  });

  app.get("/callback", (req, res) => {
    if (req.query["code"]) {
      const code = req.query["code"];
      exchangeAuthCodeForTokens(code as string);
    }
    res.send(200);
  });
}

function stopAuthServer() {
  server.close(() => {
    console.log("Authentication successful, shutting down callback server");
  });
}

async function exchangeAuthCodeForTokens(authCode: string) {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const url = `https://api.fitbit.com/oauth2/token?client_id=${clientId}&code=${authCode}&code_verifier=${codeVerifier}&grant_type=authorization_code`;
  const contentType = "application/x-www-form-urlencoded";
  const headers = {
    "Content-Type": contentType,
  };

  const res = await fetch(url, { method: "POST", headers: headers });
  const data = await res.json();
  console.log(data);
  const { refresh_token, access_token, user_id } = data;
  await handleTokenStorage(access_token, refresh_token, user_id);
}

async function handleTokenStorage(
  accessToken: string,
  refreshToken: string,
  userId: string
) {
  try {
    await storeItem(ACCESS_TOKEN_KEY, accessToken);
    await storeItem(REFRESH_TOKEN_KEY, refreshToken);
    await storeItem(USER_ID_KEY, userId);
    stopAuthServer();
  } catch (error) {
    console.error(error);
  }
}
