import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateItem, useGetCurrentArtist } from '../hooks/useQueries';
import { ItemCategory } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Loader2, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function CreateItemPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const createItem = useCreateItem();
  
  const userPrincipal = identity ? identity.getPrincipal() : null;
  const { data: currentArtist, isLoading: isLoadingArtist } = useGetCurrentArtist(userPrincipal);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Please login to create and sell items
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Marketplace</Button>
      </div>
    );
  }

  // Check if artist profile exists
  if (isLoadingArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!currentArtist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Artist Profile Required</CardTitle>
                <CardDescription className="text-base">
                  Before you can list items for sale, you need to set up your artist profile
                  with payment settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">What you'll need:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your artist name</li>
                    <li>Stripe account ID for receiving payments</li>
                  </ul>
                </div>
                <Button
                  onClick={() => navigate({ to: '/settings' })}
                  className="w-full"
                  size="lg"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Set Up Artist Profile
                </Button>
                <Button
                  onClick={() => navigate({ to: '/' })}
                  variant="outline"
                  className="w-full"
                >
                  Back to Marketplace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !price || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsUploading(true);

    try {
      const fileIds: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: percentage }));
        });

        await blob.getBytes();
        const url = blob.getDirectURL();
        fileIds.push(url);
      }

      await createItem.mutateAsync({
        title,
        category: category as ItemCategory,
        price: BigInt(priceInCents),
        description,
        fileIds,
      });

      toast.success('Item created successfully!');
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Create item error:', error);
      toast.error(error.message || 'Failed to create item');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            List Your Creation
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Share your unique work with the world
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Provide information about your creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Handcrafted Ceramic Vase"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as ItemCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ItemCategory.threeDPrint}>3D Print</SelectItem>
                      <SelectItem value={ItemCategory.ceramic}>Ceramic</SelectItem>
                      <SelectItem value={ItemCategory.painting}>Painting</SelectItem>
                      <SelectItem value={ItemCategory.music}>Music</SelectItem>
                      <SelectItem value={ItemCategory.video}>Video</SelectItem>
                      <SelectItem value={ItemCategory.other}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item, materials used, dimensions, etc."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media Upload</CardTitle>
                <CardDescription>Upload images, videos, or audio files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images, videos, or audio files
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="mt-2 w-full bg-background rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {!isUploading && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading} className="flex-1">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Publish Item'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
