interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: {
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
  };
  onConfirm: () => void;
}

export default function JoinClubModal({ isOpen, onClose, club, onConfirm }: JoinClubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {club.isPrivate ? '申請加入社團' : '加入社團'}
        </h2>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              {club.name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{club.name}</h3>
              {club.isPrivate && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  私密社團
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{club.description}</p>
        </div>

        {club.isPrivate && (
          <div className="bg-blue-50 p-3 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              這是一個私密社團，您的加入申請將會由管理員審核。
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            {club.isPrivate ? '送出申請' : '確認加入'}
          </button>
        </div>
      </div>
    </div>
  );
}
