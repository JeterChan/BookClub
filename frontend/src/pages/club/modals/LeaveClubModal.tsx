interface LeaveClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  onConfirm: () => void;
}

export default function LeaveClubModal({ isOpen, onClose, clubName, onConfirm }: LeaveClubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">離開社團</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            確定要離開 <span className="font-semibold">{clubName}</span> 嗎？
          </p>
          <div className="bg-red-50 p-3 rounded-lg">
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-red-600"></span>
                <span>將無法查看社團內容和討論</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600"></span>
                <span>將失去社團成員身份</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600"></span>
                <span>需要重新申請才能再次加入</span>
              </li>
            </ul>
          </div>
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            確認離開
          </button>
        </div>
      </div>
    </div>
  );
}
