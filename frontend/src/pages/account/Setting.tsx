import { useState } from 'react';
import EditProfileModal from './modals/EditProfileModal';
import UploadAvatarModal from './modals/UploadAvatarModal';
import PreferenceModal from './modals/PreferenceModal';
import ChangeEmailModal from './modals/ChangeEmailModal';
import ChangePasswordModal from './modals/ChangePasswordModal';

export default function Setting() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const currentEmail = 'user@example.com';

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">個人資料</h2>
        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              U
            </div>
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>上傳照片</span>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">使用者名稱</h3>
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm font-medium"
              >
                編輯資料
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">加入日期：</span>
                <span className="text-gray-900 font-medium">2024年1月</span>
              </div>
              <div>
                <span className="text-gray-500">參加社團：</span>
                <span className="text-gray-900 font-medium">5 個</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">帳號設定</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">電子郵件</h3>
              <p className="text-sm text-gray-500">{currentEmail}</p>
            </div>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
            >
              修改
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">密碼</h3>
              <p className="text-sm text-gray-500">••••••••</p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
            >
              修改
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">偏好設定</h2>
          <button
            onClick={() => setIsPrefModalOpen(true)}
            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
          >
            編輯偏好
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">電子郵件通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">推送通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-md"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
      {isAvatarModalOpen && <UploadAvatarModal onClose={() => setIsAvatarModalOpen(false)} />}
      {isPrefModalOpen && <PreferenceModal onClose={() => setIsPrefModalOpen(false)} />}
      {isEmailModalOpen && <ChangeEmailModal onClose={() => setIsEmailModalOpen(false)} currentEmail={currentEmail} />}
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </div>
  );
}
