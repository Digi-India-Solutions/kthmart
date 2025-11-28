// redux/features/auth/loginSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";
import toast from "react-hot-toast";

// ================= LOGIN ==================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", loginData);
      return response.data; // contains user + token
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ================= VERIFY USER ==================
export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");

    const response = await axiosInstance.get("/auth/verify-user");
    return response.data?.user;
  }
);

// ================= UPDATE USER ==================
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (updatedUser, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/auth/update-profile",
        updatedUser
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);

// ================= UPDATE PROFILE IMAGE ==================
export const updateProfileImg = createAsyncThunk(
  "auth/updateProfileImg",
  async (updatedUser, { rejectWithValue }) => {
    try {
      const data = new FormData();
      data.append("image", updatedUser.image);

      await axiosInstance.put("/auth/update-profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);

// ================= SERVER LOGOUT ==================
export const logoutUserFromServer = createAsyncThunk(
  "auth/logoutUserFromServer",
  async () => {
    await axiosInstance.post("/auth/logout");
    toast.success("Logout successful");
  }
);

// ================= SLICE ==================
const loginSlice = createSlice({
  name: "login",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },

  reducers: {
    // 👉 CLIENT-SIDE LOGOUT
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    
      // remove EVERYTHING related to auth
      localStorage.removeItem("token");
      sessionStorage.clear();
    },
    
    resetState: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // SAVE USER
        localStorage.setItem("token", action.payload.token); // SAVE TOKEN
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // VERIFY USER
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // UPDATE USER
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // SERVER LOGOUT
      .addCase(logoutUserFromServer.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem("token");
      });
  },
});

// ================= EXPORTS ==================
export const { logout, resetState } = loginSlice.actions;

export default loginSlice.reducer;
