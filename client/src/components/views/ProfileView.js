import { Card, Container, Stack, Tab, Tabs, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUser, updateUser } from "../../api/users";
import { isLoggedIn } from "../../helpers/authHelper";
import CommentBrowser from "../CommentBrowser";

import ErrorAlert from "../ErrorAlert";
import FindUsers from "../FindUsers";
import Footer from "../Footer";
import GoBack from "../GoBack";
import GridLayout from "../GridLayout";
import Loading from "../Loading";
import MobileProfile from "../MobileProfile";
import Navbar from "../Navbar";
import PostBrowser from "../PostBrowser";
import Profile from "../Profile";
import ProfileTabs from "../ProfileTabs";
import ProfileEditForm from "../ProfileEditForm";

const ProfileView = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("posts");
  const user = isLoggedIn();
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);  // Manage dialog state
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    setLoading(true);
    const data = await getUser(params);
    setLoading(false);
    if (data.error) {
      setError(data.error);
    } else {
      setProfile(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updatedData = {
      profileName: formData.get("profileName"),
      biography: formData.get("biography"),
      business: formData.get("business"),
      revenue: formData.get("revenue"),
    };

    await updateUser(user, updatedData);

    setProfile({ ...profile, user: { ...profile.user, ...updatedData } });
    setOpenDialog(false); // Close the dialog after submission
  };

  const handleEditing = () => {
    setOpenDialog(true); // Open the dialog to edit profile
  };

  const handleMessage = () => {
    navigate("/messenger", { state: { user: profile.user } });
  };

  useEffect(() => {
    fetchUser();
  }, [location]);

  let tabs;
  if (profile) {
    tabs = {
      posts: (
        <PostBrowser
          profileUser={profile.user}
          contentType="posts"
          key="posts"
        />
      ),
      liked: (
        <PostBrowser
          profileUser={profile.user}
          contentType="liked"
          key="liked"
        />
      ),
      comments: <CommentBrowser profileUser={profile.user} />,
    };
  }

  return (
    <Container>
      <Navbar />

      <GridLayout
        left={
          <>
            <MobileProfile
              profile={profile}
              editing={editing}
              handleSubmit={handleSubmit}
              handleEditing={handleEditing}
              handleMessage={handleMessage}
            />
            <Stack spacing={2}>
              {profile ? (
                <>
                  <ProfileTabs tab={tab} setTab={setTab} />
                  {tabs[tab]}
                </>
              ) : (
                <Loading />
              )}
              {error && <ErrorAlert error={error} />}
            </Stack>
          </>
        }
        right={
          <Stack spacing={2}>
            <Profile
              profile={profile}
              editing={editing}
              handleSubmit={handleSubmit}
              handleEditing={handleEditing}
              handleMessage={handleMessage}
            />
            <FindUsers />
            <Footer />
          </Stack>
        }
      />

      {/* Edit Profile Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {profile && (
            <ProfileEditForm
              profile={profile}
              handleSubmit={handleSubmit}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileView;
