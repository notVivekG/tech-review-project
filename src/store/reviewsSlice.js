import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // list of product reviews
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setReviews: (state, action) => {
      state.items = action.payload;
    },
    addReview: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateReview: (state, action) => {
      const updated = action.payload;
      const index = state.items.findIndex((r) => r.$id === updated.$id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updated };
      }
    },
    removeReview: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((r) => r.$id !== id);
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetReviews: () => initialState,
  },
});

export const {
  setReviews,
  addReview,
  updateReview,
  removeReview,
  setStatus,
  setError,
  resetReviews,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
