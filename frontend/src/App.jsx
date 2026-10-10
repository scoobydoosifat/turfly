import { useLocation } from './router'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AiAssistant from './components/AiAssistant'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import BookingPage from './pages/BookingPage'
import AuthPage from './pages/AuthPage'
import PasswordPage from './pages/PasswordPage'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentResult from './pages/PaymentResult'
import ContactPage from './pages/ContactPage'

export default function App() {
  const location = useLocation()
  const standalone = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) || location.pathname === '/admin'
  const pages = {
    '/': <Home />,
    '/book': <BookingPage />,
    '/contact': <ContactPage />,
    '/login': <AuthPage mode="login" />,
    '/register': <AuthPage mode="register" />,
    '/forgot-password': <PasswordPage />,
    '/reset-password': <PasswordPage reset />,
    '/payment/success': <PaymentSuccess />,
    '/payment/result': <PaymentResult />,
    '/dashboard': <ProtectedRoute><Dashboard /></ProtectedRoute>,
    '/admin': <ProtectedRoute admin><Admin /></ProtectedRoute>,
  }
  const page = pages[location.pathname] || <main className="simple-page"><section className="simple-card"><p className="eyebrow"><span /> 404</p><h1>That page is offside.</h1><a className="button button-dark" href="/">Return home</a></section></main>
  return <>
    {!standalone && <Navbar />}
    {page}
    {!standalone && <Footer />}
    {!standalone && <AiAssistant />}
  </>
}
