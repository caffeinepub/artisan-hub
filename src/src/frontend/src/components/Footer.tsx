import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetTermsAndConditions } from '../hooks/useQueries';

export default function Footer() {
  const { data: terms } = useGetTermsAndConditions();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2026. Built with <Heart className="h-4 w-4 text-destructive fill-destructive" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-sm text-muted-foreground">
                Terms & Conditions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Terms & Conditions</DialogTitle>
                <DialogDescription>Please read our terms carefully</DialogDescription>
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
      </div>
    </footer>
  );
}
