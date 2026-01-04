import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { Footer } from './components/Layout/Footer'
import { Calculator } from './components/Calculator'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto max-w-screen-xl flex-1 px-4 py-8 md:px-8">
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
