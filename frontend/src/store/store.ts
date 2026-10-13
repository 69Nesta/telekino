import { configureStore } from '@reduxjs/toolkit';
import homeReducer from '@/store/reducers/homeSlice'

export const store = configureStore({
  reducer: {
    home: homeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;