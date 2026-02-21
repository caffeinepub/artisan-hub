import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateArtist, useGetTermsAndConditions } from '../hooks/useQueries';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ArtistSignupPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const createArtist = useCreateArtist();
  const { data: terms } = useGetTermsAndConditions();

  const [name, setName] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please login to create an artist account
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

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      await createArtist.mutateAsync({ name, stripeAccountId });
      toast.success('Artist account created successfully!');
      navigate({ to: '/profile' });
    } catch (error: any) {
      console.error('Create artist error:', error);
      toast.error(error.message || 'Failed to create artist account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-2">
            Become an Artist
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Start sharing your creations with the world
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Artist Registration</CardTitle>
              <CardDescription>
                Complete your profile to start selling on Artisan Hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Artist Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or studio name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stripe">Stripe Account ID *</Label>
                  <Input
                    id="stripe"
                    value={stripeAccountId}
                    onChange={(e) => setStripeAccountId(e.target.value)}
                    placeholder="acct_..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Stripe Connect account ID for receiving payments
                  </p>
                </div>

                <div className="flex items-start space-x-2 pt-4">
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
                      I accept the terms and conditions
                    </label>
                    <p className="text-sm text-muted-foreground">
                      You agree to our terms by creating an account.{' '}
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/' })}
                    disabled={createArtist.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createArtist.isPending}
                    className="flex-1"
                  >
                    {createArtist.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
