import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  Artist,
  Item,
  ItemCategory,
  PurchaseRecord,
  UserProfile,
  UserRole,
  SiteBranding,
  ShoppingItem,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// ============================================================================
// USER PROFILE
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============================================================================
// USER ROLE
// ============================================================================

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============================================================================
// ARTIST
// ============================================================================

export function useCreateArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      stripeAccountId,
    }: {
      name: string;
      stripeAccountId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArtist(name, stripeAccountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
    },
  });
}

export function useUpdateArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      stripeAccountId,
    }: {
      name: string;
      stripeAccountId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtist(name, stripeAccountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentArtist'] });
      queryClient.invalidateQueries({ queryKey: ['allArtists'] });
    },
  });
}

export function useGetArtist(artistId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Artist>({
    queryKey: ['artist', artistId?.toString()],
    queryFn: async () => {
      if (!actor || !artistId) throw new Error('Actor or artistId not available');
      return actor.getArtist(artistId);
    },
    enabled: !!actor && !actorFetching && !!artistId,
  });
}

export function useGetAllArtists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Artist[]>({
    queryKey: ['allArtists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtists();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============================================================================
// ITEMS
// ============================================================================

export function useCreateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      category,
      price,
      description,
      fileIds,
    }: {
      title: string;
      category: ItemCategory;
      price: bigint;
      description: string;
      fileIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createItem(title, category, price, description, fileIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allItems'] });
      queryClient.invalidateQueries({ queryKey: ['artistItems'] });
    },
  });
}

export function useGetAllItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['allItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllItems();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetItem(itemId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item>({
    queryKey: ['item', itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) throw new Error('Actor or itemId not available');
      return actor.getItem(itemId);
    },
    enabled: !!actor && !actorFetching && itemId !== null,
  });
}

export function useGetItemsByCategory(category: ItemCategory | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['itemsByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getItemsByCategory(category);
    },
    enabled: !!actor && !actorFetching && !!category,
  });
}

export function useGetItemsByArtist(artistId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['artistItems', artistId?.toString()],
    queryFn: async () => {
      if (!actor || !artistId) return [];
      return actor.getItemsByArtist(artistId);
    },
    enabled: !!actor && !actorFetching && !!artistId,
  });
}

// ============================================================================
// PURCHASES
// ============================================================================

export function useGetAllPurchases() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseRecord[]>({
    queryKey: ['allPurchases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPurchases();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPurchasesByUser(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseRecord[]>({
    queryKey: ['userPurchases', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getPurchasesByUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// ============================================================================
// ADMIN
// ============================================================================

export function useGetSiteBranding() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SiteBranding>({
    queryKey: ['siteBranding'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteBranding();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateSiteBranding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      logoId,
      primaryColor,
    }: {
      name: string;
      logoId: string;
      primaryColor: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSiteBranding(name, logoId, primaryColor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteBranding'] });
    },
  });
}

export function useGetTermsAndConditions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['termsAndConditions'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getTermsAndConditions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateTermsAndConditions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTerms: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTermsAndConditions(newTerms);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['termsAndConditions'] });
    },
  });
}

export function useGetCommissionRate() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['commissionRate'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getCommissionRate();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateCommissionRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRate: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCommissionRate(newRate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRate'] });
    },
  });
}

export function useGetRevenueStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    totalSales: bigint;
    totalCommission: bigint;
    totalArtistShare: bigint;
  }>({
    queryKey: ['revenueStats'],
    queryFn: async () => {
      if (!actor)
        return {
          totalSales: 0n,
          totalCommission: 0n,
          totalArtistShare: 0n,
        };
      return actor.getRevenueStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllArtistsAndTransactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    artists: Artist[];
    purchases: PurchaseRecord[];
    items: Item[];
  }>({
    queryKey: ['allArtistsAndTransactions'],
    queryFn: async () => {
      if (!actor)
        return {
          artists: [],
          purchases: [],
          items: [],
        };
      return actor.getAllArtistsAndTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============================================================================
// STRIPE
// ============================================================================

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}
