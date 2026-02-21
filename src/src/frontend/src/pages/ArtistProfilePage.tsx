import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetItemsByArtist } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from '@tanstack/react-router';
import { Plus, Settings } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { ItemCategory } from '../backend';

export default function ArtistProfilePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: myItems, isLoading } = useGetItemsByArtist(
    identity?.getPrincipal() || null
  );

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please login to view your profile
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
                My Creations
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your listed items
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/settings' })} size="lg" variant="outline">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
              <Button onClick={() => navigate({ to: '/sell' })} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add New Item
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : myItems && myItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <ItemCard key={item.id.toString()} item={item} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">
                  You haven't listed any items yet
                </p>
                <Button onClick={() => navigate({ to: '/sell' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: any }) {
  const firstFileUrl = item.fileIds?.[0] ? ExternalBlob.fromURL(item.fileIds[0]).getDirectURL() : null;
  const priceDisplay = (Number(item.price) / 100).toFixed(2);

  return (
    <Link to="/item/$itemId" params={{ itemId: item.id.toString() }}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
        <div className="aspect-square overflow-hidden bg-muted">
          {firstFileUrl ? (
            <img
              src={firstFileUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <p className="font-display text-2xl font-bold text-primary">${priceDisplay}</p>
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(item.category)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
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
