import React, { useState, useRef, useCallback } from 'react';
import { 
  PaperClipIcon, 
  XMarkIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  FilmIcon, 
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { messagingService, MessageAttachment } from '../../services/messagingService';
import { toast } from 'react-hot-toast';

interface FileSharingProps {
  conversationId: string;
  onFileUploaded?: (attachment: MessageAttachment) => void;
  onFileRemoved?: (attachmentId: string) => void;
  className?: string;
}

interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileSharing({ 
  conversationId, 
  onFileUploaded, 
  onFileRemoved,
  className = '' 
}: FileSharingProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds 10MB limit` };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} is not supported` };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      startFileUploads(validFiles);
    }
  };

  // Start file uploads
  const startFileUploads = async (files: File[]) => {
    files.forEach(file => {
      const fileId = `${file.name}-${Date.now()}`;
      
      // Add to progress tracking
      setUploadProgress(prev => [...prev, {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      // Upload file
      uploadFile(file, fileId);
    });
  };

  // Upload individual file
  const uploadFile = async (file: File, fileId: string) => {
    try {
      const attachment = await messagingService.uploadFile(file, conversationId);
      
      // Update progress to completed
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === fileId 
            ? { ...p, progress: 100, status: 'completed' }
            : p
        )
      );

      // Add to attachments list
      setAttachments(prev => [...prev, attachment]);
      
      // Remove from selected files
      setSelectedFiles(prev => prev.filter(f => f.name !== file.name));
      
      // Notify parent component
      onFileUploaded?.(attachment);
      
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Update progress to error
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === fileId 
            ? { ...p, status: 'error', error: 'Upload failed' }
            : p
        )
      );
      
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  // Remove file from selection
  const removeSelectedFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    
    // Remove from progress tracking
    setUploadProgress(prev => prev.filter(p => p.fileName !== fileName));
  };

  // Remove uploaded attachment
  const removeAttachment = async (attachmentId: string) => {
    try {
      // Note: This would require a backend endpoint to delete attachments
      // For now, we'll just remove from local state
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      onFileRemoved?.(attachmentId);
      toast.success('File removed');
    } catch (error) {
      toast.error('Failed to remove file');
      console.error('Error removing file:', error);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  // File type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <FilmIcon className="w-5 h-5" />;
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return <DocumentTextIcon className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <DocumentIcon className="w-5 h-5" />;
    return <DocumentTextIcon className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file preview
  const getFilePreview = (attachment: MessageAttachment) => {
    if (attachment.mimeType.startsWith('image/')) {
      return (
        <img 
          src={attachment.thumbnailUrl || attachment.url} 
          alt={attachment.originalName}
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    }
    
    return (
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        {getFileIcon(attachment.mimeType)}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <PaperClipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Support for images, videos, documents up to 10MB
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Choose Files
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploading Files
          </h4>
          
          {uploadProgress.map((progress) => (
            <div key={progress.fileId} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon('application/octet-stream')}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {progress.fileName}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {progress.status === 'uploading' && (
                    <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {progress.status === 'completed' && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  )}
                  {progress.status === 'error' && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                  )}
                  
                  {progress.status === 'uploading' && (
                    <button
                      onClick={() => removeSelectedFile(progress.fileName)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {progress.status === 'uploading' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              
              {progress.status === 'error' && (
                <p className="text-sm text-red-500">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSelectedFile(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Uploaded Files ({attachments.length})
            </h4>
            <button
              onClick={() => setShowFileManager(!showFileManager)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              {showFileManager ? 'Hide' : 'Manage Files'}
            </button>
          </div>
          
          {showFileManager && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    {getFilePreview(attachment)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.size)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </a>
                      <a
                        href={attachment.url}
                        download={attachment.originalName}
                        className="p-1 text-green-500 hover:text-green-700"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Type Support Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Supported File Types
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <PhotoIcon className="w-4 h-4" />
            <span>Images (JPEG, PNG, GIF, WebP)</span>
          </div>
          <div className="flex items-center space-x-2">
            <FilmIcon className="w-4 h-4" />
            <span>Videos (MP4, WebM, OGG)</span>
          </div>
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Documents (PDF, DOC, DOCX)</span>
          </div>
          <div className="flex items-center space-x-2">
            <DocumentIcon className="w-4 h-4" />
            <span>Spreadsheets (XLS, XLSX)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Maximum file size: 10MB per file
        </p>
      </div>
    </div>
  );
}
