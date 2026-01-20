import { Routes, Route } from 'react-router-dom'
import AiShoppingPage from './pages/AiShoppingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AiShoppingPage />} />
    </Routes>
  )
}

export default App
