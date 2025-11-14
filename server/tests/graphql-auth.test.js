const { getAuthenticatedUser } = require('../src/graphql/auth');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');

// Mock User model
jest.mock('../src/models/user.model');

describe('GraphQL Authentication', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test_secret_key';
  });

  describe('getAuthenticatedUser', () => {
    test('should authenticate user with valid Bearer token', async () => {
      const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, process.env.JWT_ACCESS_SECRET);
      User.findById.mockResolvedValue(mockUser);

      const context = { token: `Bearer ${token}` };
      const user = await getAuthenticatedUser(context);

      expect(user).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith(mockUser.id);
    });

    test('should authenticate user with token without Bearer prefix', async () => {
      const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, process.env.JWT_ACCESS_SECRET);
      User.findById.mockResolvedValue(mockUser);

      const context = { token };
      const user = await getAuthenticatedUser(context);

      expect(user).toEqual(mockUser);
    });

    test('should throw error if no token provided', async () => {
      const context = { token: null };

      await expect(getAuthenticatedUser(context)).rejects.toThrow('Authentication required');
    });

    test('should throw error if token is invalid', async () => {
      const context = { token: 'Bearer invalid_token' };

      await expect(getAuthenticatedUser(context)).rejects.toThrow('Invalid or expired token');
    });

    test('should throw error if user not found', async () => {
      const token = jwt.sign({ id: 999, role: 'user' }, process.env.JWT_ACCESS_SECRET);
      User.findById.mockResolvedValue(null);

      const context = { token: `Bearer ${token}` };

      await expect(getAuthenticatedUser(context)).rejects.toThrow('User not found');
    });

    test('should throw error if JWT secret not configured', async () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_SECRET;

      const token = jwt.sign({ id: mockUser.id }, 'some_secret');
      const context = { token: `Bearer ${token}` };

      await expect(getAuthenticatedUser(context)).rejects.toThrow('JWT secret not configured');
    });
  });
});
