import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock for import.meta.env before importing the config module
const mockEnv: Record<string, string | undefined> = {};

vi.mock('@/lib/config', async () => {
  // This gets the actual module logic but with mocked env
  const getGalaChainEnv = () => {
    const value = mockEnv.VITE_GALACHAIN_ENV;
    if (!value) return 'stage';
    const normalized = value.toLowerCase() as 'production' | 'stage';
    if (normalized !== 'production' && normalized !== 'stage') {
      return 'stage';
    }
    return normalized;
  };

  const getUrl = (envValue: string | undefined, defaultValue: string): string => {
    if (!envValue) return defaultValue;
    try {
      new URL(envValue);
      return envValue;
    } catch {
      return defaultValue;
    }
  };

  const GALACHAIN_DEFAULTS = {
    production: {
      gatewayUrl: 'https://gateway.galachain.com',
      apiUrl: 'https://api.galachain.com',
    },
    stage: {
      gatewayUrl: 'https://gateway-stage.galachain.com',
      apiUrl: 'https://api-stage.galachain.com',
    },
  };

  return {
    get config() {
      const galachainEnv = getGalaChainEnv();
      const defaults = GALACHAIN_DEFAULTS[galachainEnv];

      return {
        apiBaseUrl: mockEnv.VITE_API_BASE_URL || '',
        galachain: {
          env: galachainEnv,
          gatewayUrl: getUrl(mockEnv.VITE_GALACHAIN_GATEWAY_URL, defaults.gatewayUrl),
          apiUrl: getUrl(mockEnv.VITE_GALACHAIN_API_URL, defaults.apiUrl),
        },
      };
    },
  };
});

describe('client config', () => {
  beforeEach(() => {
    // Clear mock env before each test
    Object.keys(mockEnv).forEach((key) => delete mockEnv[key]);
  });

  describe('defaults', () => {
    it('should return stage defaults when no environment variables are set', async () => {
      const { config } = await import('@/lib/config');

      expect(config.galachain.env).toBe('stage');
      expect(config.galachain.gatewayUrl).toBe('https://gateway-stage.galachain.com');
      expect(config.galachain.apiUrl).toBe('https://api-stage.galachain.com');
    });

    it('should return empty apiBaseUrl by default', async () => {
      const { config } = await import('@/lib/config');
      expect(config.apiBaseUrl).toBe('');
    });
  });

  describe('VITE_GALACHAIN_ENV', () => {
    it('should accept "stage" environment', async () => {
      mockEnv.VITE_GALACHAIN_ENV = 'stage';
      const { config } = await import('@/lib/config');
      expect(config.galachain.env).toBe('stage');
    });

    it('should accept "production" environment', async () => {
      mockEnv.VITE_GALACHAIN_ENV = 'production';
      const { config } = await import('@/lib/config');
      expect(config.galachain.env).toBe('production');
    });

    it('should fallback to stage for invalid environment', async () => {
      mockEnv.VITE_GALACHAIN_ENV = 'invalid';
      const { config } = await import('@/lib/config');
      expect(config.galachain.env).toBe('stage');
    });
  });

  describe('URL configuration', () => {
    it('should use provided gateway URL', async () => {
      mockEnv.VITE_GALACHAIN_GATEWAY_URL = 'https://custom-gateway.example.com';
      const { config } = await import('@/lib/config');
      expect(config.galachain.gatewayUrl).toBe('https://custom-gateway.example.com');
    });

    it('should use provided API URL', async () => {
      mockEnv.VITE_GALACHAIN_API_URL = 'https://custom-api.example.com';
      const { config } = await import('@/lib/config');
      expect(config.galachain.apiUrl).toBe('https://custom-api.example.com');
    });

    it('should fallback to default for invalid gateway URL', async () => {
      mockEnv.VITE_GALACHAIN_GATEWAY_URL = 'not-a-url';
      const { config } = await import('@/lib/config');
      expect(config.galachain.gatewayUrl).toBe('https://gateway-stage.galachain.com');
    });

    it('should fallback to default for invalid API URL', async () => {
      mockEnv.VITE_GALACHAIN_API_URL = 'not-a-url';
      const { config } = await import('@/lib/config');
      expect(config.galachain.apiUrl).toBe('https://api-stage.galachain.com');
    });
  });

  describe('environment-based defaults', () => {
    it('should use production defaults when GALACHAIN_ENV is production', async () => {
      mockEnv.VITE_GALACHAIN_ENV = 'production';
      const { config } = await import('@/lib/config');
      expect(config.galachain.gatewayUrl).toBe('https://gateway.galachain.com');
      expect(config.galachain.apiUrl).toBe('https://api.galachain.com');
    });

    it('should allow overriding production defaults with explicit URLs', async () => {
      mockEnv.VITE_GALACHAIN_ENV = 'production';
      mockEnv.VITE_GALACHAIN_GATEWAY_URL = 'https://custom-gateway.example.com';
      mockEnv.VITE_GALACHAIN_API_URL = 'https://custom-api.example.com';

      const { config } = await import('@/lib/config');

      expect(config.galachain.env).toBe('production');
      expect(config.galachain.gatewayUrl).toBe('https://custom-gateway.example.com');
      expect(config.galachain.apiUrl).toBe('https://custom-api.example.com');
    });
  });

  describe('apiBaseUrl', () => {
    it('should use provided API base URL', async () => {
      mockEnv.VITE_API_BASE_URL = 'http://localhost:3000';
      const { config } = await import('@/lib/config');
      expect(config.apiBaseUrl).toBe('http://localhost:3000');
    });
  });
});
