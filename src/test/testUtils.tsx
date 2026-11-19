import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import rootReducer from "@/app/rootReducer"

export type TestRootState = ReturnType<typeof rootReducer>
export type TestPreloadedState = Partial<TestRootState>

export function createTestStore(preloadedState?: TestPreloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as Parameters<typeof rootReducer>[0],
  })
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: TestPreloadedState
  store?: ReturnType<typeof createTestStore>
  queryClient?: QueryClient
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    queryClient = createTestQueryClient(),
    route = "/",
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}
