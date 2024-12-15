import { createTheme, WuiProvider } from '@welcome-ui/core'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import JobIndex from './pages/JobIndex'
import JobShow from './pages/JobShow'

const theme = createTheme()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <JobIndex /> },
      { path: 'jobs/:jobId', element: <JobShow /> },
    ],
  },
])

function App() {
  return (
    <WuiProvider theme={theme}>
      <Toaster richColors />
      <RouterProvider router={router} />
    </WuiProvider>
  )
}

export default App
