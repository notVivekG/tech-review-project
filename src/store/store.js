import {configureStore} from '@reduxjs/toolkit';
import authSlice from './authSlice';
import reviewsSlice from './reviewsSlice';

const store = configureStore({
    reducer: {
        auth: authSlice,
        reviews: reviewsSlice,
        // You can add more slices here as your application grows
    },
});

export default store; 
