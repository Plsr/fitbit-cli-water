// TODO: If got return code that access token not valid, try to obtain a new
// code via refresh token
export default class Api {
  accessToken: string;
  refreshToken: string;
  userId: string;

  constructor(accessToken: string, refreshToken: string, userId: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }

  // TODO: Proper interface for return and actually return something
  async getWaterLog(date?: Date): Promise<any> {
    const desiredDate = date ? date : new Date();
    const convertedDate = this.convertDateForAPI(desiredDate);

    const url = `https://api.fitbit.com/1/user/${this.userId}/foods/log/water/date/${convertedDate}.json`;
    const headers = {
      Authorization: "Bearer " + this.accessToken,
      Accept: "application/json",
    };

    const res = await fetch(url, { headers: headers });
    if (res.status === 200) {
      const json = await res.json();
      console.log(json);
    } else if (res.status === 401) {
      console.log(
        "Got 401, will try to get a new access token via refresh token"
      );
    } else {
      throw new Error(await res.json());
    }
  }

  convertDateForAPI(date: Date) {
    return date.toISOString().split("T")[0];
  }
}
