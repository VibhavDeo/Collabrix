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
          label="username"
          name="username"
          value={formData.username}
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
          label="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="interests"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="expertise"
          name="expertise"
          value={formData.expertise}
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
