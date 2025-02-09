import { Box, Button, Stack, TextField } from "@mui/material";
import React, { useState } from "react";

const ProfileEditForm = ({ profile, handleSubmit }) => {
  const [formData, setFormData] = useState({
    profileName: profile?.user?.profileName || "",
    biography: profile?.user?.biography || "",
    business: profile?.user?.business || "",
    revenue: profile?.user?.revenue || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Profile Name"
          name="profileName"
          value={formData.profileName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Bio"
          name="biography"
          value={formData.biography}
          onChange={handleChange}
          multiline
          fullWidth
        />
        <TextField
          label="Business"
          name="business"
          value={formData.business}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Revenue"
          name="revenue"
          value={formData.revenue}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
};

export default ProfileEditForm;
