// frontend/src/components/clubs/ClubDangerZone.tsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ClubDangerZoneProps {
  onDeleteConfirm: () => Promise<void>;
}

export const ClubDangerZone = ({ onDeleteConfirm }: ClubDangerZoneProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = async () => {
    await onDeleteConfirm();
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="p-6 border border-red-300 rounded-lg bg-red-50">
        <h3 className="text-lg font-semibold text-red-800">危險區域</h3>
        <p className="text-red-600 mt-2 mb-4">刪除讀書會是永久性操作，無法復原。</p>
        <Button 
          variant="danger" 
          onClick={() => setIsModalOpen(true)} 
          className="border border-red-600 hover:bg-red-700 cursor-pointer"
        >
          刪除讀書會
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="確認刪除讀書會"
        message="你確定要永久刪除這個讀書會嗎？所有相關資料都將被移除，此操作無法復原。"
      />
    </>
  );
};
