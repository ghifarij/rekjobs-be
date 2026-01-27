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
jest.mock('../../../../src/controller/auth/session.controller', () => ({
  SessionController: jest.fn().mockImplementation(() => ({
    getSession: jest.fn(),
  })),
}));

describe('SessionRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers GET / with a handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SessionRouter } = require('../../../../src/router/auth/session.router');
    new SessionRouter();

    expect(getMock).toHaveBeenCalled();
    const [path, handler] = getMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof handler).toBe('function');
  });
});
export {};
