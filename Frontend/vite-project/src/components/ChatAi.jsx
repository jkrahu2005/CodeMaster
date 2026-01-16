import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, Copy, RefreshCw, AlertCircle } from 'lucide-react';

// Simple emoji icons for different message types
const BotIcon = ({ className }) => <span className={className}>🤖</span>;
const UserIcon = ({ className }) => <span className={className}>👤</span>;
const ThinkingIcon = ({ className }) => <span className={className}>💭</span>;
const CodeIcon = ({ className }) => <span className={className}>{"</>"}</span>;

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{text: "Hello! I'm your DSA (Data Structures and Algorithms) assistant. I can help you understand this problem, explain concepts, suggest approaches, and review your code. Ask me anything about this problem!"}],
            timestamp: new Date(),
            type: 'welcome'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "What's the optimal approach for this problem?",
        "Explain the time complexity of the solution",
        "How do I handle edge cases?",
        "Show me example code for this problem"
    ]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onSubmit = async (data) => {
        const userMessage = data.message.trim();
        if (!userMessage || isLoading) return;

        // Add user message
        const newUserMessage = { 
            role: 'user', 
            parts: [{text: userMessage}],
            timestamp: new Date(),
            type: 'question'
        };
        setMessages(prev => [...prev, newUserMessage]);
        reset(); // This clears the input field
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Prepare the messages for the API
            const apiMessages = messages.map(msg => ({
                role: msg.role,
                parts: msg.parts
            }));

            const response = await axiosClient.post("/ai/chat", {
                messages: apiMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode,
                difficulty: problem.difficulty,
                tags: problem.tags
            });

            // Simulate typing delay for better UX
            setTimeout(() => {
                setIsTyping(false);
                
                const botResponse = { 
                    role: 'model', 
                    parts: [{text: response.data.message}],
                    timestamp: new Date(),
                    type: 'answer'
                };
                
                setMessages(prev => [...prev, botResponse]);
                setIsLoading(false);
            }, 800);

        } catch (error) {
            console.error("API Error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: "Sorry, I encountered an error while processing your request. Please try again in a moment."}],
                timestamp: new Date(),
                type: 'error'
            }]);
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        reset({ message: question });
        inputRef.current?.focus();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    const clearChat = () => {
        setMessages([
            { 
                role: 'model', 
                parts: [{text: "Hello! I'm your DSA (Data Structures and Algorithms) assistant. I can help you understand this problem, explain concepts, suggest approaches, and review your code. Ask me anything about this problem!"}],
                timestamp: new Date(),
                type: 'welcome'
            }
        ]);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatMessageText = (text) => {
        // Simple markdown-like formatting
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('### ')) {
                return <h3 key={idx} className="text-lg font-bold text-base-content mt-4 mb-2">{line.substring(4)}</h3>;
            } else if (line.startsWith('## ')) {
                return <h2 key={idx} className="text-xl font-bold text-base-content mt-6 mb-3 border-b border-base-300 pb-2">{line.substring(3)}</h2>;
            } else if (line.startsWith('# ')) {
                return <h1 key={idx} className="text-2xl font-bold text-base-content mt-8 mb-4">{line.substring(2)}</h1>;
            } else if (line.startsWith('```') || line.includes('function') || line.includes('class') || line.includes('const ') || line.includes('let ') || line.includes('var ')) {
                return (
                    <pre key={idx} className="bg-base-300 p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono">
                        <code className="text-base-content">{line}</code>
                    </pre>
                );
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={idx} className="ml-4 list-disc text-base-content/80">{line.substring(2)}</li>;
            } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return <li key={idx} className="ml-4 list-decimal text-base-content/80">{line.substring(3)}</li>;
            } else {
                return <p key={idx} className="text-base-content/90 leading-relaxed my-2">{line}</p>;
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-base-100 rounded-xl overflow-hidden border border-base-300">
            {/* Chat Header */}
            <div className="bg-base-200 border-b border-base-300 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base-content">DSA Assistant</h3>
                            <div className="flex items-center gap-2 text-xs text-base-content/70">
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                    Online
                                </span>
                                <span>•</span>
                                <span>Specialized in Data Structures & Algorithms</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={clearChat}
                        className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content"
                        title="Clear chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Clear</span>
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary/20" : "bg-base-300"}`}>
                                {msg.role === "user" ? (
                                    <UserIcon className="w-5 h-5 text-primary" />
                                ) : (
                                    <BotIcon className="w-5 h-5 text-base-content" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex-1 ${msg.role === "user" ? "items-end" : ""}`}>
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-base-200 border border-base-300 rounded-tl-none"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold">
                                            {msg.role === "user" ? "You" : "DSA Assistant"}
                                        </span>
                                        <span className="text-xs opacity-70">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none">
                                        {msg.role === "user" ? (
                                            <p className="text-white leading-relaxed my-2">{msg.parts[0].text}</p>
                                        ) : (
                                            formatMessageText(msg.parts[0].text)
                                        )}
                                    </div>
                                    
                                    {/* Message Actions */}
                                    {msg.role === "model" && (
                                        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-base-300">
                                            <button 
                                                onClick={() => copyToClipboard(msg.parts[0].text)}
                                                className="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
                                                title="Copy to clipboard"
                                            >
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copy
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Typing Indicator for AI response */}
                                {index === messages.length - 1 && msg.role === "user" && isTyping && (
                                    <div className="mt-4 flex items-center gap-2 text-base-content/70">
                                        <ThinkingIcon className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm">DSA Assistant is thinking...</span>
                                        <div className="flex gap-1 ml-2">
                                            <div className="w-2 h-2 rounded-full bg-base-content/50 animate-bounce"></div>
                                            <div className="w-2 h-2 rounded-full bg-base-content/50 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-base-content/50 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Suggested Questions */}
                    {messages.length <= 1 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-base-content">Try asking:</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {suggestedQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuestion(question)}
                                        className="bg-base-200 hover:bg-base-300 border border-base-300 rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <span className="text-sm text-base-content/90">{question}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && !isTyping && (
                        <div className="flex justify-center py-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                                <p className="text-sm text-base-content/70">Processing your request...</p>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-base-300 bg-base-200 p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
                    <div className="flex flex-col gap-4">
                        {/* Character Limit Indicator */}
                        <div className="flex justify-between items-center text-xs text-base-content/70 px-1">
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Ask questions related to DSA and this problem only</span>
                            </div>
                            <span>{suggestedQuestions.length} suggested questions</span>
                        </div>

                        {/* Input with Buttons */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask about time complexity, algorithms, code review, or problem approach..."
                                    className="input input-bordered w-full pl-12 pr-24 bg-white border-primary/30 text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    {...register("message", { 
                                        required: "Message cannot be empty",
                                        minLength: {
                                            value: 3,
                                            message: "Message must be at least 3 characters"
                                        },
                                        maxLength: {
                                            value: 1000,
                                            message: "Message is too long (max 1000 characters)"
                                        }
                                    })}
                                    disabled={isLoading}
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <CodeIcon className="w-5 h-5 text-gray-500" />
                                </div>
                                {errors.message && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-error text-xs">
                                        {errors.message.message}
                                    </div>
                                )}
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading || isSubmitting}
                                className="btn btn-primary px-6 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-focus"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2 text-white">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-white">
                                        <Send className="w-4 h-4" />
                                        Send
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                type="button"
                                onClick={() => handleQuickQuestion("Explain the optimal approach for this problem")}
                                className="btn btn-xs bg-base-300 border-base-400 text-base-content hover:bg-base-400 hover:border-base-500"
                                disabled={isLoading}
                            >
                                Optimal Approach
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickQuestion("What's the time and space complexity?")}
                                className="btn btn-xs bg-base-300 border-base-400 text-base-content hover:bg-base-400 hover:border-base-500"
                                disabled={isLoading}
                            >
                                Complexity
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickQuestion("Show me example code for this problem")}
                                className="btn btn-xs bg-base-300 border-base-400 text-base-content hover:bg-base-400 hover:border-base-500"
                                disabled={isLoading}
                            >
                                Example Code
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickQuestion("What are the edge cases to consider?")}
                                className="btn btn-xs bg-base-300 border-base-400 text-base-content hover:bg-base-400 hover:border-base-500"
                                disabled={isLoading}
                            >
                                Edge Cases
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatAi;