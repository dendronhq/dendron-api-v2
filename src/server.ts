import express from "express";
import { register } from "./api/generated";
import imdb from "./services/imdb";
import dendron from "./services/dendron";

const PORT = 8080;

const app = express();

register(app, {
  imdb,
  dendron
});

app.listen(PORT);
console.log(`🎉 Listening on port ${PORT}...`);
