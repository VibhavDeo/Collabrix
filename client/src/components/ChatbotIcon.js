// src/components/ChatbotIcon.js
import React, { useEffect, useState } from "react";
import { socket } from "../helpers/socketHelper"; // shared socket instance
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Collapse,
  ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// For rendering Markdown (optional)
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatbotIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  /**
   * 1) Set up socket listeners once (on mount).
   *    We do NOT automatically request chat history on connect.
   *    Instead, we’ll request it when the chat is opened (Approach A).
   */
  useEffect(() => {
    if (!socket) {
      console.warn("ChatbotIcon: socket is not initialized yet.");
      return;
    }

    // Listen for chat-history from server
    socket.on("chat-history", (chatMessages) => {
      console.log("Received chat history:", chatMessages);
      const formatted = chatMessages.map((m) => ({
        text: m.content,
        sender: m.role
      }));
      setMessages(formatted);
    });

    // Listen for chatbot responses
    socket.on("chatbot-response", (data) => {
      console.log("chatbot-response:", data);
      setThinking(false);
      setMessages((prev) => [...prev, { text: data.message, sender: data.user }]);
    });

    // Listen for errors
    socket.on("chatbot-error", (errMsg) => {
      console.error("chatbot-error:", errMsg);
      setThinking(false);
    });
    socket.on("chat-history-error", (errMsg) => {
      console.error("chat-history-error:", errMsg);
    });

    // Cleanup on unmount
    return () => {
      socket.off("chat-history");
      socket.off("chatbot-response");
      socket.off("chatbot-error");
      socket.off("chat-history-error");
    };
  }, []);

  /**
   * 2) Whenever `isOpen` becomes true, request chat history again.
   *    That way, if the user navigates away and comes back,
   *    the next time they open the chat, we fetch the updated conversation.
   */
  useEffect(() => {
    if (socket && isOpen) {
      console.log("ChatbotIcon: re-requesting chat history because chat is open now.");
      socket.emit("get-chat-history");
    }
  }, [isOpen, socket]);

  /**
   * 3) Send a message to the server
   */
  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket) return;

    // Immediately add the user's message to the UI
    setMessages((prev) => [...prev, { text: inputValue, sender: "user" }]);
    setThinking(true);

    // Emit to server
    socket.emit("chatbot-message", { message: inputValue });
    setInputValue("");
  };

  /**
   * 4) Render function that uses ReactMarkdown for "assistant" messages
   *    so you can see bullet points, bold text, etc. if the bot returns Markdown.
   */
  const renderMessageContent = (msg) => {
    if (msg.sender === "assistant") {
      // Render the bot's text as Markdown
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {msg.text}
        </ReactMarkdown>
      );
    } else {
      // For user messages, just show raw text
      return <ListItemText primary={msg.text} />;
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      {/* Button to open/close the chat */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          backgroundColor: "primary.main",
          "&:hover": { backgroundColor: "primary.dark" }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 1024 1024"
          fill="white"
        >
          <path d="..." />
        </svg>
      </IconButton>

      {/* Collapsible Chat */}
      <Collapse in={isOpen}>
        <Box
          sx={{
            // MAKE IT BIGGER HERE
            width: 600,       // <--- bigger width
            height: 700,      // <--- bigger height
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            mt: 1
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "divider"
            }}
          >
            <Typography variant="h6">Chatbot</Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <List sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {messages.map((msg, idx) => (
              <ListItem
                key={idx}
                sx={{
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.sender === "user" ? "primary.main" : "grey.300",
                    color: msg.sender === "user" ? "white" : "black",
                    p: 1.5,
                    borderRadius: 4,
                    maxWidth: "70%"
                  }}
                >
                  {renderMessageContent(msg)}
                </Box>
              </ListItem>
            ))}
            {thinking && (
              <ListItem sx={{ justifyContent: "flex-start" }}>
                <Box
                  sx={{
                    bgcolor: "grey.300",
                    color: "black",
                    p: 1.5,
                    borderRadius: 4,
                    maxWidth: "70%"
                  }}
                >
                  <ReactMarkdown>Thinking...</ReactMarkdown>
                </Box>
              </ListItem>
            )}
          </List>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !socket}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ChatbotIcon;
