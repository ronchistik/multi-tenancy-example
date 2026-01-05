/**
 * Theme Editor
 * Visual editor for page-level theme customization
 */

import React, { useState } from 'react';
import type { TenantConfig } from '../../api';

interface ThemeEditorProps {
  baseConfig: TenantConfig;
  currentConfig: TenantConfig;
  onChange: (config: TenantConfig) => void;
}

export function ThemeEditor({ baseConfig, currentConfig, onChange }: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'borders'>('colors');

  // const _updateConfig = (updates: Partial<TenantConfig>) => {
  //   onChange({ ...currentConfig, ...updates });
  // };

  const updatePrimaryColor = (color: string) => {
    onChange({
      ...currentConfig,
      uxHints: {
        ...currentConfig.uxHints,
        primaryColor: color,
      },
    });
  };

  const updateDesignTokens = (category: string, updates: any) => {
    onChange({
      ...currentConfig,
      uxHints: {
        ...currentConfig.uxHints,
        designTokens: {
          ...currentConfig.uxHints.designTokens,
          [category]: {
            ...((currentConfig.uxHints.designTokens as any)[category] || {}),
            ...updates,
          },
        },
      },
    });
  };

  const isOverridden = (category: string, key: string) => {
    const baseValue = (baseConfig.uxHints.designTokens as any)[category]?.[key];
    const currentValue = (currentConfig.uxHints.designTokens as any)[category]?.[key];
    return baseValue !== currentValue;
  };

  const resetValue = (category: string, key: string) => {
    const baseValue = (baseConfig.uxHints.designTokens as any)[category]?.[key];
    updateDesignTokens(category, { [key]: baseValue });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '16px',
      }}>
        {(['colors', 'typography', 'spacing', 'borders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === tab ? currentConfig.uxHints.primaryColor : '#f3f4f6',
              color: activeTab === tab ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'colors' && (
          <ColorsTab
            config={currentConfig}
            baseConfig={baseConfig}
            onChange={updateDesignTokens}
            onPrimaryColorChange={updatePrimaryColor}
            isOverridden={isOverridden}
            resetValue={resetValue}
          />
        )}
        {activeTab === 'typography' && (
          <TypographyTab
            config={currentConfig}
            baseConfig={baseConfig}
            onChange={updateDesignTokens}
            isOverridden={isOverridden}
            resetValue={resetValue}
          />
        )}
        {activeTab === 'spacing' && (
          <SpacingTab
            config={currentConfig}
            baseConfig={baseConfig}
            onChange={updateDesignTokens}
            isOverridden={isOverridden}
            resetValue={resetValue}
          />
        )}
        {activeTab === 'borders' && (
          <BordersTab
            config={currentConfig}
            baseConfig={baseConfig}
            onChange={updateDesignTokens}
            isOverridden={isOverridden}
            resetValue={resetValue}
          />
        )}
      </div>
    </div>
  );
}

// Colors Tab
function ColorsTab({ config, baseConfig, onChange, onPrimaryColorChange, isOverridden, resetValue }: any) {
  const colors = config.uxHints.designTokens.colors;

  const colorFields = [
    { key: 'background', label: 'Background' },
    { key: 'cardBackground', label: 'Card Background' },
    { key: 'textPrimary', label: 'Text Primary' },
    { key: 'textSecondary', label: 'Text Secondary' },
    { key: 'border', label: 'Border' },
    { key: 'inputBackground', label: 'Input Background' },
    { key: 'inputBorder', label: 'Input Border' },
    { key: 'error', label: 'Error' },
    { key: 'errorBackground', label: 'Error Background' },
    { key: 'success', label: 'Success' },
  ];

  return (
    <div>
      <ThemeField
        label="Primary Color"
        value={config.uxHints.primaryColor}
        onChange={onPrimaryColorChange}
        type="color"
        isOverridden={baseConfig.uxHints.primaryColor !== config.uxHints.primaryColor}
        onReset={() => onPrimaryColorChange(baseConfig.uxHints.primaryColor)}
      />
      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
      {colorFields.map(({ key, label }) => (
        <ThemeField
          key={key}
          label={label}
          value={colors[key]}
          onChange={(val) => onChange('colors', { [key]: val })}
          type="color"
          isOverridden={isOverridden('colors', key)}
          onReset={() => resetValue('colors', key)}
        />
      ))}
    </div>
  );
}

