import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as imageCache from '../../src/utils/imageCache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('Image Cache Utils', () => {
  const mockObjectUrl = 'blob:test-url';
  const mockImageUrl = 'https://example.com/image.jpg';
  const mockCacheKey = 'image_cache_' + mockImageUrl;
  const mockTimestamp = Date.now();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock AsyncStorage methods
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    AsyncStorage.getAllKeys.mockResolvedValue([]);
    AsyncStorage.multiRemove.mockResolvedValue(undefined);
    
    // Mock URL methods for web environment
    if (typeof global.URL.createObjectURL === 'undefined') {
      global.URL.createObjectURL = jest.fn().mockReturnValue(mockObjectUrl);
      global.URL.revokeObjectURL = jest.fn();
    }

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob()),
      })
    );
  });

  describe('Web Environment', () => {
    beforeEach(() => {
      // Mock the exports to use web implementations
      jest.spyOn(imageCache, 'getCachedImage').mockImplementation(imageCache.getWebCachedImage);
      jest.spyOn(imageCache, 'cacheImage').mockImplementation(imageCache.cacheWebImage);
      jest.spyOn(imageCache, 'clearImageCache').mockImplementation(imageCache.clearWebCache);

      // Mock URL methods for web environment
      global.URL.createObjectURL = jest.fn().mockReturnValue(mockObjectUrl);
      global.URL.revokeObjectURL = jest.fn();

      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        })
      );

      // Mock Date.now
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    });

    describe('getCachedImage', () => {
      it('should return null when no cache exists', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);
        
        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBeNull();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(mockCacheKey);
      });

      it('should return cached image when valid cache exists', async () => {
        const mockCache = JSON.stringify({
          url: mockObjectUrl,
          timestamp: mockTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBe(mockObjectUrl);
      });

      it('should return null when cache is expired', async () => {
        const expiredTimestamp = mockTimestamp - (8 * 24 * 60 * 60 * 1000); // 8 days old
        const mockCache = JSON.stringify({
          url: mockObjectUrl,
          timestamp: expiredTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBeNull();
      });
    });

    describe('cacheImage', () => {
      it('should download and cache new image', async () => {
        // Mock getCachedImage to return null (no existing cache)
        AsyncStorage.getItem.mockResolvedValue(null);
        
        // Mock fetch and URL.createObjectURL
        const mockBlob = new Blob();
        global.fetch.mockResolvedValue({
          blob: () => Promise.resolve(mockBlob),
        });
        global.URL.createObjectURL.mockReturnValue(mockObjectUrl);
        
        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockObjectUrl);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          mockCacheKey,
          JSON.stringify({
            url: mockObjectUrl,
            timestamp: mockTimestamp
          })
        );
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });

      it('should return existing cached image if available', async () => {
        const mockCache = JSON.stringify({
          url: mockObjectUrl,
          timestamp: mockTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockObjectUrl);
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });

      it('should return original URL if caching fails', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockImageUrl);
      });
    });

    describe('clearImageCache', () => {
      it('should clear all cached images', async () => {
        const mockKeys = ['image_cache_1', 'image_cache_2'];
        AsyncStorage.getAllKeys.mockResolvedValueOnce(mockKeys);
        
        // Mock cached data for each key
        AsyncStorage.getItem.mockImplementation((key) => {
          if (key === 'image_cache_1') {
            return Promise.resolve(JSON.stringify({
              url: 'blob:test-url-1',
              timestamp: mockTimestamp
            }));
          }
          if (key === 'image_cache_2') {
            return Promise.resolve(JSON.stringify({
              url: 'blob:test-url-2',
              timestamp: mockTimestamp
            }));
          }
          return Promise.resolve(null);
        });

        await imageCache.clearImageCache();
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(mockKeys);
        expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url-1');
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url-2');
      });
    });
  });

  describe('Native Environment', () => {
    beforeEach(() => {
      // Mock the exports to use native implementations
      jest.spyOn(imageCache, 'getCachedImage').mockImplementation(imageCache.getNativeCachedImage);
      jest.spyOn(imageCache, 'cacheImage').mockImplementation(imageCache.cacheNativeImage);
      jest.spyOn(imageCache, 'clearImageCache').mockImplementation(imageCache.clearNativeCache);

      // Mock Date.now
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    });

    describe('getCachedImage', () => {
      it('should return null when no cache exists', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);
        
        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBeNull();
      });

      it('should return cached image when valid cache exists', async () => {
        const mockCache = JSON.stringify({
          url: mockImageUrl,
          timestamp: mockTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBe(mockImageUrl);
      });

      it('should return null when cache is expired', async () => {
        const expiredTimestamp = mockTimestamp - (8 * 24 * 60 * 60 * 1000); // 8 days old
        const mockCache = JSON.stringify({
          url: mockImageUrl,
          timestamp: expiredTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.getCachedImage(mockImageUrl);
        expect(result).toBeNull();
      });
    });

    describe('cacheImage', () => {
      it('should cache image URL', async () => {
        // Mock getCachedImage to return null (no existing cache)
        AsyncStorage.getItem.mockResolvedValue(null);
        
        // Mock AsyncStorage.setItem to succeed
        AsyncStorage.setItem.mockResolvedValue(undefined);
        
        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockImageUrl);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          mockCacheKey,
          JSON.stringify({
            url: mockImageUrl,
            timestamp: mockTimestamp
          })
        );
      });

      it('should return existing cached image if available', async () => {
        const mockCache = JSON.stringify({
          url: mockImageUrl,
          timestamp: mockTimestamp,
        });
        AsyncStorage.getItem.mockResolvedValueOnce(mockCache);

        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockImageUrl);
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      });

      it('should return original URL if caching fails', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);
        AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

        const result = await imageCache.cacheImage(mockImageUrl);
        expect(result).toBe(mockImageUrl);
      });
    });

    describe('clearImageCache', () => {
      it('should clear all cached images', async () => {
        const mockKeys = ['image_cache_1', 'image_cache_2'];
        AsyncStorage.getAllKeys.mockResolvedValueOnce(mockKeys);

        await imageCache.clearImageCache();
        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(mockKeys);
      });

      it('should handle errors gracefully', async () => {
        AsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));

        await expect(imageCache.clearImageCache()).resolves.not.toThrow();
      });
    });
  });
}); 