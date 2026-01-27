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
jest.mock('../../../../src/controller/auth/authCompany.controller', () => ({
  AuthCompanyController: jest.fn().mockImplementation(() => ({
    loginCompany: jest.fn(),
    registerCompany: jest.fn(),
    verifyCompany: jest.fn(),
    checkVerificationStatus: jest.fn(),
    socialLogin: jest.fn(),
    forgotPasswordCompany: jest.fn(),
    resetPasswordCompany: jest.fn(),
  })),
}));

describe('AuthCompanyRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers all expected POST routes with handlers', () => {
    const {
      AuthCompanyRouter,
    } = require('../../../../src/router/auth/authCompany.router');
    new AuthCompanyRouter();

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
