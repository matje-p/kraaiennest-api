import request from 'supertest';
import express, { Express } from 'express';
import { Pool } from 'pg';
import boodschapRoutes from '../src/routes/boodschapRoutes';

console.log("start of checks")
console.log('boodschapRoutes:', boodschapRoutes);

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('../src/utils/caseConversions', () => ({
  convertKeys: jest.fn((obj) => obj),
}));

jest.mock('../src/index', () => ({
  ...jest.requireActual('../src/index'),
  pool: {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
  },
}));

let app: Express;
let mockPool: jest.Mocked<Pool>;

beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    mockPool = new Pool() as jest.Mocked<Pool>;
  
    app.use((req, res, next) => {
      req.db = mockPool;
      next();
    });
  
    // const boodschapRoutes = require('../src/routes/boodschapRoutes').default;

    if (boodschapRoutes === undefined) {
        console.error('boodschapRoutes is undefined!');
      } else {
        console.log('boodschapRoutes is defined:', boodschapRoutes);
      }
 
  
    app.use('/boodschappen', boodschapRoutes);
  });
  

describe('Boodschap Routes', () => {
  it('GET / should return Boodschappen API Running', async () => {
    const response = await request(app).get('/boodschappen');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Boodschappen API Running');
  });
});
