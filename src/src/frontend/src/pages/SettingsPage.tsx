import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetArtist,
  useCreateArtist,
  useUpdateArtist,
  useGetTermsAndConditions,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal() || null;

  const { data: artist, isLoading: isLoadingArtist } = useGetArtist(principal);
  const { data: terms } = useGetTermsAndConditions();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();

  const [name, setName] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const isArtist = !!artist;

  // Populate form if user is already an artist
  useEffect(() => {
    if (artist) {
      setName(artist.name);
      setStripeAccountId(artist.stripeAccountId);
    }
  }, [artist]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please login to access settings
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Marketplace</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !stripeAccountId) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isArtist && !acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      if (isArtist) {
        await updateArtist.mutateAsync({ name, stripeAccountId });
        toast.success('Artist profile updated successfully!');
      } else {
        await createArtist.mutateAsync({ name, stripeAccountId });
        toast.success('Artist account created successfully!');
      }
    } catch (error: any) {
      console.error('Artist operation error:', error);
      toast.error(error.message || 'Failed to save artist profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                Settings
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {isArtist ? 'Update your artist profile' : 'Create your artist profile'}
              </p>
            </div>
          </div>

          {isLoadingArtist ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArtist ? 'Edit Artist Profile' : 'Become an Artist'}
                </CardTitle>
                <CardDescription>
                  {isArtist
                    ? 'Update your name and Stripe settings to manage payments'
                    : 'Complete your profile to start selling on Artisan Hub'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Artist Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name or studio name"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be displayed on your public profile
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe">Stripe Account ID *</Label>
                    <Input
                      id="stripe"
                      value={stripeAccountId}
                      onChange={(e) => setStripeAccountId(e.target.value)}
                      placeholder="acct_..."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Stripe Connect account ID for receiving payments (90% revenue share)
                    </p>
                  </div>

                  {!isArtist && (
                    <div className="flex items-start space-x-3 pt-4 border-t">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I accept the terms and conditions *
                        </label>
                        <p className="text-sm text-muted-foreground">
                          You agree to our terms by creating an artist account.{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="underline hover:text-foreground transition-colors"
                          >
                            Read terms
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: '/profile' })}
                      disabled={createArtist.isPending || updateArtist.isPending}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createArtist.isPending || updateArtist.isPending}
                      className="flex-1"
                    >
                      {createArtist.isPending || updateArtist.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isArtist ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>{isArtist ? 'Update Profile' : 'Create Artist Account'}</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Terms & Conditions</DialogTitle>
            <DialogDescription>Please read carefully before accepting</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert">
              {terms ? (
                <div className="whitespace-pre-wrap">{terms}</div>
              ) : (
                <p>Terms and conditions not yet configured.</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
