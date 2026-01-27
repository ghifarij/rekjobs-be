// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const getMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: getMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.user', () => ({
  verifyTokenUser: jest.fn((...args: any[]) => args),
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/job/job.controller', () => ({
  JobController: jest.fn().mockImplementation(() => ({
    getAllJobs: jest.fn(),
    getJobBySlug: jest.fn(),
  })),
}));

describe('JobRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers GET / with auth middleware and handler', () => {
    const { JobRouter } = require('../../../../src/router/job/job.router');
    new JobRouter();

    const call = getMock.mock.calls.find((c) => c[0] === '/');
    expect(call).toBeDefined();
    const [, middleware, handler] = call!;
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers GET /:slug with auth middleware and handler', () => {
    const { JobRouter } = require('../../../../src/router/job/job.router');
    new JobRouter();

    const call = getMock.mock.calls.find((c) => c[0] === '/:slug');
    expect(call).toBeDefined();
    const [, middleware, handler] = call!;
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});
