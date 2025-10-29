import { useState } from 'react';

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  onConfirm: () => void;
}

export default function DeleteClubModal({ isOpen, onClose, clubName, onConfirm }: DeleteClubModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmText === clubName;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">刪除社團</h2>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 font-medium mb-2"> 警告：此操作無法復原</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li> 所有社團內容將被永久刪除</li>
              <li> 所有成員將被移除</li>
              <li> 所有討論和紀錄將消失</li>
            </ul>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            請輸入社團名稱 <span className="font-semibold px-2 py-0.5 bg-gray-100 rounded">{clubName}</span> 以確認刪除：
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="輸入社團名稱"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}
