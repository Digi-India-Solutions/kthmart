import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ✅ Fetch all main categories
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async () => {
    const res = await axiosInstance.get("/mainCategory/get-all-mainCategories");
    return res.data;
  }
);

// ✅ Fetch subcategories by main category ID
export const fetchSubCategories = createAsyncThunk(
  "category/fetchSubCategories",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/category/category-by-main-category/${id}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// ✅ Slice
const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    subCategories: [],
    selectedCategory: null,  // 🔹 New: for FilterCategories → Sidebar link
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.subCategories = []; // clear old subcategories
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Main Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ Subcategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// ✅ Export actions
export const { setSelectedCategory } = categorySlice.actions;

export default categorySlice.reducer;
