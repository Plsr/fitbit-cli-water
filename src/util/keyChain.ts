import { exec, ExecException } from "child_process";

export const REFRESH_TOKEN_KEY = "fitbit_cli_water_refresh_token";
export const ACCESS_TOKEN_KEY = "fitbit_cli_water_access_token";
export const USER_ID_KEY = "fitbit_cli_water_user_id";

export async function deleteItem(
  key: KeychainKey
): Promise<string | undefined> {
  const delCmd = `security delete-generic-password -a '${key}' -s '${key}'`;

  // TODO: Does delete print to stderror instead?
  return await execCmd(delCmd);
}

export async function getItem(key: KeychainKey): Promise<string | undefined> {
  const getCmd = `security find-generic-password -wa '${key}'`;

  return await execCmd(getCmd);
}

export async function storeItem(key: KeychainKey, item: string) {
  const storeCmd = `security add-generic-password -a '${key}' -s '${key}' -w '${item}'`;
  return await execCmd(storeCmd);
}

export async function execCmd(cmd: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        console.log("erorrd");
        console.log(error);
        reject(new Error("fooerror"));
      }
      if (stderr) {
        console.log("stderr");
        console.log(stderr);
        reject(new Error("fooerror"));
      }
      resolve(stdout);
    });
  });
}

type KeychainKey =
  | "fitbit_cli_water_refresh_token"
  | "fitbit_cli_water_access_token"
  | "fitbit_cli_water_user_id";
