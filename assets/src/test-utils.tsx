import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTheme, WuiProvider } from '@welcome-ui/core'
import { FC, PropsWithChildren, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Candidate } from './api'

type AllTheProvidersProps = PropsWithChildren

const theme = createTheme()

export const AllTheProviders: FC<AllTheProvidersProps> = ({ children }) => {
  const queryClientTest = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClientTest}>
      <WuiProvider theme={theme}>{children}</WuiProvider>
    </QueryClientProvider>
  )
}

export const generateCandidates = (count: number): Candidate[] => {
  const candidates: Candidate[] = []
  for (let i = 0; i < count; i++) {
    candidates.push({ id: i, email: `test${i}@example.com`, position: i, status: 'new' })
  }
  return candidates
}

const customRender = (ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) => {
  const renderResult = render(ui, {
    wrapper: ({ children }) => <AllTheProviders>{children}</AllTheProviders>,
    ...options,
  })

  return {
    user: userEvent.setup(),
    ...renderResult,
  }
}

export { customRender as render }
