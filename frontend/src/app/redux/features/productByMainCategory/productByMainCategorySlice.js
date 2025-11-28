// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "../axiosInstance";

// export const fetchProductsByMainCategory = createAsyncThunk(
//   "productByMainCategory/fetchProductsByMainCategory",
//   async ({ subcategoryId }, thunkAPI) => {
//     try {
//       const response = await axiosInstance.get(
//         `/product/product-by-main-category/${subcategoryId}`
//       );
//       return response?.data?.products;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

// const productByMainCategorySlice = createSlice({
//   name: "productByMainCategory",
//   initialState: {
//     products: [],
//     totalPages: 0,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     latest: (state) => {
//       state.products = state.products.sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//     },
//     highToLow: (state) => {
//       state.products = state.products.sort(
//         (a, b) => b.price - a.price
//       );
//     },
//     lowToHigh: (state) => {
//       state.products = state.products.sort(
//         (a, b) => a.price - b.price
//       );
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProductsByMainCategory.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProductsByMainCategory.fulfilled, (state, action) => {
//         state.loading = false;
//         state.products = action.payload?.products;
//         state.totalPages = action.payload?.totalPages;
//       })
//       .addCase(fetchProductsByMainCategory.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   latest,
//   highToLow,
//   lowToHigh,
// } = productByMainCategorySlice.actions;

// export default productByMainCategorySlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ✅ Async thunk to fetch products by main category (with pagination support)
export const fetchProductsByMainCategory = createAsyncThunk(
  "productByMainCategory/fetchProductsByMainCategory",
  async (subcategoryId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/product/product-by-main-category/${subcategoryId}`
      );
console.log("XXXXXX::=>", response?.data?.products);
      // Return full response data, not just products
      return response?.data?.products;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

const productByMainCategorySlice = createSlice({
  name: "productByMainCategory",
  initialState: {
    products: [],
    totalPages: 0,
    currentPage: 1,
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    sortLatest: (state) => {
      state.products = [...state.products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    sortHighToLow: (state) => {
      state.products = [...state.products].sort((a, b) => b.price - a.price);
    },
    sortLowToHigh: (state) => {
      state.products = [...state.products].sort((a, b) => a.price - b.price);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByMainCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByMainCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.products || [];
        state.totalPages = action.payload?.totalPages || 0;
        state.currentPage = action.payload?.currentPage || 1;
        state.totalCount = action.payload?.totalCount || 0;
      })
      .addCase(fetchProductsByMainCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { sortLatest, sortHighToLow, sortLowToHigh } =
  productByMainCategorySlice.actions;

export default productByMainCategorySlice.reducer;
