import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiCalendar,
  FiTrash2,
  FiChevronRight,
  FiActivity,
  FiHelpCircle,
  FiMinimize2,
  FiClock
} from 'react-icons/fi';
import { aiService, type ChatMessage, type DoctorSummary } from '../../services/ai.service';
import DoctorAvatar from '../common/DoctorAvatar';

interface MessageItem extends ChatMessage {
  id: string;
  timestamp: Date;
  suggestedDoctors?: DoctorSummary[] | null;
  quickSuggestions?: string[] | null;
}

export const AiChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load welcome message when widget first opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadWelcome();
    }
  }, [isOpen]);

  const loadWelcome = async () => {
    try {
      setIsLoading(true);
      const res = await aiService.getWelcome();
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: res.reply,
          timestamp: new Date(),
          quickSuggestions: res.quickSuggestions || [],
        },
      ]);
    } catch (err) {
      setMessages([
        {
          id: 'welcome-err',
          role: 'assistant',
          content:
            '👋 Xin chào! Tôi là **Trợ lý Y tế AI của YouMed**.\n\nTôi kết nối trực tiếp với cơ sở dữ liệu phòng khám để hỗ trợ bạn:\n• Tư vấn chuyên khoa theo triệu chứng bạn đang gặp phải.\n• Giới thiệu bác sĩ chuyên khoa & bảng giá khám bệnh niêm yết.\n• Hướng dẫn bạn đặt lịch khám trực tuyến nhanh chóng.\n\nBạn hãy mô tả triệu chứng hoặc đặt câu hỏi bất kỳ nhé!',
          timestamp: new Date(),
          quickSuggestions: [
            'Tôi bị đau dạ dày, ợ chua',
            'Tìm bác sĩ Tim mạch',
            'Bảng giá khám bệnh',
            'Giờ làm việc phòng khám',
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history: ChatMessage[] = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiService.chat(text, history);

      const botMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
        suggestedDoctors: res.suggestedDoctors,
        quickSuggestions: res.quickSuggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Xin lỗi bạn, hiện tại kết nối đến hệ thống máy chủ đang gián đoạn. Bạn có thể gọi trực tiếp tổng đài **1900 1234** để được nhân viên y tế hỗ trợ nhanh nhất nhé!',
        timestamp: new Date(),
        quickSuggestions: ['Thử hỏi lại', 'Bảng giá khám bệnh'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    loadWelcome();
  };

  // Helper to format basic markdown (bold, lists, headings)
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 mt-2.5 mb-1 text-sm flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Bullet list
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
        const clean = line.trim().replace(/^[•\-]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 text-xs text-slate-700 pl-1">
            <span className="text-emerald-500 font-bold">•</span>
            <span>{renderFormattedInline(clean)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Normal paragraph
      return (
        <p key={idx} className="my-1 text-xs text-slate-800 leading-relaxed">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str: string) => {
    // Basic bold format **bold**
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-600">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-100 text-slate-700 text-xs font-semibold cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => setIsOpen(true)}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Trợ lý Y tế AI YouMed</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnread(false);
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center cursor-pointer transition-all border-2 border-white/80"
          title="Mở trợ lý AI YouMed"
        >
          {isOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <>
              <FiMessageSquare className="w-6 h-6" />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></span>
              )}
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 px-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <FiActivity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                    Trợ lý Y tế AI YouMed
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">DB Live</span>
                  </h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
                    Sẵn sàng tư vấn triệu chứng & bác sĩ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                <button
                  onClick={handleClearChat}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  title="Xóa đoạn chat và bắt đầu lại"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  title="Thu nhỏ"
                >
                  <FiMinimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer Bar */}
            <div className="bg-emerald-50/80 border-b border-emerald-100/80 px-4 py-1.5 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
              <FiHelpCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Dữ liệu truy xuất thực tế từ danh mục Bác sĩ & Chuyên khoa YouMed.</span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div>{formatMarkdown(msg.content)}</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {/* Doctor Cards if suggested */}
                  {msg.suggestedDoctors && msg.suggestedDoctors.length > 0 && (
                    <div className="w-full mt-2 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                        Bác sĩ được đề xuất:
                      </span>
                      {msg.suggestedDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <DoctorAvatar
                                imageUrl={doc.imageUrl}
                                fullName={doc.fullName}
                                doctorId={doc.id}
                                size="sm"
                                className="w-10 h-10 rounded-xl shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-900 text-xs truncate">
                                  {doc.fullName}
                                </h5>
                                <p className="text-[11px] text-slate-500 truncate">
                                  Khoa {doc.specialtyName} •{' '}
                                  <strong className="text-emerald-700">
                                    {doc.consultationFee ? doc.consultationFee.toLocaleString('vi-VN') + ' ₫' : '200.000 ₫'}
                                  </strong>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setIsOpen(false);
                                const dateParam = doc.targetDate ? `&date=${doc.targetDate}` : '';
                                navigate(`/patient/booking?doctorId=${doc.id}${dateParam}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <FiCalendar className="w-3.5 h-3.5" /> Đặt lịch
                            </button>
                          </div>

                          {/* Available Time Slots Pills */}
                          {doc.availableSlots && doc.availableSlots.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <div className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                <FiClock className="w-3 h-3 text-emerald-600" />
                                <span>Giờ trống {doc.targetDate ? `(${doc.targetDate})` : ''}:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {doc.availableSlots.slice(0, 6).map((slot, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/80"
                                  >
                                    {slot}
                                  </span>
                                ))}
                                {doc.availableSlots.length > 6 && (
                                  <span className="text-[10px] text-slate-400 self-center font-medium">
                                    +{doc.availableSlots.length - 6} giờ nữa
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestions Chips */}
                  {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1">
                      {msg.quickSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium transition-all shadow-2xs hover:border-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{sug}</span>
                          <FiChevronRight className="w-3 h-3 text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Typing Loader */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs w-28 text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Đang tra cứu...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập triệu chứng, tên bác sĩ, giá khám..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-800 transition-all font-medium disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shadow-md transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AiChatWidget;
