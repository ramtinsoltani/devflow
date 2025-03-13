import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { resolve as pathResolve } from 'path';
import { ServerError } from './lib/error';
import { Service } from './services/common';
import { DatabaseService } from './services/database';
import { ValidatorService } from './services/validator';
import { AuthService } from './services/auth';
import { SpaceRouter } from './routers/space';
import { CollectionRouter } from './routers/collection';
import { ItemRouter } from './routers/item';
import { SearchRouter } from './routers/search';
import { PermissionsRouter } from './routers/permissions';
import { UtilitiesRouter } from './routers/utils';
import { HealthRouter } from './routers/health';
import { IResponseError } from './models/responses';
import { TestRouter } from './routers/test';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// Services
declare global {
  var services: {
    db: DatabaseService,
    validator: ValidatorService,
    auth: AuthService
  };
}

globalThis.services = {
  db: new DatabaseService(),
  validator: new ValidatorService(),
  auth: new AuthService()
};

// Setup CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || true
}));

app.use(bodyParser.json());

// Debug routes
app.use((req: Request, res: Response, next: NextFunction) => {

  if ( process.env.DEBUG_ROUTES?.toLowerCase() === 'true' ) {

    console.log(`${req.method} ${req.originalUrl}`);

    if ( req.method !== 'GET' && req.body )
      console.log(req.body);

  }
  
  next();

});

// API routes
app.use('/api', HealthRouter);
app.use('/api', TestRouter);
app.use('/api', SpaceRouter);
app.use('/api', CollectionRouter);
app.use('/api', ItemRouter);
app.use('/api', SearchRouter);
app.use('/api', PermissionsRouter);
app.use('/api', UtilitiesRouter);

// API 404
app.use('/api', (req: Request, res: Response<IResponseError>) => {

  res.status(404).json({
    code: 'not-found',
    message: 'The requested path does not exist!'
  });

});

if ( process.env.HOST_FE?.toLowerCase() === 'true' ) {

  console.log('Setting up frontend hosting...');

  // Frontend static files
  app.use(express.static(pathResolve(__dirname, '..', 'public')));

  // Frontend 404 routing
  app.use('/', (req: Request, res: Response) => {

    res.sendFile(pathResolve(__dirname, '..', 'public', 'index.html'));

  });

}

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

  // Initialize the services
  for ( const serviceName in services ) {

    try {

      await ((services as any)[serviceName] as Service).init();

    }
    catch (error) {

      return console.error(`Failed to initialize service ${serviceName}!\n`, error);

    }

  }
  
  console.log(`Server started on port ${port}`);

});