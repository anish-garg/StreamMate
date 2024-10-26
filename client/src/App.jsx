import './App.css';
import { Routes, Route } from 'react-router-dom';
import Lobby from './Screens/Lobby';
function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Lobby />} />
      </Routes>
    </>
  )
}

export default App
