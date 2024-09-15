import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import { updateToken } from "../auth/authSlice";

const refreshToken = async () => {
  const response = await axiosInstance.get("/refresh");
  return response.data.accessToken;
};

export const fetchGeoInfo = createAsyncThunk(
  "geo/fetchGeoInfo",
  async (ip, { getState, dispatch }) => {
    let state = getState();
    let token = state.auth.token;

    if (!token) {
      token = await refreshToken();
      dispatch(updateToken(token));
      state = getState();
      token = state.auth.token;
    }

    const response = await axiosInstance.get(`/geo/${ip}`, {
      headers: { Authorization: token },
    });
    return response.data;
  }
);

export const fetchHistory = createAsyncThunk(
  "geo/fetchHistory",
  async (userId, { getState }) => {
    let state = getState();
    let token = state.auth.token;
    if (!token) {
      token = await refreshToken();
    }
    const response = await axiosInstance.get(`/geo/history/${userId}`, {
      headers: { Authorization: token },
    });
    return response.data.history;
  }
);

const geoSlice = createSlice({
  name: "geo",
  initialState: {
    geoInfo: null,
    history: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeoInfo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGeoInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.geoInfo = action.payload;
      })
      .addCase(fetchGeoInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export default geoSlice.reducer;
