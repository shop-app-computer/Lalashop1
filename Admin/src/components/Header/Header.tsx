import React from 'react';
import { Bell, Search, User, MessageSquare } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl w-96 border border-gray-100">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users, shops, orders..."
          className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-600 relative">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>

        <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-gray-600 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-10 w-[1px] bg-gray-100"></div>

        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-black group-hover:text-primary transition-colors">
              ADMIN ALEX
            </p>
            <p className="text-[10px] text-gray-400 font-medium">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-soft transition-all overflow-hidden border border-gray-100">
            <User className="h-6 w-6 text-gray-400 group-hover:text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
