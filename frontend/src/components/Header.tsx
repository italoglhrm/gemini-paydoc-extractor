import { LanguageToggle } from '@/components/LanguageToggle'
import { LogoIcon } from '@/components/LogoIcon'
import { APP_NAME } from '@/lib/i18n'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LogoIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </div>
        <LanguageToggle />
      </div>
    </header>
  )
}
