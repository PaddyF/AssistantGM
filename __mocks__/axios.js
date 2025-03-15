const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const mockAxios = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

// Create returns the same mock instance
const create = jest.fn(() => mockAxios);

// Export both the instance and the create method
module.exports = {
  ...mockAxios,
  create,
  default: {
    ...mockAxios,
    create
  },
  // Export mock functions for easy access in tests
  mockGet,
  mockPost,
  mockPut,
  mockDelete
}; 