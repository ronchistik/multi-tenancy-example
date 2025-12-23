/**
 * Theme utilities
 * Merge theme overrides with tenant config
 */

import type { TenantConfig, ThemeOverrides } from '../api';

/**
 * Apply theme overrides to tenant config
 * Creates a new config object with overrides applied
 */
export function applyThemeOverrides(
  baseConfig: TenantConfig,
  overrides?: ThemeOverrides
): TenantConfig {
  if (!overrides) return baseConfig;

  const config = { ...baseConfig };
  
  // Apply primary color override
  if (overrides.primaryColor) {
    config.uxHints = {
      ...config.uxHints,
      primaryColor: overrides.primaryColor,
    };
  }

  // Apply design token overrides
  if (overrides.colors || overrides.typography || overrides.spacing || overrides.borders || overrides.shadows) {
    config.uxHints = {
      ...config.uxHints,
      designTokens: {
        colors: {
          ...config.uxHints.designTokens.colors,
          ...(overrides.colors || {}),
        },
        typography: {
          ...config.uxHints.designTokens.typography,
          ...(overrides.typography || {}),
        },
        spacing: {
          ...config.uxHints.designTokens.spacing,
          ...(overrides.spacing || {}),
        },
        borders: {
          ...config.uxHints.designTokens.borders,
          ...(overrides.borders || {}),
        },
        shadows: {
          ...config.uxHints.designTokens.shadows,
          ...(overrides.shadows || {}),
        },
      },
    };
  }

  return config;
}

/**
 * Extract theme overrides from a modified config
 * Compares with base config and extracts only the differences
 */
export function extractThemeOverrides(
  baseConfig: TenantConfig,
  modifiedConfig: TenantConfig
): ThemeOverrides {
  const overrides: ThemeOverrides = {};

  // Check primary color
  if (baseConfig.uxHints.primaryColor !== modifiedConfig.uxHints.primaryColor) {
    overrides.primaryColor = modifiedConfig.uxHints.primaryColor;
  }

  // Check design tokens
  const baseTokens = baseConfig.uxHints.designTokens;
  const modTokens = modifiedConfig.uxHints.designTokens;

  // Colors
  const colorOverrides: any = {};
  Object.keys(baseTokens.colors).forEach((key) => {
    if ((baseTokens.colors as any)[key] !== (modTokens.colors as any)[key]) {
      colorOverrides[key] = (modTokens.colors as any)[key];
    }
  });
  if (Object.keys(colorOverrides).length > 0) {
    overrides.colors = colorOverrides;
  }

  // Typography
  const typoOverrides: any = {};
  Object.keys(baseTokens.typography).forEach((key) => {
    if ((baseTokens.typography as any)[key] !== (modTokens.typography as any)[key]) {
      typoOverrides[key] = (modTokens.typography as any)[key];
    }
  });
  if (Object.keys(typoOverrides).length > 0) {
    overrides.typography = typoOverrides;
  }

  // Spacing
  const spacingOverrides: any = {};
  Object.keys(baseTokens.spacing).forEach((key) => {
    if ((baseTokens.spacing as any)[key] !== (modTokens.spacing as any)[key]) {
      spacingOverrides[key] = (modTokens.spacing as any)[key];
    }
  });
  if (Object.keys(spacingOverrides).length > 0) {
    overrides.spacing = spacingOverrides;
  }

  // Borders
  const borderOverrides: any = {};
  Object.keys(baseTokens.borders).forEach((key) => {
    if ((baseTokens.borders as any)[key] !== (modTokens.borders as any)[key]) {
      borderOverrides[key] = (modTokens.borders as any)[key];
    }
  });
  if (Object.keys(borderOverrides).length > 0) {
    overrides.borders = borderOverrides;
  }

  // Shadows
  const shadowOverrides: any = {};
  Object.keys(baseTokens.shadows).forEach((key) => {
    if ((baseTokens.shadows as any)[key] !== (modTokens.shadows as any)[key]) {
      shadowOverrides[key] = (modTokens.shadows as any)[key];
    }
  });
  if (Object.keys(shadowOverrides).length > 0) {
    overrides.shadows = shadowOverrides;
  }

  return overrides;
}

