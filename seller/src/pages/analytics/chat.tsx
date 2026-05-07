import React from "react";
import { MessageCircle } from "lucide-react";

const ChatAnalyticsPage: React.FC = () => (
  <div className="space-y-4 text-sm">
    <div>
      <h1 className="text-[16px] font-bold text-gray-900">Chat analytics</h1>
      <p className="text-[12px] text-gray-500 mt-0.5">
        Response time, conversation volume, and CSAT for buyer-seller messaging.
      </p>
    </div>
    <div className="rounded-lg bg-gray-50 px-6 py-12 text-center">
      <MessageCircle className="w-7 h-7 text-gray-300 mx-auto mb-3" />
      <h2 className="text-[13px] font-semibold text-gray-700">Coming soon</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">
        The Conversation/Message backend has not been implemented yet — once chat is live, this
        page will surface response-time, unread queue, and customer satisfaction metrics.
      </p>
    </div>
  </div>
);

export default ChatAnalyticsPage;
