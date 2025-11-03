import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, joinEvent, leaveEvent, isEventPast } from '../../../services/eventService';
import type { EventDetail as EventDetailType } from '../../../services/eventService';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const EventDetail: React.FC = () => {
  const { clubId, eventId } = useParams<{ clubId: string; eventId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [event, setEvent] = useState<EventDetailType | null>(null);

  useEffect(() => {
    loadEventDetail();
  }, [clubId, eventId]);

  const loadEventDetail = async () => {
    if (!clubId || !eventId) return;

    try {
      setLoading(true);
      const data = await getEventDetail(Number(clubId), Number(eventId));
      setEvent(data);
    } catch (error: any) {
      toast.error(error.message || '載入活動詳情失敗');
      // 如果活動不存在，返回活動列表
      navigate(`/clubs/${clubId}/events`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!clubId || !eventId || !event) return;

    try {
      setActionLoading(true);
      const updatedEvent = await joinEvent(Number(clubId), Number(eventId));
      setEvent(updatedEvent);
      toast.success('成功加入活動！');
    } catch (error: any) {
      toast.error(error.message || '加入活動失敗');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!clubId || !eventId || !event) return;

    try {
      setActionLoading(true);
      const updatedEvent = await leaveEvent(Number(clubId), Number(eventId));
      setEvent(updatedEvent);
      toast.success('已退出活動');
    } catch (error: any) {
      toast.error(error.message || '退出活動失敗');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/clubs/${clubId}/events`);
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

  if (!event) {
    return null;
  }

  const isPast = isEventPast(event.eventDatetime);
  const isFull = event.maxParticipants !== null && event.currentParticipants >= event.maxParticipants;
  const canJoin = !event.isOrganizer && !event.isParticipating && !isPast && !isFull && event.status === 'published';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
          >
            ← 返回活動列表
          </Button>
        </div>

        {/* 活動詳情卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 活動狀態標籤 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              {isPast && (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                  已結束
                </span>
              )}
              {!isPast && event.status === 'published' && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  報名中
                </span>
              )}
              {event.status === 'draft' && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                  草稿
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* 活動時間 */}
            <div className="mb-6 flex items-start">
              <svg className="w-6 h-6 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">活動時間</h2>
                <p className="text-lg text-gray-900">
                  {format(new Date(event.eventDatetime), 'yyyy年M月d日 HH:mm', { locale: zhTW })}
                </p>
              </div>
            </div>

            {/* 發起人資訊 */}
            <div className="mb-6 flex items-start">
              <svg className="w-6 h-6 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">發起人</h2>
                <div className="flex items-center">
                  <span className="text-gray-900">{event.organizer.displayName}</span>
                  {event.isOrganizer && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      主辦人
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 參與人數 */}
            <div className="mb-6 flex items-start">
              <svg className="w-6 h-6 text-indigo-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">參與人數</h2>
                <p className="text-lg text-gray-900">
                  {event.currentParticipants}
                  {event.maxParticipants !== null && ` / ${event.maxParticipants}`}
                  {isFull && <span className="ml-2 text-sm text-red-600">（已額滿）</span>}
                </p>
              </div>
            </div>

            {/* 活動描述 */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">活動描述</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {event.description}
              </div>
            </div>

            {/* 會議連結（僅參與者可見） */}
            {(event.isOrganizer || event.isParticipating) && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-sm font-medium text-blue-900 mb-2">會議連結</h2>
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {event.meetingUrl}
                </a>
              </div>
            )}

            {/* 加入活動按鈕 */}
            {canJoin && (
              <div className="mt-6">
                <button
                  onClick={handleJoinEvent}
                  disabled={actionLoading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      處理中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      加入活動
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 已參與提示 + 退出按鈕 */}
            {event.isParticipating && !event.isOrganizer && !isPast && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 font-medium">您已參與此活動</p>
                </div>
                <button
                  onClick={handleLeaveEvent}
                  disabled={actionLoading}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      處理中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      退出活動
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 已參與但活動已結束的提示 */}
            {event.isParticipating && !event.isOrganizer && isPast && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 font-medium">您已參與此活動（活動已結束）</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
