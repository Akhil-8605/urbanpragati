import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [showInitialQuestions, setShowInitialQuestions] = useState(true);

    // Pre-coded FAQ questions and answers
    const faqs = [
        {
            id: 1,
            question: 'What is Urban Pragati?',
            answer: 'Urban Pragati is a unified digital platform for citizens to report civic issues, track resolutions, pay property taxes, and participate in city development initiatives.',
        },
        {
            id: 2,
            question: 'How does the complaint resolution flow work?',
            answer: 'Once submitted, your complaint is "Pending". The admin reviews and assigns it to a worker ("Assigned"). The worker submits a quotation, gets approved, and completes the work. The status then updates to "Resolved", and you can provide feedback!',
        },
        {
            id: 3,
            question: 'How do I report an issue?',
            answer: 'Log in to your Citizen Dashboard, select the relevant service (Water, Road, Electricity, Sanitation), and fill out the report form along with a photo and your location.',
        },
        {
            id: 4,
            question: 'How can I track the status of my complaint?',
            answer: 'Go to the "Recent Complaints" section on your dashboard. You can see real-time updates (Pending, Assigned, Resolved, or Rejected) and track progress.',
        },
        {
            id: 5,
            question: 'How do I earn Pragati Points?',
            answer: 'You earn points for being proactive! Get points for submitting complaints (+10), when they are verified by admin (+50) and resolved (+20), and for voting on developments or giving feedback.',
        },
        {
            id: 6,
            question: 'How do I become the Best Citizen?',
            answer: 'The Best Citizen leaderboard ranks users based on their Pragati Points. Report genuine issues and share feedback to climb the ranks and be recognized as Best Citizen of the Month!',
        },
        {
            id: 7,
            question: 'How do I pay my property tax?',
            answer: 'Navigate to the Property Tax section from your Citizen Dashboard. You can search for your property details and securely make your tax payment online.',
        },
        {
            id: 8,
            question: 'What is Development Voting?',
            answer: 'The municipal corporation proposes new developments. You can view these in your dashboard and vote "Interested" or "Not Interested", giving you a voice in city planning.',
        },
        {
            id: 9,
            question: 'Can I submit my own proposals?',
            answer: 'Yes! Citizens can submit their own development proposals. If approved by the administration, other citizens can vote on your proposal.',
        },
        {
            id: 10,
            question: 'What if my issue remains unresolved?',
            answer: 'If an issue persists after being marked resolved, you can submit an evaluation in the Feedback section. Our quality control team reviews all feedback.',
        },
    ];

    const handleQuestionClick = (question, answer) => {
        setMessages((prev) => [
            ...prev,
            {
                type: 'user',
                text: question,
                timestamp: new Date(),
            },
        ]);

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    type: 'bot',
                    text: answer,
                    timestamp: new Date(),
                },
            ]);
        }, 500);

        // Hide initial questions
        setShowInitialQuestions(false);
    };

    const handleNewChat = () => {
        setMessages([]);
        setShowInitialQuestions(true);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="chatbot-container">
            <button
                className="chatbot-toggle-btn"
                onClick={handleToggle}
                title="Chat with us"
                aria-label="Open chatbot"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="chatbot-modal">
                    <div className="chatbot-header">
                        <h3>Help Center</h3>
                        <button
                            className="close-btn"
                            onClick={handleToggle}
                            aria-label="Close chatbot"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="chatbot-welcome">
                                <p>👋 Hello! How can we help you today?</p>
                                <p className="chatbot-subtitle">
                                    Choose a question below or ask us anything
                                </p>
                            </div>
                        ) : (
                            <div className="messages-list">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
                                    >
                                        <div className="message-content">{msg.text}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {showInitialQuestions && (
                        <div className="chatbot-questions">
                            {faqs.map((faq) => (
                                <button
                                    key={faq.id}
                                    className="question-btn"
                                    onClick={() => handleQuestionClick(faq.question, faq.answer)}
                                >
                                    {faq.question}
                                </button>
                            ))}
                        </div>
                    )}

                    {messages.length > 0 && (
                        <div className="chatbot-footer">
                            <button className="new-chat-btn" onClick={handleNewChat}>
                                Start New Chat
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBot;
