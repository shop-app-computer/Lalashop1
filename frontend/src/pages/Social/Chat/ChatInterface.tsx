import React from "react";
import { MessageCircle } from "lucide-react";

export default function ChatInterface() {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-white border border-gray-border rounded-lg overflow-hidden max-w-6xl mx-auto my-4">
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center mb-4">
          <MessageCircle size={32} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-bold text-dark mb-2">Direct messaging coming soon</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          The chat backend is not yet implemented. Once the message and conversation models are
          added on the server, your direct messages with sellers and creators will live here.
        </p>
      </div>
    </div>
  );
}
