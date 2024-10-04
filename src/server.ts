import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { resolve as pathResolve } from 'path';
import { DatabaseService } from './services/database';
import { CollectionRouter } from './routers/collection';
import { ItemRouter } from './routers/item';
import { SearchRouter } from './routers/search';
import { IResponseError } from './models/responses';
import { ServerError } from './lib/error';
import { UtilitiesRouter } from './routers/utils';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const db = new DatabaseService();

app.use(cors());
app.use(bodyParser.json());

// Debug routes
app.use((req: Request, res: Response, next: NextFunction) => {

  console.log(`${req.method} ${req.originalUrl}`);

  if ( req.method !== 'GET' && req.body )
    console.log(req.body);
  
  next();

});

// API routes
app.use('/api', CollectionRouter);
app.use('/api', ItemRouter);
app.use('/api', SearchRouter);
app.use('/api', UtilitiesRouter);

// API 404
app.use('/api', (req: Request, res: Response<IResponseError>) => {

  res.status(404).json({
    code: 'not-found',
    message: 'The requested path does not exist!'
  });

});

// Frontend static files
app.use(express.static(pathResolve(__dirname, '..', 'public')));

// Frontend 404 routing
app.use('/', (req: Request, res: Response) => {

  res.sendFile(pathResolve(__dirname, '..', 'public', 'index.html'));

});

// Global error handler
app.use((error: ServerError, req: Request, res: Response<IResponseError>, next: NextFunction) => {

  if ( ! (error instanceof ServerError) )
    error = ServerError.from(error);

  console.error(`An error occured!`, error);

  if ( res.headersSent )
    return next(error);

  res.status(error.statusCode).json({
    code: error.code || 'unknown',
    message: error.message
  });

});

app.listen(port, async () => {

  console.log('Connecting to database...');

  try {

    await db.init();

  }
  catch (error) {

    console.error('Error connecting to database!');
    console.error(error);

  }
  
  console.log(`Server started on port ${port}...`);

});