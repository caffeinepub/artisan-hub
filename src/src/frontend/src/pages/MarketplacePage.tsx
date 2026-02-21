import { useState } from 'react';
import { useGetAllItems } from '../hooks/useQueries';
import { ItemCategory } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { ExternalBlob } from '../backend';

const CATEGORIES = [
  { value: 'all', label: 'All Items' },
  { value: ItemCategory.threeDPrint, label: '3D Prints' },
  { value: ItemCategory.ceramic, label: 'Ceramics' },
  { value: ItemCategory.painting, label: 'Paintings' },
  { value: ItemCategory.music, label: 'Music' },
  { value: ItemCategory.video, label: 'Videos' },
  { value: ItemCategory.other, label: 'Other' },
];

export default function MarketplacePage() {
  const { data: allItems, isLoading } = useGetAllItems();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems =
    selectedCategory === 'all'
      ? allItems
      : allItems?.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Discover{' '}
              <span className="text-primary">
                Unique
                <br />
                Artisan Creations
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Support independent artists and bring home one-of-a-kind pieces crafted with passion
              and skill.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="inline-flex flex-wrap gap-2 h-auto bg-transparent">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Items Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              No items found in this category yet.
            </p>
          </div>
        )}
      </section>
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
