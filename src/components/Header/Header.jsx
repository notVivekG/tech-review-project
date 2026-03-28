import React from 'react'
import {Container, Logo, LogoutBtn} from '../index'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "My Reviews",
      slug: "/my-posts",
      active: authStatus,
    },
    {
      name: "Post Review",
      slug: "/add-post",
      active: authStatus,
      preloadEditor: true,
    },
  ];

  return (
    <header className='py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur'>
      <Container>
        <nav className='flex items-center'>
          <div className="mr-4">
            <Link to='/'>
              <Logo width='70px' />
            </Link>
          </div>
          <ul className='flex ml-auto gap-2'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onMouseEnter={() => item.preloadEditor && import('@tinymce/tinymce-react')}
                    onFocus={() => item.preloadEditor && import('@tinymce/tinymce-react')}
                    onClick={() => navigate(item.slug)}
                    className='inline-block px-5 py-2 text-sm font-medium text-slate-100 rounded-full transition-colors duration-200 hover:bg-emerald-500/10 hover:text-emerald-300'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header