import { Stack } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { getPosts } from "../api/posts";
import { isLoggedIn } from "../helpers/authHelper";
import FindUsers from "./FindUsers";
import Footer from "./Footer";
import Loading from "./Loading";
import PostCard from "./PostCard";
import TopPosts from "./TopPosts";
import Chatbox from "./ChatbotIcon";

const Sidebar = () => {
  return (
    <Stack spacing={2}>
      <TopPosts />
      <FindUsers />
      <Footer />
      <Chatbox />
    </Stack>
  );
};

export default Sidebar;
