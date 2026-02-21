import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import MarketplacePage from './pages/MarketplacePage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateItemPage from './pages/CreateItemPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import ArtistSignupPage from './pages/ArtistSignupPage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/Header';
import Footer from './components/Footer';

const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MarketplacePage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/item/$itemId',
  component: ItemDetailPage,
});

const createItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sell',
  component: CreateItemPage,
});

const artistProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ArtistProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const artistSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist-signup',
  component: ArtistSignupPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  marketplaceRoute,
  itemDetailRoute,
  createItemRoute,
  artistProfileRoute,
  adminRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  artistSignupRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
