let mockError;

let mockResponse = {
  status: () => {
    return 200;
  },
  body: {},
};

let requestUrl;

let request = {
  post: jest.fn(function (url) {
    requestUrl = url;
    return this;
  }),

  get: jest.fn(function (url) {
    requestUrl = url;
    return this;
  }),

  send: jest.fn().mockReturnThis(),

  query: jest.fn().mockReturnThis(),

  set: jest.fn().mockReturnThis(),

  end: jest.fn().mockImplementation((cb) => {
    cb(mockError, mockResponse);
  }),

  __setMockResponse: (mockRes) => {
    mockResponse = mockRes;
  },

  __setMockError: (mockErr) => {
    mockError = mockErr;
  },

  __setMockResponseBody: (body) => {
    mockResponse.body = body;
  },

  __getRequestUrl: () => {
    return requestUrl;
  },
};


module.exports = request;
