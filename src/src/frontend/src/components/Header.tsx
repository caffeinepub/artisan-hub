import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X, Palette } from 'lucide-react';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    }
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="text-foreground/80 hover:text-foreground transition-colors font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Marketplace
      </Link>
      {isAuthenticated && (
        <>
          <Link
            to="/sell"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sell
          </Link>
          <Link
            to="/profile"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Profile
          </Link>
          <Link
            to="/settings"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Settings
          </Link>
        </>
      )}
      {isAdmin && (
        <Link
          to="/admin"
          className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-7 w-7 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">
              Artisan Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
            >
              {isLoggingIn ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  <NavLinks />
                  <Button
                    onClick={handleAuth}
                    disabled={isLoggingIn}
                    variant={isAuthenticated ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {isLoggingIn ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
