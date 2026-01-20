/**
 * NestJS configuration factory
 * Loads and validates environment variables
 */

export type GalaChainEnv = 'production' | 'stage';

export interface AppConfiguration {
  port: number;
  galachain: {
    env: GalaChainEnv;
    gatewayUrl: string;
    apiUrl: string;
  };
}

const GALACHAIN_DEFAULTS: Record<GalaChainEnv, { gatewayUrl: string; apiUrl: string }> = {
  production: {
    gatewayUrl: 'https://gateway.galachain.com',
    apiUrl: 'https://api.galachain.com',
  },
  stage: {
    gatewayUrl: 'https://gateway-stage.galachain.com',
    apiUrl: 'https://api-stage.galachain.com',
  },
};

/**
 * Validates the GalaChain environment value
 */
function validateGalaChainEnv(value: string | undefined): GalaChainEnv {
  if (!value) {
    return 'stage'; // default to stage
  }
  const normalized = value.toLowerCase() as GalaChainEnv;
  if (normalized !== 'production' && normalized !== 'stage') {
    throw new Error(
      `Invalid GALACHAIN_ENV: "${value}". Must be "production" or "stage".`,
    );
  }
  return normalized;
}

/**
 * Validates a URL string
 */
function validateUrl(name: string, value: string | undefined, defaultValue: string): string {
  const url = value || defaultValue;
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`Invalid ${name}: "${value}" is not a valid URL.`);
  }
}

/**
 * Configuration factory function for NestJS ConfigModule
 */
export default function configuration(): AppConfiguration {
  const galachainEnv = validateGalaChainEnv(process.env.GALACHAIN_ENV);
  const defaults = GALACHAIN_DEFAULTS[galachainEnv];

  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT: "${process.env.PORT}". Must be a number between 1 and 65535.`,
    );
  }

  return {
    port,
    galachain: {
      env: galachainEnv,
      gatewayUrl: validateUrl(
        'GALACHAIN_GATEWAY_URL',
        process.env.GALACHAIN_GATEWAY_URL,
        defaults.gatewayUrl,
      ),
      apiUrl: validateUrl(
        'GALACHAIN_API_URL',
        process.env.GALACHAIN_API_URL,
        defaults.apiUrl,
      ),
    },
  };
}
