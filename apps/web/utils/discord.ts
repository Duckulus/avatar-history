import axios from "axios";
import { AxiosRequestConfig } from "axios";

const base = "https://discord.com/api/v10";

export const getDiscord = async (
  route: string,
  config: AxiosRequestConfig
): Promise<any> => {
  const resp = await axios.get(base + route, config);
  return resp.data;
};
