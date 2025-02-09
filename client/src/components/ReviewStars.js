import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Card from '@mui/material/Card';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Typography } from '@mui/material';
import { getUser, updateUser } from "../api/users";
import {isLoggedIn} from "../helpers/authHelper"
const ReviewStars = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = React.useState(0);
    const [error, setError] = useState("");
    const [serverError, setServerError] = useState("");
    const user = isLoggedIn();

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
    
    const handleSubmit = async (newValue) => {
        const ratingData = {
            userId: profile?.user?._id,
            username: profile?.user?.username || "",
            biography: profile?.user?.biography || "",
            businessName: profile?.user?.businessName || "",
            location: profile?.user?.location || "",
            interests: profile?.user?.interests || "",
            expertise: profile?.user?.expertise || "",
            rating: newValue? newValue:0,
        }
        console.log("profile user:", profile.user);

        try {
            await updateUser(user, ratingData);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
      fetchUser();
    }, [location]);
  return (
    <Box pb={3}>
      <Card sx={{ p: 2 }}>
        <Typography component="legend" sx={{ textAlign: 'center' }}>
          {profile?.user?.username}
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Rating
            name="simple-uncontrolled"
            onChange={(event, newValue) => {
              // console.log("profile.user:", user);
              handleSubmit(newValue);
            }}
            defaultValue={0}
            precision={0.5}
          />
        </Box>
      </Card>
    </Box>
  );
}

export default ReviewStars;
