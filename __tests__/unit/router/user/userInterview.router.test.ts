// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const patchMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    patch: patchMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.user', () => ({
  verifyTokenUser: jest.fn((...args: any[]) => args),
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/user/userInterview.controller', () => ({
  UserInterviewController: jest.fn().mockImplementation(() => ({
    requestReschedule: jest.fn(),
    acceptInterview: jest.fn(),
  })),
}));

describe('UserInterviewRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers PATCH /:id/reschedule with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UserInterviewRouter } = require('../../../../src/router/user/userInterview.router');
    new UserInterviewRouter();

    const call = patchMock.mock.calls.find((c) => c[0] === '/:id/reschedule');
    expect(call).toBeDefined();
    const [, middleware, handler] = call!;
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers PATCH /:id/accept with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UserInterviewRouter } = require('../../../../src/router/user/userInterview.router');
    new UserInterviewRouter();

    const call = patchMock.mock.calls.find((c) => c[0] === '/:id/accept');
    expect(call).toBeDefined();
    const [, middleware, handler] = call!;
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});

