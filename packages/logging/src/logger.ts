import { Logger } from "tslog";
import { PROD } from "@avatar-history/env";

export const logger = new Logger({
  name: "avatar-history",
  type: "pretty",
  colorizePrettyLogs: true,
  displayFunctionName: false,
  displayFilePath: "hidden",
  minLevel: PROD ? "info" : "silly",
});
