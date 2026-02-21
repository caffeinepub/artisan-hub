import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Card className="text-center border-2 border-primary">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="font-display text-3xl">Payment Successful!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your order has been confirmed and the artist will be notified. You should
                receive a confirmation email shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => navigate({ to: '/' })}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => navigate({ to: '/profile' })}
                  variant="outline"
                  className="flex-1"
                >
                  View My Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
