"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const boodschapRoutes_1 = __importDefault(require("../src/routes/boodschapRoutes"));
console.log("start of checks");
console.log('boodschapRoutes:', boodschapRoutes_1.default);
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
jest.mock('../src/index', () => (Object.assign(Object.assign({}, jest.requireActual('../src/index')), { pool: {
        connect: jest.fn().mockResolvedValue(undefined),
        query: jest.fn(),
    } })));
let app;
let mockPool;
beforeEach(() => {
    jest.clearAllMocks();
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    mockPool = new pg_1.Pool();
    app.use((req, res, next) => {
        req.db = mockPool;
        next();
    });
    // const boodschapRoutes = require('../src/routes/boodschapRoutes').default;
    if (boodschapRoutes_1.default === undefined) {
        console.error('boodschapRoutes is undefined!');
    }
    else {
        console.log('boodschapRoutes is defined:', boodschapRoutes_1.default);
    }
    app.use('/boodschappen', boodschapRoutes_1.default);
});
describe('Boodschap Routes', () => {
    it('GET / should return Boodschappen API Running', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/boodschappen');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Boodschappen API Running');
    }));
});
