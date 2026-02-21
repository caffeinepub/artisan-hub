import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetItem, useGetArtist, useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { ItemCategory } from '../backend';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const itemIdBigInt = itemId ? BigInt(itemId) : null;

  const { data: item, isLoading: itemLoading } = useGetItem(itemIdBigInt);
  const { data: artist, isLoading: artistLoading } = useGetArtist(item?.artistId || null);
  const createCheckout = useCreateCheckoutSession();

  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!item) return;
    setIsPurchasing(true);

    try {
      const shoppingItem = {
        productName: item.title,
        productDescription: item.description,
        priceInCents: item.price,
        currency: 'usd',
        quantity: 1n,
      };

      const session = await createCheckout.mutateAsync([shoppingItem]);
      if (!session?.url) {
        throw new Error('Stripe session missing URL');
      }
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setIsPurchasing(false);
    }
  };

  if (itemLoading || artistLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-96 mb-8" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground">Item not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const priceDisplay = (Number(item.price) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            {item.fileIds && item.fileIds.length > 0 ? (
              <div className="grid gap-4">
                {item.fileIds.map((fileId, index) => (
                  <MediaPreview key={fileId} fileId={fileId} index={index} />
                ))}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No media available</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {getCategoryLabel(item.category)}
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {item.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Artist
                </CardTitle>
                <CardDescription>{artist?.name || 'Unknown Artist'}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="font-display text-5xl font-bold text-primary">${priceDisplay}</p>
                  </div>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  size="lg"
                  className="w-full"
                >
                  {isPurchasing ? (
                    'Processing...'
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaPreview({ fileId, index }: { fileId: string; index: number }) {
  const url = ExternalBlob.fromURL(fileId).getDirectURL();
  const extension = fileId.split('.').pop()?.toLowerCase();

  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '');
  const isVideo = ['mp4', 'webm', 'mov'].includes(extension || '');

  if (isAudio) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium mb-3">Audio Track {index + 1}</p>
          <audio controls className="w-full">
            <source src={url} />
            Your browser does not support audio playback.
          </audio>
        </CardContent>
      </Card>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-lg overflow-hidden">
        <video controls className="w-full">
          <source src={url} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border-2 border-border">
      <img src={url} alt={`Media ${index + 1}`} className="w-full object-cover" />
    </div>
  );
}

function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    [ItemCategory.threeDPrint]: '3D Print',
    [ItemCategory.ceramic]: 'Ceramic',
    [ItemCategory.painting]: 'Painting',
    [ItemCategory.music]: 'Music',
    [ItemCategory.video]: 'Video',
    [ItemCategory.other]: 'Other',
  };
  return labels[category] || 'Unknown';
}
