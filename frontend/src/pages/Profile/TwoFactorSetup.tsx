import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TwoFactorSetupProps {}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  
  // 2FA Setup state
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // Verification state
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 2FA Status
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);

  useEffect(() => {
    if (twoFactorEnabled) {
      setStep('complete');
      // TODO: Fetch remaining backup codes count
      setRemainingBackupCodes(8); // Mock data
    }
  }, [twoFactorEnabled]);

  const handleGenerate2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // const response = await generate2FASecret().unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...', // Mock QR code
        backupCodes: ['ABC12345', 'DEF67890', 'GHI11111', 'JKL22222', 'MNO33333', 'PQR44444', 'STU55555', 'VWX66666', 'YZA77777', 'BCD88888'],
        message: 'Scan the QR code with your authenticator app and verify with the 6-digit code'
      };
      
      setSecret(mockResponse.secret);
      setQrCode(mockResponse.qrCode);
      setBackupCodes(mockResponse.backupCodes);
      setStep('verify');
    } catch (err) {
      setError('Failed to generate 2FA secret. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await enable2FA({ code: verificationCode }).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification success
      setTwoFactorEnabled(true);
      setStep('complete');
      setIsSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter your current 2FA code to disable');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await disable2FA({ code: verificationCode }).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock disable success
      setTwoFactorEnabled(false);
      setStep('setup');
      setVerificationCode('');
      setQrCode('');
      setSecret('');
      setBackupCodes([]);
      setIsSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter your current 2FA code to regenerate backup codes');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // const response = await regenerateBackupCodes({ code: verificationCode }).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        backupCodes: ['XYZ98765', 'WVU43210', 'TSR55555', 'QPO66666', 'NML77777', 'KJI88888', 'HGF99999', 'EDC00000', 'BAZ11111', 'YXC22222'],
        message: 'Backup codes have been regenerated successfully'
      };
      
      setBackupCodes(mockResponse.backupCodes);
      setRemainingBackupCodes(10);
      setVerificationCode('');
      setIsSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupCodeVerification = async () => {
    if (!verificationCode || verificationCode.length !== 8) {
      setError('Please enter a valid 8-character backup code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // await verifyBackupCode({ code: verificationCode }).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification success
      setTwoFactorEnabled(true);
      setStep('complete');
      setIsSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError('Invalid backup code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderSetupStep = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
      <p className="text-sm text-gray-600 mb-6">
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>
      <button
        onClick={handleGenerate2FA}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Enable 2FA'
        )}
      </button>
    </div>
  );

  const renderVerifyStep = () => (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Your Authenticator App</h3>
        <p className="text-sm text-gray-600">
          Scan the QR code with your authenticator app and enter the 6-digit code below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Code */}
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
            {qrCode ? (
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">QR Code</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Scan with Google Authenticator, Authy, or similar app
          </p>
        </div>

        {/* Verification Form */}
        <div>
          <div className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerify2FA}
              disabled={!verificationCode || verificationCode.length !== 6 || isVerifying}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify and Enable 2FA'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('setup')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to setup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Codes */}
      {backupCodes.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Backup Codes Generated</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="bg-white p-3 rounded border border-yellow-300">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div>
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication Enabled</h3>
        <p className="text-sm text-gray-600">
          Your account is now protected with two-factor authentication.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              2FA is currently enabled for your account
            </span>
          </div>
        </div>

        {/* Backup Codes Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">Backup Codes</h4>
              <p className="text-sm text-blue-700">
                You have {remainingBackupCodes} backup codes remaining
              </p>
            </div>
            <button
              onClick={() => setVerificationCode('')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Manage 2FA</h4>
          
          {/* Regenerate Backup Codes */}
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Regenerate Backup Codes</h5>
                <p className="text-sm text-gray-500">
                  Generate new backup codes (current codes will be invalidated)
                </p>
              </div>
              <button
                onClick={() => setVerificationCode('')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Disable 2FA */}
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Disable 2FA</h5>
                <p className="text-sm text-gray-500">
                  Remove two-factor authentication from your account
                </p>
              </div>
              <button
                onClick={() => setVerificationCode('')}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Disable
              </button>
            </div>
          </div>
        </div>

        {/* Verification for Actions */}
        {verificationCode && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Verify Your Identity</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="actionVerificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your 2FA code
                </label>
                <input
                  type="text"
                  id="actionVerificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={!verificationCode || verificationCode.length !== 6 || isVerifying}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Regenerate Codes
                </button>
                
                <button
                  onClick={handleDisable2FA}
                  disabled={!verificationCode || verificationCode.length !== 6 || isVerifying}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-600 mt-1">
          Secure your account with an additional layer of protection
        </p>
      </div>

      {isSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Two-factor authentication has been enabled successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'complete' && renderCompleteStep()}
      </div>

      {/* Help Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification in addition to your password.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Download an authenticator app like Google Authenticator or Authy</li>
                <li>Scan the QR code with your app</li>
                <li>Enter the 6-digit code generated by the app</li>
                <li>Save your backup codes in a secure location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
