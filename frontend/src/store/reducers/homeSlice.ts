import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type HomeDataProps } from "@/types/home";

export const initialHomeState: HomeDataProps = {
  r: 60,
  g: 34,
  b: 0,
};

export const homeSlice = createSlice({
  name: "home",
  initialState: initialHomeState,
  reducers: {
    setHomeStats: (_, action: PayloadAction<HomeDataProps>) => action.payload,
  },
});

export const { setHomeStats } = homeSlice.actions;

export default homeSlice.reducer;