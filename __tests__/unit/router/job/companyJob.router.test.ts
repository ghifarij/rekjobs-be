// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const postMock = jest.fn();
const getMock = jest.fn();
const putMock = jest.fn();
const deleteMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    post: postMock,
    get: getMock,
    put: putMock,
    delete: deleteMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.company', () => ({
  verifyTokenCompany: jest.fn((...args: any[]) => args),
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/job/companyJob.controller', () => ({
  CompanyJobController: jest.fn().mockImplementation(() => ({
    createJob: jest.fn(),
    getJobs: jest.fn(),
    getJobById: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
  })),
}));

describe('CompanyJobRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers POST / with auth middleware and handler', () => {
    const {
      CompanyJobRouter,
    } = require('../../../../src/router/job/companyJob.router');
    new CompanyJobRouter();

    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = postMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers GET / and GET /:id with auth middleware and handlers', () => {
    const {
      CompanyJobRouter,
    } = require('../../../../src/router/job/companyJob.router');
    new CompanyJobRouter();

    const paths = getMock.mock.calls.map((c) => c[0]);
    expect(paths).toEqual(expect.arrayContaining(['/', '/:id']));
    // Each call should have middleware and handler
    getMock.mock.calls.forEach(([, middleware, handler]) => {
      expect(typeof middleware).toBe('function');
      expect(typeof handler).toBe('function');
    });
  });

  it('registers PUT /:id with auth middleware and handler', () => {
    const {
      CompanyJobRouter,
    } = require('../../../../src/router/job/companyJob.router');
    new CompanyJobRouter();

    expect(putMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = putMock.mock.calls[0];
    expect(path).toBe('/:id');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers DELETE /:id with auth middleware and handler', () => {
    const {
      CompanyJobRouter,
    } = require('../../../../src/router/job/companyJob.router');
    new CompanyJobRouter();

    expect(deleteMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = deleteMock.mock.calls[0];
    expect(path).toBe('/:id');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});
