import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Camera } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

const AIChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "Thank you for your message! I'm here to help with any questions about our products, orders, or general inquiries. What would you like to know?",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCameraClick = () => {
    // Navigate to camera page - you can replace this with your actual navigation logic
    window.location.href = "/camera"; // or use React Router navigation
  };

  return (
    <>
      {/* Floating Camera Button - Smaller on mobile */}
      <div className="fixed bottom-16 [@media(min-width:761px)]:bottom-20 right-4 [@media(min-width:761px)]:right-6 z-40 mb-2 [@media(min-width:761px)]:mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCameraClick}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 [@media(min-width:761px)]:p-4 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Open Camera"
            >
              <Camera size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Scan Product</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Floating Chat Button - Smaller on mobile */}
      <div className="fixed bottom-4 [@media(min-width:761px)]:bottom-6 right-4 [@media(min-width:761px)]:right-6 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-[#39FC1D] hover:bg-[#2dd817] text-white rounded-full p-2 [@media(min-width:761px)]:p-4 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
              aria-label="Open AI Chat"
            >
              {isOpen ? 
                <X size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" /> : 
                <MessageCircle size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOpen ? "Close AI Chat" : "Open AI Chat"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Chat Window - Adjusted position for mobile */}
      {isOpen && (
        <div className="fixed bottom-16 [@media(min-width:761px)]:bottom-24 right-2 [@media(min-width:761px)]:right-6 z-40 w-[calc(100%-16px)] [@media(min-width:761px)]:w-80 max-w-[320px] h-80 [@media(min-width:761px)]:h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-green-500 text-white p-3 [@media(min-width:761px)]:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 [@media(min-width:761px)]:w-8 [@media(min-width:761px)]:h-8 bg-white rounded-full flex items-center justify-center">
                <Bot size={14} className="[@media(min-width:761px)]:text-base text-[#39FC1D]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm [@media(min-width:761px)]:text-base">AI Assistant</h3>
                <p className="text-[10px] [@media(min-width:761px)]:text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-500 hover:bg-opacity-20 rounded-full p-1 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 [@media(min-width:761px)]:p-4 space-y-2 [@media(min-width:761px)]:space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-2 [@media(min-width:761px)]:p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-[#39FC1D] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs [@media(min-width:761px)]:text-sm">{message.text}</p>
                  <p
                    className={`text-[10px] [@media(min-width:761px)]:text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-white opacity-70"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-2 [@media(min-width:761px)]:p-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 [@media(min-width:761px)]:w-2 h-1.5 [@media(min-width:761px)]:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 [@media(min-width:761px)]:w-2 h-1.5 [@media(min-width:761px)]:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 [@media(min-width:761px)]:w-2 h-1.5 [@media(min-width:761px)]:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 [@media(min-width:761px)]:p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-2 [@media(min-width:761px)]:px-3 py-1.5 [@media(min-width:761px)]:py-2 text-xs [@media(min-width:761px)]:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FC1D] focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-[#39FC1D] hover:bg-[#2dd817] disabled:bg-gray-300 text-white p-1.5 [@media(min-width:761px)]:p-2 rounded-lg transition-colors"
              >
                <Send size={16} className="w-3 h-3 [@media(min-width:761px)]:w-4 [@media(min-width:761px)]:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBox;
