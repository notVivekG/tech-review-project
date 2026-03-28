import React from 'react'
import logo from '../assets/techreviews-logo.png'

function Logo({width = '160px'}) {
  return (
    <div className="flex items-center" style={{ maxWidth: width }}>
      <img
        src={logo}
        alt="TechReviews logo"
        className="h-8 w-auto mr-2"
      />
      <span className="text-xl md:text-2xl font-semibold tracking-tight text-slate-50">
        TechReviews<span className="text-emerald-400">_</span>
      </span>
    </div>
  )
}

export default Logo
