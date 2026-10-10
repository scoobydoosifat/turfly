import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

export function RouterProvider({ children }) {
  const read = () => ({ pathname: window.location.pathname, search: window.location.search, state: window.history.state })
  const [location, setLocation] = useState(read)

  useEffect(() => {
    const update = () => setLocation(read())
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  function navigate(to, options = {}) {
    const target = typeof to === 'string' ? to : to.pathname
    window.history[options.replace ? 'replaceState' : 'pushState'](options.state || null, '', target)
    setLocation(read())
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const value = useMemo(() => ({ location, navigate }), [location])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useLocation() { return useContext(RouterContext).location }
export function useNavigate() { return useContext(RouterContext).navigate }
export function useSearchParams() { return [new URLSearchParams(useLocation().search)] }

export function Link({ to, onClick, children, ...props }) {
  const navigate = useNavigate()
  return <a {...props} href={to} onClick={(event) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }}>{children}</a>
}

export function NavLink({ to, className = '', children, ...props }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return <Link {...props} to={to} className={`${className} ${active ? 'active' : ''}`.trim()}>{children}</Link>
}

export function Navigate({ to, replace = false, state }) {
  const navigate = useNavigate()
  useEffect(() => { navigate(to, { replace, state }) }, [to, replace])
  return null
}

