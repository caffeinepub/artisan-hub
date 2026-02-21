import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetRevenueStats, useGetAllArtistsAndTransactions, useGetSiteBranding, useUpdateSiteBranding, useGetTermsAndConditions, useUpdateTermsAndConditions, useGetCommissionRate, useUpdateCommissionRate, useIsStripeConfigured } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, Users, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Access denied. Admin privileges required.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Manage your marketplace
        </p>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <BrandingTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersTab />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: stats } = useGetRevenueStats();
  const { data: allData } = useGetAllArtistsAndTransactions();

  const totalSales = stats ? Number(stats.totalSales) / 100 : 0;
  const totalCommission = stats ? Number(stats.totalCommission) / 100 : 0;
  const totalArtistShare = stats ? Number(stats.totalArtistShare) / 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artist Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalArtistShare.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allData?.purchases.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {allData?.artists.length || 0} artists, {allData?.items.length || 0} items listed
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function BrandingTab() {
  const { data: branding } = useGetSiteBranding();
  const updateBranding = useUpdateSiteBranding();

  const [siteName, setSiteName] = useState('');
  const [logoId, setLogoId] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateBranding.mutateAsync({
        name: siteName || branding?.name || 'Artisan Hub',
        logoId: logoId || branding?.logoId || '',
        primaryColor: primaryColor || branding?.primaryColor || '#d97758',
      });
      toast.success('Branding updated successfully');
      setSiteName('');
      setLogoId('');
      setPrimaryColor('');
    } catch (error: any) {
      console.error('Update branding error:', error);
      toast.error(error.message || 'Failed to update branding');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Branding</CardTitle>
        <CardDescription>Customize the look and feel of your marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder={branding?.name || 'Artisan Hub'}
            />
          </div>

          <div>
            <Label htmlFor="logoId">Logo URL/ID</Label>
            <Input
              id="logoId"
              value={logoId}
              onChange={(e) => setLogoId(e.target.value)}
              placeholder={branding?.logoId || 'Enter logo URL or blob ID'}
            />
          </div>

          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder={branding?.primaryColor || '#d97758'}
                className="flex-1"
              />
              <Input
                type="color"
                value={primaryColor || branding?.primaryColor || '#d97758'}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          <Button type="submit" disabled={updateBranding.isPending}>
            {updateBranding.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Branding'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SettingsTab() {
  const { data: terms } = useGetTermsAndConditions();
  const updateTerms = useUpdateTermsAndConditions();
  const { data: commissionRate } = useGetCommissionRate();
  const updateCommission = useUpdateCommissionRate();
  const { data: isStripeConfigured } = useIsStripeConfigured();

  const [termsText, setTermsText] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [showStripeDialog, setShowStripeDialog] = useState(false);

  const handleUpdateTerms = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateTerms.mutateAsync(termsText || terms || '');
      toast.success('Terms updated successfully');
      setTermsText('');
    } catch (error: any) {
      console.error('Update terms error:', error);
      toast.error(error.message || 'Failed to update terms');
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();

    const rate = parseFloat(newCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Please enter a valid commission rate (0-100)');
      return;
    }

    try {
      await updateCommission.mutateAsync(rate);
      toast.success('Commission rate updated successfully');
      setNewCommissionRate('');
    } catch (error: any) {
      console.error('Update commission error:', error);
      toast.error(error.message || 'Failed to update commission rate');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Configuration</CardTitle>
          <CardDescription>
            {isStripeConfigured ? 'Stripe is configured' : 'Stripe is not configured'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stripe configuration must be set via backend deployment or environment variables.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rate</CardTitle>
          <CardDescription>
            Current rate: {commissionRate !== undefined ? `${commissionRate}%` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateCommission} className="space-y-4">
            <div>
              <Label htmlFor="commission">New Commission Rate (%)</Label>
              <Input
                id="commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newCommissionRate}
                onChange={(e) => setNewCommissionRate(e.target.value)}
                placeholder={commissionRate?.toString() || '10'}
              />
            </div>
            <Button type="submit" disabled={updateCommission.isPending}>
              {updateCommission.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Rate'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
          <CardDescription>Update the terms shown to artists during signup</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateTerms} className="space-y-4">
            <div>
              <Label htmlFor="terms">Terms Text</Label>
              <Textarea
                id="terms"
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                placeholder={terms || 'Enter terms and conditions...'}
                rows={10}
              />
            </div>
            <Button type="submit" disabled={updateTerms.isPending}>
              {updateTerms.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Terms'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const { data: allData } = useGetAllArtistsAndTransactions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artists</CardTitle>
        <CardDescription>Manage all registered artists</CardDescription>
      </CardHeader>
      <CardContent>
        {allData?.artists && allData.artists.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Principal ID</TableHead>
                <TableHead>Stripe Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allData.artists.map((artist) => (
                <TableRow key={artist.id.toString()}>
                  <TableCell className="font-medium">{artist.name}</TableCell>
                  <TableCell className="font-mono text-xs">{artist.id.toString().slice(0, 20)}...</TableCell>
                  <TableCell className="font-mono text-xs">{artist.stripeAccountId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No artists registered yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionsTab() {
  const { data: allData } = useGetAllArtistsAndTransactions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View all purchases on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {allData?.purchases && allData.purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Artist Share</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allData.purchases.map((purchase) => {
                const item = allData.items.find((i) => i.id === purchase.item.id);
                return (
                  <TableRow key={purchase.id.toString()}>
                    <TableCell className="font-mono text-xs">#{purchase.id.toString()}</TableCell>
                    <TableCell className="font-medium">{item?.title || 'Unknown'}</TableCell>
                    <TableCell>${(Number(purchase.amount) / 100).toFixed(2)}</TableCell>
                    <TableCell>${(Number(purchase.platformCommission) / 100).toFixed(2)}</TableCell>
                    <TableCell>${(Number(purchase.artistShare) / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === 'completed'
                            ? 'default'
                            : purchase.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No transactions yet</p>
        )}
      </CardContent>
    </Card>
  );
}
