// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const getMock = jest.fn();
const putMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: getMock,
    put: putMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.user', () => ({
  verifyTokenUser: jest.fn((...args: any[]) => args),
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/user/user.controller', () => ({
  UserController: jest.fn().mockImplementation(() => ({
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  })),
}));

describe('UserRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers GET / with auth middleware and handler', () => {
    const { UserRouter } = require('../../../../src/router/user/user.router');
    new UserRouter();

    expect(getMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = getMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers PUT / with auth middleware and handler', () => {
    const { UserRouter } = require('../../../../src/router/user/user.router');
    new UserRouter();

    expect(putMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = putMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});
