import { Card, Grid, Typography, Button } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import Copyright from "./Copyright";
import ChatIcon from '@mui/icons-material/Chat';
const Footer = () => {
  return (
    <Box pb={3}>
      <Card sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ChatIcon />}
            href=""
            target="_blank"
            rel="noopener"
          >
            Chat with AI bot
          </Button>
        </Box>
      </Card>
      <Copyright />
    </Box>
  );
};

export default Footer;
