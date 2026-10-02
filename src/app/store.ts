import { configureStore } from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist"

import storageModule from "redux-persist/lib/storage"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storage = (storageModule as any).default ?? storageModule
import rootReducer from "./rootReducer"

const persistConfig = {
  key: "root",
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PROCEED",
        ],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
