import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, updateEvent, validateMeetingUrl, validateEventDatetime, isEventPast } from '../../../services/eventService';
import type { EventUpdateRequest } from '../../../services/eventService';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const EventEdit: React.FC = () => {
  const { clubId, eventId } = useParams<{ clubId: string; eventId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 表單狀態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDatetime, setEventDatetime] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [hasMaxParticipants, setHasMaxParticipants] = useState(false);
  
  // 驗證錯誤狀態
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEventData();
  }, [clubId, eventId]);

  const loadEventData = async () => {
    if (!clubId || !eventId) return;

    try {
      setLoading(true);
      const data = await getEventDetail(Number(clubId), Number(eventId));
      
      // 如果活動已經開始，不允許編輯
      if (isEventPast(data.eventDatetime)) {
        toast.error('活動已開始或結束，無法編輯');
        navigate(`/clubs/${clubId}/events/${eventId}`);
        return;
      }
      
      // 設定表單初始值
      setTitle(data.title);
      setDescription(data.description);
      
      // 轉換日期時間格式為 datetime-local input 所需的格式
      const eventDate = new Date(data.eventDatetime);
      const localDatetime = format(eventDate, "yyyy-MM-dd'T'HH:mm");
      setEventDatetime(localDatetime);
      
      setMeetingUrl(data.meetingUrl);
      
      if (data.maxParticipants !== null && data.maxParticipants !== 0) {
        setHasMaxParticipants(true);
        setMaxParticipants(data.maxParticipants);
      }
    } catch (error: any) {
      toast.error(error.message || '載入活動資料失敗');
      navigate(`/clubs/${clubId}/events`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 驗證標題
    if (!title.trim()) {
      newErrors.title = '請輸入活動名稱';
    } else if (title.length > 100) {
      newErrors.title = '活動名稱不能超過 100 個字元';
    }

    // 驗證描述
    if (!description.trim()) {
      newErrors.description = '請輸入活動描述';
    } else if (description.length > 2000) {
      newErrors.description = '活動描述不能超過 2000 個字元';
    }

    // 驗證活動時間
    if (!eventDatetime) {
      newErrors.eventDatetime = '請選擇活動時間';
    } else {
      const datetimeISO = new Date(eventDatetime).toISOString();
      if (!validateEventDatetime(datetimeISO)) {
        newErrors.eventDatetime = '活動時間必須為未來時間';
      }
    }

    // 驗證會議連結
    if (!meetingUrl.trim()) {
      newErrors.meetingUrl = '請輸入會議連結';
    } else if (!validateMeetingUrl(meetingUrl)) {
      newErrors.meetingUrl = '請輸入有效的 HTTPS 連結';
    }

    // 驗證人數上限
    if (hasMaxParticipants) {
      if (!maxParticipants || maxParticipants <= 0) {
        newErrors.maxParticipants = '人數上限必須大於 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('請檢查表單內容');
      return;
    }

    if (!clubId || !eventId) return;

    try {
      setSubmitting(true);

      // 轉換為 ISO 8601 格式
      const datetimeISO = new Date(eventDatetime).toISOString();

      const data: EventUpdateRequest = {
        title: title.trim(),
        description: description.trim(),
        eventDatetime: datetimeISO,
        meetingUrl: meetingUrl.trim(),
        maxParticipants: hasMaxParticipants ? Number(maxParticipants) : null
      };

      await updateEvent(Number(clubId), Number(eventId), data);
      
      toast.success('活動更新成功！');
      navigate(`/clubs/${clubId}/events/${eventId}`);
    } catch (error: any) {
      toast.error(error.message || '更新活動失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clubs/${clubId}/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">編輯活動</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 活動名稱 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                活動名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例如：《活著》讀書心得分享會"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* 活動描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                活動描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="請描述活動的主題、流程、討論重點等..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {description.length} / 2000 字元
              </p>
            </div>

            {/* 活動時間 */}
            <div>
              <label htmlFor="eventDatetime" className="block text-sm font-medium text-gray-700 mb-2">
                活動時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="eventDatetime"
                value={eventDatetime}
                onChange={(e) => setEventDatetime(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.eventDatetime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.eventDatetime && (
                <p className="mt-1 text-sm text-red-600">{errors.eventDatetime}</p>
              )}
            </div>

            {/* 會議連結 */}
            <div>
              <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                會議連結 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="meetingUrl"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.meetingUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
              {errors.meetingUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.meetingUrl}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                支援 Google Meet、Zoom、Microsoft Teams 等線上會議平台
              </p>
            </div>

            {/* 人數上限 */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="hasMaxParticipants"
                  checked={hasMaxParticipants}
                  onChange={(e) => {
                    setHasMaxParticipants(e.target.checked);
                    if (!e.target.checked) {
                      setMaxParticipants('');
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="hasMaxParticipants" className="ml-2 block text-sm font-medium text-gray-700">
                  設定人數上限
                </label>
              </div>
              
              {hasMaxParticipants && (
                <>
                  <input
                    type="number"
                    id="maxParticipants"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：20"
                  />
                  {errors.maxParticipants && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>
                  )}
                </>
              )}
            </div>

            {/* 按鈕組 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? '更新中...' : '更新活動'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
