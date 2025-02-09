// Chatbox.js
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    setMessages((prev) => [...prev, { text: inputValue, sender: "user" }]);
    setInputValue("");
  };

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      {/* Chat Icon */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          backgroundColor: "primary.main",
          "&:hover": { backgroundColor: "primary.dark" },
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 1024 1024"
          fill="white"
        >
          <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z" />
        </svg>
      </IconButton>

      {/* Chat Box */}
      <Collapse in={isOpen}>
        <Box
          sx={{
            width: 350,
            height: 500,
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            mt: 1,
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
              borderColor: "divider",
            }}
          >
            <Typography variant="h6">Chat Support</Typography>
            <IconButton onClick={() => setIsOpen(false)}>
               <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <List sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    p: 1.5,
                    borderRadius: 4,
                    maxWidth: "70%",
                  }}
                >
                  <ListItemText primary={message.text} />
                </Box>
              </ListItem>
            ))}
          </List>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
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

export default Chatbox;
