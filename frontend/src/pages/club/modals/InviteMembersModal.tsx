interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
}

export default function InviteMembersModal({ isOpen, onClose, clubName }: InviteMembersModalProps) {
  if (!isOpen) return null;

  const inviteLink = `https://bookclub.com/clubs/invite/abc123`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">邀請成員</h2>

        <p className="text-sm text-gray-600 mb-6">
          邀請朋友加入 <span className="font-semibold">{clubName}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邀請連結</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                複製
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
