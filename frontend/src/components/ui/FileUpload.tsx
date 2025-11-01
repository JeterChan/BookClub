import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from './Button';
import { getAvatarUrl } from '../../services/profileService';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  preview?: string | null;
  currentImage?: string | null;
  loading?: boolean;
}

/**
 * FileUpload - File upload component with preview
 * Supports file validation and image preview
 */
export const FileUpload = ({
  onFileSelect,
  accept = 'image/jpeg,image/png',
  maxSize = 2 * 1024 * 1024, // 2MB default
  preview,
  currentImage,
  loading = false,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError('僅支援 JPG 或 PNG 格式');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`檔案大小不可超過 ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Use preview if available (data URL), otherwise use full avatar URL
  const displayImage = preview || (currentImage ? getAvatarUrl(currentImage) : null);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />

      {displayImage && (
        <div className="mb-4">
          <img
            src={displayImage}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
        </div>
      )}

      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        variant="secondary"
      >
        {loading ? '上傳中...' : preview ? '更換檔案' : '選擇檔案'}
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}

      <p className="text-sm text-gray-500 mt-2">
        支援 JPG、PNG 格式，檔案大小不超過 {maxSize / (1024 * 1024)}MB
      </p>
    </div>
  );
};
