let mockError;

let mockResponse = {
  status: () => {
    return 200;
  },
};

let request = {
  post: jest.fn().mockReturnThis(),

  get: jest.fn().mockReturnThis(),

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
};


module.exports = request;
