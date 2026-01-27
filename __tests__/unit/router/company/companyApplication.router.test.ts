// Make this file a module to avoid TS var redeclare across tests
export {};

// Create spies for Router methods
const getMock = jest.fn();
const patchMock = jest.fn();

// Mock express.Router to return our spy methods
jest.mock('express', () => ({
  Router: jest.fn(() => ({
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
  '../../../../src/controller/company/companyApplication.controller',
  () => ({
    CompanyApplicationController: jest.fn().mockImplementation(() => ({
      getCompanyApplications: jest.fn(),
      getApplicationById: jest.fn(),
      updateApplicationStatus: jest.fn(),
    })),
  }),
);

describe('CompanyApplicationRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers GET / and GET /:id with auth middleware and handlers', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CompanyApplicationRouter } = require('../../../../src/router/company/companyApplication.router');
    new CompanyApplicationRouter();

    // Expect two GET routes
    expect(getMock.mock.calls.length).toBe(2);
    const paths = getMock.mock.calls.map((c) => c[0]);
    expect(paths).toEqual(expect.arrayContaining(['/','/:id']));

    // Ensure each has middleware and a handler
    getMock.mock.calls.forEach(([, middleware, handler]) => {
      expect(typeof middleware).toBe('function');
      expect(typeof handler).toBe('function');
    });
  });

  it('registers PATCH /:id/status with auth middleware and handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CompanyApplicationRouter } = require('../../../../src/router/company/companyApplication.router');
    new CompanyApplicationRouter();

    expect(patchMock).toHaveBeenCalledTimes(1);
    const [path, middleware, handler] = patchMock.mock.calls[0];
    expect(path).toBe('/:id/status');
    expect(typeof middleware).toBe('function');
    expect(typeof handler).toBe('function');
  });
});

