import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/common/theme-provider.tsx"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "./components/ui/tooltip.tsx"
import { Provider } from "react-redux"
import { persistor, store } from "./app/store.ts"
import { PersistGate } from "redux-persist/integration/react"
import AppInitializer from "@/components/common/AppInitializer.tsx"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <BrowserRouter>
            <TooltipProvider>
              <AppInitializer />
              
              <App />
            </TooltipProvider>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)