// Typography Tab
function TypographyTab({ config, baseConfig: _baseConfig, onChange, isOverridden, resetValue }: any) {
  const typo = config.uxHints.designTokens.typography;

  return (
    <div>
      <ThemeField
        label="Font Family"
        value={typo.fontFamily}
        onChange={(val) => onChange('typography', { fontFamily: val })}
        type="text"
        isOverridden={isOverridden('typography', 'fontFamily')}
        onReset={() => resetValue('typography', 'fontFamily')}
      />
      <ThemeField
        label="Heading Size"
        value={typo.headingSize}
        onChange={(val) => onChange('typography', { headingSize: val })}
        type="text"
        placeholder="e.g., 24px"
        isOverridden={isOverridden('typography', 'headingSize')}
        onReset={() => resetValue('typography', 'headingSize')}
      />
      <ThemeField
        label="Heading Weight"
        value={String(typo.headingWeight)}
        onChange={(val) => onChange('typography', { headingWeight: parseInt(val) })}
        type="number"
        isOverridden={isOverridden('typography', 'headingWeight')}
        onReset={() => resetValue('typography', 'headingWeight')}
      />
      <ThemeField
        label="Body Size"
        value={typo.bodySize}
        onChange={(val) => onChange('typography', { bodySize: val })}
        type="text"
        placeholder="e.g., 16px"
        isOverridden={isOverridden('typography', 'bodySize')}
        onReset={() => resetValue('typography', 'bodySize')}
      />
      <ThemeField
        label="Body Weight"
        value={String(typo.bodyWeight)}
        onChange={(val) => onChange('typography', { bodyWeight: parseInt(val) })}
        type="number"
        isOverridden={isOverridden('typography', 'bodyWeight')}
        onReset={() => resetValue('typography', 'bodyWeight')}
      />
      <ThemeField
        label="Button Size"
        value={typo.buttonSize}
        onChange={(val) => onChange('typography', { buttonSize: val })}
        type="text"
        placeholder="e.g., 14px"
        isOverridden={isOverridden('typography', 'buttonSize')}
        onReset={() => resetValue('typography', 'buttonSize')}
      />
      <ThemeField
        label="Button Weight"
        value={String(typo.buttonWeight)}
        onChange={(val) => onChange('typography', { buttonWeight: parseInt(val) })}
        type="number"
        isOverridden={isOverridden('typography', 'buttonWeight')}
        onReset={() => resetValue('typography', 'buttonWeight')}
      />
    </div>
  );
}

// Spacing Tab
function SpacingTab({ config, baseConfig: _baseConfig, onChange, isOverridden, resetValue }: any) {
  const spacing = config.uxHints.designTokens.spacing;

  const fields = [
    { key: 'cardPadding', label: 'Card Padding' },
    { key: 'cardGap', label: 'Card Gap' },
    { key: 'formPadding', label: 'Form Padding' },
    { key: 'formGap', label: 'Form Gap' },
    { key: 'inputPadding', label: 'Input Padding' },
    { key: 'buttonPadding', label: 'Button Padding' },
  ];

  return (
    <div>
      {fields.map(({ key, label }) => (
        <ThemeField
          key={key}
          label={label}
          value={spacing[key]}
          onChange={(val) => onChange('spacing', { [key]: val })}
          type="text"
          placeholder="e.g., 16px or 1rem"
          isOverridden={isOverridden('spacing', key)}
          onReset={() => resetValue('spacing', key)}
        />
      ))}
    </div>
  );
}

// Borders Tab
function BordersTab({ config, baseConfig: _baseConfig, onChange, isOverridden, resetValue }: any) {
  const borders = config.uxHints.designTokens.borders;

  const fields = [
    { key: 'cardRadius', label: 'Card Radius' },
    { key: 'inputRadius', label: 'Input Radius' },
    { key: 'buttonRadius', label: 'Button Radius' },
    { key: 'cardBorderWidth', label: 'Card Border Width' },
  ];

  return (
    <div>
      {fields.map(({ key, label }) => (
        <ThemeField
          key={key}
          label={label}
          value={borders[key]}
          onChange={(val) => onChange('borders', { [key]: val })}
          type="text"
          placeholder="e.g., 8px or 0.5rem"
          isOverridden={isOverridden('borders', key)}
          onReset={() => resetValue('borders', key)}
        />
      ))}
    </div>
  );
}

// Individual Theme Field
interface ThemeFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type: string;
  placeholder?: string;
  isOverridden: boolean;
  onReset: () => void;
}

function ThemeField({ label, value, onChange, type, placeholder, isOverridden, onReset }: ThemeFieldProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
          {label}
          {isOverridden && <span style={{ color: '#10b981', marginLeft: '4px' }}>●</span>}
        </label>
        {isOverridden && (
          <button
            onClick={onReset}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            Reset
          </button>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: type === 'color' ? '4px' : '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px',
          height: type === 'color' ? '40px' : 'auto',
        }}
      />
    </div>
  );
}

