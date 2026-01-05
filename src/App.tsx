import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Calculator } from './components/Calculator'
import { NotFound } from './pages/NotFound'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Calculator /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: '/retirecal' }
)

function App() {
  return <RouterProvider router={router} />
}

export default App
