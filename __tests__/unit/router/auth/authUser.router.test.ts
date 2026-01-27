// Create spies for Router methods
const postMock = jest.fn();
const getMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    post: postMock,
    get: getMock,
  })),
}));

// Mock controller to avoid side effects
jest.mock('../../../../src/controller/auth/authUser.controller', () => ({
  AuthUserController: jest.fn().mockImplementation(() => ({
    loginUser: jest.fn(),
    registerUser: jest.fn(),
    verifyUser: jest.fn(),
    checkVerificationStatus: jest.fn(),
    socialLogin: jest.fn(),
    forgotPasswordUser: jest.fn(),
    resetPasswordUser: jest.fn(),
  })),
}));

describe('AuthUserRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers all expected POST routes with handlers', () => {
    const {
      AuthUserRouter,
    } = require('../../../../src/router/auth/authUser.router');
    new AuthUserRouter();

    const paths = postMock.mock.calls.map((c) => c[0]);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/login',
        '/register',
        '/verify',
        '/check-verification',
        '/social-login',
        '/forgot-password',
        '/reset-password',
      ]),
    );

    // Ensure each call has a function handler
    postMock.mock.calls.forEach(([, handler]) => {
      expect(typeof handler).toBe('function');
    });
  });
});
export {};
