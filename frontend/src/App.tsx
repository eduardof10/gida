import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import IntroSplash from './pages/intro/IntroSplash.tsx'
import Tabs from './components/tabs/Tabs.tsx'
import About from './pages/About.tsx'
import Architecture from './pages/Architecture.tsx'
import Interiors from './pages/Interiors.tsx'
import Designs from './pages/Designs.tsx'
import Contact from './pages/Contact.tsx'
import AdminLogin from './pages/admin/Login.tsx'
import RequireAdmin from './pages/admin/RequireAdmin.tsx'
import AdminProjectsList from './pages/admin/ProjectsList.tsx'
import AdminProjectEdit from './pages/admin/ProjectEdit.tsx'

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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
          <Route
            path="/admin/projects"
            element={
              <RequireAdmin>
                <AdminProjectsList />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/projects/:id"
            element={
              <RequireAdmin>
                <AdminProjectEdit />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
    </>
  )
}

export default App
