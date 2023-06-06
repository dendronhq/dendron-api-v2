/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import morgan from 'morgan';
import { Stream } from 'stream';
import { register } from "./api/generated";
import { logger } from "./logger";
import dendron from "./services/dendron";



// Morgan logger configuration
const morganStream = new Stream.Writable({
  // eslint-disable-next-line @typescript-eslint/ban-types
  write: function (chunk: any, _encoding: any, next: Function) {
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
// eslint-disable-next-line @typescript-eslint/ban-types
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error(err.stack);
  res.status(500).send('Something went wrong!');
});


register(app, {
  dendron
});

app.listen(PORT);
console.log(`🎉 Listening on port ${PORT}...`);
