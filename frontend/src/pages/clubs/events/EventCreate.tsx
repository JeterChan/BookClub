// frontend/src/pages/clubs/events/EventCreate.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { DateTimePicker, convertLocalToUTC } from '../../../components/ui/DateTimePicker';
import { createEvent, validateMeetingUrl, validateEventDatetime } from '../../../services/eventService';
import { useBookClubStore } from '../../../store/bookClubStore';

// 表單驗證 schema
const eventCreateSchema = z.object({
  title: z.string()
    .min(1, '請輸入活動名稱')
    .max(100, '活動名稱不能超過 100 個字元'),
  description: z.string()
    .min(1, '請輸入活動描述')
    .max(2000, '活動描述不能超過 2000 個字元'),
  eventDatetime: z.string()
    .min(1, '請選擇活動時間')
    .refine((val) => validateEventDatetime(convertLocalToUTC(val)), {
      message: '活動時間必須為未來時間',
    }),
  meetingUrl: z.string()
    .min(1, '請輸入會議連結')
    .max(500, '會議連結不能超過 500 個字元')
    .refine((val) => validateMeetingUrl(val), {
      message: '會議連結必須為有效的 HTTPS URL',
    }),
  maxParticipants: z.number()
    .optional()
    .refine((val) => val === undefined || val === 0 || val > 0, {
      message: '人數上限必須為 0（無限制）或大於 0',
    }),
});

type EventCreateForm = z.infer<typeof eventCreateSchema>;

export default function EventCreate() {
  const navigate = useNavigate();
  const { clubId } = useParams<{ clubId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { detailClub, fetchClubDetail } = useBookClubStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventCreateForm>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDatetime: '',
      meetingUrl: '',
      maxParticipants: 0,
    },
  });

  useEffect(() => {
    if (!clubId) {
      toast.error('找不到讀書會');
      navigate('/clubs');
      return;
    }
    
    // 獲取讀書會資訊以檢查權限
    fetchClubDetail(parseInt(clubId));
  }, [clubId, navigate, fetchClubDetail]);

  // 檢查權限
  useEffect(() => {
    if (detailClub && clubId && detailClub.id === parseInt(clubId)) {
      const isAdminOrOwner = detailClub.membership_status === 'owner' || detailClub.membership_status === 'admin';
      
      if (!isAdminOrOwner) {
        toast.error('只有讀書會管理員和創建者可以建立活動');
        navigate(`/clubs/${clubId}/events`);
      }
    }
  }, [detailClub, clubId, navigate]);

  const onSubmit = async (data: EventCreateForm) => {
    if (!clubId) return;

    setIsSubmitting(true);
    try {
      // 將本地時間轉換為 UTC
      const utcDatetime = convertLocalToUTC(data.eventDatetime);

      await createEvent(parseInt(clubId), {
        title: data.title.trim(),
        description: data.description.trim(),
        eventDatetime: utcDatetime,
        meetingUrl: data.meetingUrl.trim(),
        maxParticipants: data.maxParticipants || 0,
        status: 'published',
      });

      toast.success('活動已發布！所有成員將收到通知');

      // 導向活動列表頁面
      navigate(`/clubs/${clubId}/events`);
    } catch (error: any) {
      toast.error(error.message || '建立活動失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = handleSubmit(onSubmit);
  const handleCancel = () => {
    navigate(`/clubs/${clubId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Button
            onClick={() => navigate(`/clubs/${clubId}`)}
            variant="outline"
          >
            ← 返回讀書會
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">建立活動</h1>

          <form className="space-y-6">
            {/* 活動名稱 */}
            <Input
              label="活動名稱"
              placeholder="例如：週末讀書討論會"
              error={errors.title?.message}
              required
              {...register('title')}
            />

            {/* 活動描述 */}
            <Textarea
              label="活動描述"
              placeholder="請描述活動內容、討論主題、注意事項等..."
              rows={6}
              error={errors.description?.message}
              required
              {...register('description')}
            />

            {/* 活動時間 */}
            <DateTimePicker
              label="活動時間"
              error={errors.eventDatetime?.message}
              helperText="請選擇活動舉辦的日期和時間"
              disablePast
              required
              {...register('eventDatetime')}
            />

            {/* 會議連結 */}
            <Input
              label="會議連結"
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              error={errors.meetingUrl?.message}
              helperText="支援 Google Meet、Zoom、Teams 等平台"
              required
              {...register('meetingUrl')}
            />

            {/* 人數上限 */}
            <Input
              label="參與人數上限"
              type="number"
              min="0"
              placeholder="0 表示無人數限制"
              error={errors.maxParticipants?.message}
              helperText="預設為 0（無限制），填寫大於 0 的數字來限制人數"
              {...register('maxParticipants', { 
                valueAsNumber: true,
                setValueAs: (value) => value === '' || isNaN(value) ? 0 : value
              })}
            />

            {/* 操作按鈕 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              
              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '發布中...' : '發布活動'}
              </Button>
            </div>
          </form>

          {/* 提示訊息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 發布後，所有讀書會成員將收到活動通知</li>
              <li>• 活動時間必須為未來時間</li>
              <li>• 會議連結必須使用 HTTPS 協議以確保安全性</li>
              <li>• 人數上限設為 0 表示無人數限制</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
