import './App.css'
import { Route, Routes } from 'react-router-dom'
import IntroSplash from './pages/intro/IntroSplash.tsx'
import Tabs from './components/tabs/Tabs.tsx'
import About from './pages/About.tsx'
import Architecture from './pages/Architecture.tsx'
import Interiors from './pages/Interiors.tsx'
import Designs from './pages/Designs.tsx'
import Contact from './pages/Contact.tsx'

function App() {
  return (
    <>
      <IntroSplash />
      <div className="appLayout">
      <Tabs />
      <main className="pageContent">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/interiors" element={<Interiors />} />
          <Route path="/designs" element={<Designs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
    </>
  )
}

export default App
