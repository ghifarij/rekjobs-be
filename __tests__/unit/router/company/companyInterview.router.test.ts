// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const postMock = jest.fn();
const getMock = jest.fn();
const patchMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    post: postMock,
    get: getMock,
    patch: patchMock,
  })),
}));

// Mock middleware to a simple function
jest.mock('../../../../src/middleware/verify.company', () => ({
  verifyTokenCompany: jest.fn((...args: any[]) => args),
}));

// Mock controller to avoid side effects
jest.mock(
  '../../../../src/controller/company/companyInterview.controller',
  () => ({
    CompanyInterviewController: jest.fn().mockImplementation(() => ({
      createInterview: jest.fn(),
      getCompanyInterviews: jest.fn(),
      reschedule: jest.fn(),
    })),
  }),
);

describe('CompanyInterviewRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers POST / with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CompanyInterviewRouter } = require('../../../../src/router/company/companyInterview.router');
    new CompanyInterviewRouter();

    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = postMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers GET / with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CompanyInterviewRouter } = require('../../../../src/router/company/companyInterview.router');
    new CompanyInterviewRouter();

    expect(getMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = getMock.mock.calls[0];
    expect(path).toBe('/');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });

  it('registers PATCH /:id with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CompanyInterviewRouter } = require('../../../../src/router/company/companyInterview.router');
    new CompanyInterviewRouter();

    expect(patchMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = patchMock.mock.calls[0];
    expect(path).toBe('/:id');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});

