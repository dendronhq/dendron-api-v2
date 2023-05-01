import express, { NextFunction, Request, Response } from "express";
import morgan from 'morgan';
import { Stream } from 'stream';
import { register } from "./api/generated";
import dendron from "./services/dendron";
import imdb from "./services/imdb";
import { logger } from "./logger";



// Morgan logger configuration
const morganStream = new Stream.Writable({
  write: function (chunk: any, encoding: any, next: Function) {
    logger.info(chunk.toString());
    next();
  },
});

const PORT = 8080;

const app = express();
app.use(
  morgan('combined', {
    stream: morganStream,
    skip: (req: Request, res: Response) => {
      return res.statusCode >= 400;
    },
  })
);
// Express middleware for handling errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send('Something went wrong!');
});


register(app, {
  imdb,
  dendron
});

app.listen(PORT);
console.log(`🎉 Listening on port ${PORT}...`);
