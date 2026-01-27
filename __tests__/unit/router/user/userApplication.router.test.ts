// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const postMock = jest.fn();
const getMock = jest.fn();
const deleteMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    post: postMock,
    get: getMock,
    delete: deleteMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.user', () => ({
  verifyTokenUser: jest.fn((...args: any[]) => args),
}));

// Mock the upload from src/index to avoid importing the real app
jest.mock('../../../../src', () => ({
  upload: {
    fields: jest.fn(() => jest.fn()),
  },
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/user/userApplication.controller', () => ({
  UserApplicationController: jest.fn().mockImplementation(() => ({
    createApplication: jest.fn(),
    getUserApplications: jest.fn(),
    deleteApplication: jest.fn(),
  })),
}));

describe('UserApplicationRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers POST / with auth + upload middlewares and handler', () => {
    const {
      UserApplicationRouter,
    } = require('../../../../src/router/user/userApplication.router');
    new UserApplicationRouter();

    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, mw1, mw2, handler] = postMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof mw1).toBe('function'); // verifyTokenUser
    expect(typeof mw2).toBe('function'); // multiUpload
    expect(typeof handler).toBe('function');
  });

  it('registers GET / with auth middleware and handler', () => {
    const {
      UserApplicationRouter,
    } = require('../../../../src/router/user/userApplication.router');
    new UserApplicationRouter();

    // Expect one GET route at '/'
    const call = getMock.mock.calls.find((c) => c[0] === '/');
    expect(call).toBeDefined();
    const [, middleware, handler] = call!;
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers DELETE /:id with auth middleware and handler', () => {
    const {
      UserApplicationRouter,
    } = require('../../../../src/router/user/userApplication.router');
    new UserApplicationRouter();

    expect(deleteMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = deleteMock.mock.calls[0];
    expect(path).toBe('/:id');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});
