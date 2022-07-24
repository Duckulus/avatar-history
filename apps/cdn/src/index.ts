import express from "express";
import { CDN_PORT } from "@avatar-history/env";

const main = () => {
  const app = express();
  app.use(express.static("../../static"));
  app.use("*", (req, res) => {
    res.status(404).send("File not found");
  });
  app.listen(CDN_PORT, () => {
    console.log(`CDN listening on ${CDN_PORT}`);
  });
};

main();
