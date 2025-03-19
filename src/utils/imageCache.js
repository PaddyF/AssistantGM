// Image caching utility for web platform
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEY_PREFIX = 'image_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Web-specific implementation
const getWebCachedImage = async (url) => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + url;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { url: cachedUrl, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      if (now - timestamp < CACHE_EXPIRY) {
        return cachedUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

const cacheWebImage = async (url) => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + url;
    const existingCache = await getWebCachedImage(url);
    
    if (existingCache) {
      return existingCache;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const cacheData = {
      url: objectUrl,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return objectUrl;
  } catch (error) {
    console.error('Error caching image:', error);
    return url;
  }
};

const clearWebCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    for (const key of cacheKeys) {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        const { url } = JSON.parse(cachedData);
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }
    }
    
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

// Native-specific implementation
const getNativeCachedImage = async (url) => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + url;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { url: cachedUrl, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      if (now - timestamp < CACHE_EXPIRY) {
        return cachedUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

const cacheNativeImage = async (url) => {
  try {
    const cacheKey = CACHE_KEY_PREFIX + url;
    const existingCache = await getNativeCachedImage(url);
    
    if (existingCache) {
      return existingCache;
    }

    const cacheData = {
      url,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return url;
  } catch (error) {
    console.error('Error caching image:', error);
    return url;
  }
};

const clearNativeCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

// Platform-specific exports
export const getCachedImage = Platform.OS === 'web' ? getWebCachedImage : getNativeCachedImage;
export const cacheImage = Platform.OS === 'web' ? cacheWebImage : cacheNativeImage;
export const clearImageCache = Platform.OS === 'web' ? clearWebCache : clearNativeCache;

// Export internal functions for testing
export { getWebCachedImage, cacheWebImage, clearWebCache, getNativeCachedImage, cacheNativeImage, clearNativeCache }; 