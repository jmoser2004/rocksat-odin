import { Link, useLocation } from 'react-router-dom'
import Character from '../assets/Character.png'
import './Header.css'

const NAV = [
  { to: '/',      label: 'Dashboard' },
  { to: '/about', label: 'About'     },
]

export default function Header() {
  const { pathname } = useLocation()
  return (
    <header className="header">
      <img src={Character} alt="" className="header-char" />
      <nav className="header-nav">
        {NAV.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`header-link${pathname === to ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
