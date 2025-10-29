import { useState, useRef } from 'react';

interface UploadAvatarModalProps {
  onClose: () => void;
}

export default function UploadAvatarModal({ onClose }: UploadAvatarModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    try {
      console.log('Upload avatar');
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">上傳頭像</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-brand-light"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-brand-light">
                U
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-light transition-colors"
          >
            選擇檔案
          </button>

          <div className="text-sm text-gray-500 text-center">
            <p>建議上傳 500x500 像素以上的圖片</p>
            <p>支援 JPG、PNG 格式，檔案大小不超過 5MB</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={!preview}
              className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上傳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
