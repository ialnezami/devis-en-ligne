import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SecuritySettingsProps {
  onSettingsChange: () => void;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords to prevent reuse
}

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator';
    backupCodes: string[];
  };
  sessionManagement: {
    maxSessions: number;
    sessionTimeout: number; // minutes
    forceLogoutOnPasswordChange: boolean;
  };
  loginSecurity: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    requireCaptcha: boolean;
    suspiciousActivityDetection: boolean;
  };
  dataProtection: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    dataRetentionDays: number;
    automaticBackup: boolean;
  };
}

export default function SecuritySettings({ onSettingsChange }: SecuritySettingsProps) {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    maxAge: 90,
    preventReuse: 5
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: {
      enabled: false,
      method: 'authenticator',
      backupCodes: []
    },
    sessionManagement: {
      maxSessions: 5,
      sessionTimeout: 480, // 8 hours
      forceLogoutOnPasswordChange: true
    },
    loginSecurity: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      requireCaptcha: true,
      suspiciousActivityDetection: true
    },
    dataProtection: {
      encryptionAtRest: true,
      encryptionInTransit: true,
      dataRetentionDays: 2555, // 7 years
      automaticBackup: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [testPassword, setTestPassword] = useState('');

  // Load security settings on component mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Settings are already initialized with defaults
      // In a real app, you would load these from the API
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordPolicyChange = (field: keyof PasswordPolicy, value: any) => {
    setPasswordPolicy(prev => ({ ...prev, [field]: value }));
    onSettingsChange();
  };

  const handleSecuritySettingsChange = (section: keyof SecuritySettings, field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    onSettingsChange();
  };

  const handleTwoFactorAuthChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFactorAuth: {
        ...prev.twoFactorAuth,
        [field]: value
      }
    }));
    onSettingsChange();
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    handleTwoFactorAuthChange('backupCodes', codes);
  };

  const calculatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= passwordPolicy.minLength) score += 1;
    else feedback.push(`Password must be at least ${passwordPolicy.minLength} characters long`);

    if (passwordPolicy.requireUppercase && /[A-Z]/.test(password)) score += 1;
    else if (passwordPolicy.requireUppercase) feedback.push('Password must contain at least one uppercase letter');

    if (passwordPolicy.requireLowercase && /[a-z]/.test(password)) score += 1;
    else if (passwordPolicy.requireLowercase) feedback.push('Password must contain at least one lowercase letter');

    if (passwordPolicy.requireNumbers && /\d/.test(password)) score += 1;
    else if (passwordPolicy.requireNumbers) feedback.push('Password must contain at least one number');

    if (passwordPolicy.requireSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else if (passwordPolicy.requireSpecialChars) feedback.push('Password must contain at least one special character');

    if (passwordPolicy.preventCommonPasswords && !['password', '123456', 'qwerty'].includes(password.toLowerCase())) score += 1;
    else if (passwordPolicy.preventCommonPasswords) feedback.push('Password cannot be a common password');

    return { score, feedback };
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 5) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score >= 5) return 'Strong';
    if (score >= 3) return 'Medium';
    return 'Weak';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading security settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Security Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure password policies, two-factor authentication, and security measures
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <KeyIcon className="h-4 w-4 inline mr-2" />
            Password Policy
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === '2fa'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Two-Factor Auth
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sessions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <LockClosedIcon className="h-4 w-4 inline mr-2" />
            Sessions & Login
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Data Protection
          </button>
        </nav>
      </div>

      {/* Password Policy Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Password Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Length
                </label>
                <input
                  type="number"
                  value={passwordPolicy.minLength}
                  onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                  min="6"
                  max="128"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Age (days)
                </label>
                <input
                  type="number"
                  value={passwordPolicy.maxAge}
                  onChange={(e) => handlePasswordPolicyChange('maxAge', parseInt(e.target.value))}
                  min="0"
                  max="3650"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireUppercase}
                  onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require uppercase letters (A-Z)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireLowercase}
                  onChange={(e) => handlePasswordPolicyChange('requireLowercase', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require lowercase letters (a-z)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireNumbers}
                  onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require numbers (0-9)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireSpecialChars}
                  onChange={(e) => handlePasswordPolicyChange('requireSpecialChars', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require special characters (!@#$%^&*)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={passwordPolicy.preventCommonPasswords}
                  onChange={(e) => handlePasswordPolicyChange('preventCommonPasswords', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Prevent common passwords</span>
              </label>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prevent Password Reuse (last N passwords)
              </label>
              <input
                type="number"
                value={passwordPolicy.preventReuse}
                onChange={(e) => handlePasswordPolicyChange('preventReuse', parseInt(e.target.value))}
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Password Strength Tester */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Password Strength Tester
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordStrength ? 'text' : 'password'}
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter a password to test"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordStrength(!showPasswordStrength)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswordStrength ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {testPassword && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password Strength:
                    </span>
                    <span className={`text-sm font-semibold ${getPasswordStrengthColor(calculatePasswordStrength(testPassword).score)}`}>
                      {getPasswordStrengthText(calculatePasswordStrength(testPassword).score)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        calculatePasswordStrength(testPassword).score >= 5 ? 'bg-green-500' :
                        calculatePasswordStrength(testPassword).score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(calculatePasswordStrength(testPassword).score / 6) * 100}%` }}
                    />
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements Met:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {calculatePasswordStrength(testPassword).feedback.map((feedback, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          <span>{feedback}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Tab */}
      {activeTab === '2fa' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Two-Factor Authentication
            </h3>
            
            <div className="space-y-6">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth.enabled}
                    onChange={(e) => handleTwoFactorAuthChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {securitySettings.twoFactorAuth.enabled && (
                <>
                  {/* 2FA Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Authentication Method
                    </label>
                    <select
                      value={securitySettings.twoFactorAuth.method}
                      onChange={(e) => handleTwoFactorAuthChange('method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="authenticator">Authenticator App (TOTP)</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  {/* Backup Codes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Backup Codes
                      </label>
                      <button
                        onClick={generateBackupCodes}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Generate New Codes
                      </button>
                    </div>
                    
                    {securitySettings.twoFactorAuth.backupCodes.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                        {securitySettings.twoFactorAuth.backupCodes.map((code, index) => (
                          <div key={index} className="text-sm font-mono text-center p-2 bg-white dark:bg-gray-800 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No backup codes generated yet. Click "Generate New Codes" to create them.
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Store these codes in a safe place. You can use them to access your account if you lose your 2FA device.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sessions & Login Security Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Session Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Active Sessions
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionManagement.maxSessions}
                  onChange={(e) => handleSecuritySettingsChange('sessionManagement', 'maxSessions', parseInt(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionManagement.sessionTimeout}
                  onChange={(e) => handleSecuritySettingsChange('sessionManagement', 'sessionTimeout', parseInt(e.target.value))}
                  min="15"
                  max="1440"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.sessionManagement.forceLogoutOnPasswordChange}
                  onChange={(e) => handleSecuritySettingsChange('sessionManagement', 'forceLogoutOnPasswordChange', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Force logout on all devices when password is changed
                </span>
              </label>
            </div>
          </div>

          {/* Login Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Login Security
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={securitySettings.loginSecurity.maxLoginAttempts}
                  onChange={(e) => handleSecuritySettingsChange('loginSecurity', 'maxLoginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.loginSecurity.lockoutDuration}
                  onChange={(e) => handleSecuritySettingsChange('loginSecurity', 'lockoutDuration', parseInt(e.target.value))}
                  min="5"
                  max="1440"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.loginSecurity.requireCaptcha}
                  onChange={(e) => handleSecuritySettingsChange('loginSecurity', 'requireCaptcha', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Require CAPTCHA after failed login attempts
                </span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.loginSecurity.suspiciousActivityDetection}
                  onChange={(e) => handleSecuritySettingsChange('loginSecurity', 'suspiciousActivityDetection', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Detect and alert on suspicious login activity
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Data Protection Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Data Protection & Privacy
            </h3>
            
            <div className="space-y-6">
              {/* Encryption Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Encryption
                </h4>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.dataProtection.encryptionAtRest}
                    onChange={(e) => handleSecuritySettingsChange('dataProtection', 'encryptionAtRest', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Encrypt data at rest (database and file storage)
                  </span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.dataProtection.encryptionInTransit}
                    onChange={(e) => handleSecuritySettingsChange('dataProtection', 'encryptionInTransit', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Encrypt data in transit (HTTPS/TLS)
                  </span>
                </label>
              </div>

              {/* Data Retention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  value={securitySettings.dataProtection.dataRetentionDays}
                  onChange={(e) => handleSecuritySettingsChange('dataProtection', 'dataRetentionDays', parseInt(e.target.value))}
                  min="30"
                  max="3650"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How long to keep user data before automatic deletion
                </p>
              </div>

              {/* Backup Settings */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.dataProtection.automaticBackup}
                    onChange={(e) => handleSecuritySettingsChange('dataProtection', 'automaticBackup', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable automatic data backup
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  Automatically backup data to secure cloud storage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
