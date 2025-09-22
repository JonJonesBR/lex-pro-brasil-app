// src/services/dataService.ts

/**
 * Service for handling localStorage operations
 */
class DataService {
  /**
   * Save data to localStorage
   */
  static saveToLocalStorage<T>(key: string, data: T): void {
    if (typeof window !== 'undefined') {
      try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  }

  /**
   * Load data from localStorage
   */
  static loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window !== 'undefined') {
      try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
          return defaultValue;
        }
        return JSON.parse(serializedData);
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * Remove data from localStorage
   */
  static removeFromLocalStorage(key: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
      }
    }
  }

  /**
   * Clear all data from localStorage
   */
  static clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  }
}

export default DataService;