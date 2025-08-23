import { VersioningOptions } from '@nestjs/common';

export const apiVersioningConfig: VersioningOptions = {
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'api',
};

export interface ApiVersionInfo {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  releaseDate: string;
  sunsetDate?: string;
  breakingChanges: string[];
  newFeatures: string[];
  improvements: string[];
  migrationGuide?: string;
}

export const apiVersions: Record<string, ApiVersionInfo> = {
  '1': {
    version: '1.0.0',
    status: 'current',
    releaseDate: '2024-01-15',
    breakingChanges: [],
    newFeatures: [
      'User authentication and authorization',
      'Quotation management system',
      'Client management',
      'Company management',
      'File management',
      'Notification services',
      'Analytics and reporting',
      'WebSocket support',
      'Multi-tenant architecture',
      'Role-based access control'
    ],
    improvements: [
      'RESTful API design',
      'Comprehensive error handling',
      'Rate limiting',
      'Request validation',
      'Response caching',
      'Audit logging',
      'Security headers',
      'CORS configuration'
    ]
  },
  '2': {
    version: '2.0.0',
    status: 'deprecated',
    releaseDate: '2024-06-15',
    sunsetDate: '2024-12-15',
    breakingChanges: [
      'Changed pagination response format',
      'Updated error response structure',
      'Modified file upload endpoints',
      'Changed WebSocket event names'
    ],
    newFeatures: [
      'GraphQL support',
      'Advanced filtering',
      'Bulk operations',
      'Real-time collaboration',
      'Advanced analytics',
      'Machine learning insights'
    ],
    improvements: [
      'Performance optimizations',
      'Enhanced security',
      'Better error messages',
      'Improved validation',
      'Enhanced caching'
    ],
    migrationGuide: 'https://docs.company.com/migration/v1-to-v2'
  }
};

export const getApiVersionInfo = (version: string): ApiVersionInfo | null => {
  return apiVersions[version] || null;
};

export const getCurrentVersion = (): ApiVersionInfo => {
  return apiVersions['1'];
};

export const getDeprecatedVersions = (): ApiVersionInfo[] => {
  return Object.values(apiVersions).filter(v => v.status === 'deprecated');
};

export const getSunsetVersions = (): ApiVersionInfo[] => {
  return Object.values(apiVersions).filter(v => v.status === 'sunset');
};

export const isVersionDeprecated = (version: string): boolean => {
  const versionInfo = getApiVersionInfo(version);
  return versionInfo?.status === 'deprecated';
};

export const isVersionSunset = (version: string): boolean => {
  const versionInfo = getApiVersionInfo(version);
  return versionInfo?.status === 'sunset';
};

export const getVersionDeprecationWarning = (version: string): string | null => {
  const versionInfo = getApiVersionInfo(version);
  if (!versionInfo || versionInfo.status === 'current') {
    return null;
  }

  if (versionInfo.status === 'deprecated') {
    return `⚠️ API version ${version} is deprecated and will be sunset on ${versionInfo.sunsetDate}. Please upgrade to the latest version.`;
  }

  if (versionInfo.status === 'sunset') {
    return `🚫 API version ${version} has been sunset and is no longer supported. Please upgrade to the latest version.`;
  }

  return null;
};

export const getVersionMigrationInfo = (version: string): string | null => {
  const versionInfo = getApiVersionInfo(version);
  if (!versionInfo?.migrationGuide) {
    return null;
  }

  return `📚 Migration guide available: ${versionInfo.migrationGuide}`;
};

export const getApiVersionHeader = (): string => {
  const currentVersion = getCurrentVersion();
  return `Online Quotation Tool API v${currentVersion.version}`;
};

export const getApiVersionResponse = (version: string) => {
  const versionInfo = getApiVersionInfo(version);
  if (!versionInfo) {
    return {
      error: 'Invalid API version',
      message: 'The requested API version does not exist',
      availableVersions: Object.keys(apiVersions),
      currentVersion: getCurrentVersion().version
    };
  }

  const response: any = {
    version: versionInfo.version,
    status: versionInfo.status,
    releaseDate: versionInfo.releaseDate,
    breakingChanges: versionInfo.breakingChanges,
    newFeatures: versionInfo.newFeatures,
    improvements: versionInfo.improvements
  };

  if (versionInfo.sunsetDate) {
    response.sunsetDate = versionInfo.sunsetDate;
  }

  if (versionInfo.migrationGuide) {
    response.migrationGuide = versionInfo.migrationGuide;
  }

  const deprecationWarning = getVersionDeprecationWarning(version);
  if (deprecationWarning) {
    response.warning = deprecationWarning;
  }

  return response;
};
