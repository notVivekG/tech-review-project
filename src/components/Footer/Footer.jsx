import React from 'react'
import Logo from '../Logo'
import { Github, Twitter } from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'

function Footer() {
  return (
    <section className="relative overflow-hidden py-8 bg-slate-950 border-t border-slate-800">
      <div className="relative z-10 mx-auto max-w-7xl px-4 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Logo width="140px" />
          <p className="p-2 md:pl-8 text-sm text-slate-500 whitespace-normal sm:whitespace-nowrap">
            &copy; 2026 All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/notVivekG"
            target="_blank"
            rel="noreferrer"
            className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/notvivekkush"
            target="_blank"
            rel="noreferrer"
            className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://discord.gg/95FdnG473s"
            target="_blank"
            rel="noreferrer"
            className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
          >
            <FaDiscord className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Footer
