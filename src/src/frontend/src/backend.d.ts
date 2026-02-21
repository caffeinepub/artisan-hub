import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Artist {
    id: Principal;
    stripeAccountId: string;
    name: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Item {
    id: bigint;
    title: string;
    artistId: Principal;
    description: string;
    category: ItemCategory;
    price: bigint;
    fileIds: Array<string>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PurchaseRecord {
    id: bigint;
    status: PurchaseStatus;
    item: Item;
    seller: Artist;
    platformCommission: bigint;
    artistShare: bigint;
    buyer: Principal;
    amount: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SiteBranding {
    primaryColor: string;
    name: string;
    logoId: string;
}
export interface UserProfile {
    name: string;
}
export enum ItemCategory {
    music = "music",
    other = "other",
    video = "video",
    ceramic = "ceramic",
    painting = "painting",
    threeDPrint = "threeDPrint"
}
export enum PurchaseStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArtist(name: string, stripeAccountId: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createItem(title: string, category: ItemCategory, price: bigint, description: string, fileIds: Array<string>): Promise<void>;
    getAllArtists(): Promise<Array<Artist>>;
    getAllArtistsAndTransactions(): Promise<{
        artists: Array<Artist>;
        purchases: Array<PurchaseRecord>;
        items: Array<Item>;
    }>;
    getAllItems(): Promise<Array<Item>>;
    getAllPurchases(): Promise<Array<PurchaseRecord>>;
    getArtist(artistId: Principal): Promise<Artist>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommissionRate(): Promise<number>;
    getItem(itemId: bigint): Promise<Item>;
    getItemsByArtist(artistId: Principal): Promise<Array<Item>>;
    getItemsByCategory(category: ItemCategory): Promise<Array<Item>>;
    getPurchase(purchaseId: bigint): Promise<PurchaseRecord>;
    getPurchasesByUser(userId: Principal): Promise<Array<PurchaseRecord>>;
    getRevenueStats(): Promise<{
        totalCommission: bigint;
        totalSales: bigint;
        totalArtistShare: bigint;
    }>;
    getSiteBranding(): Promise<SiteBranding>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTermsAndConditions(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    processPurchase(itemId: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateArtist(name: string, stripeAccountId: string): Promise<void>;
    updateCommissionRate(newRate: number): Promise<void>;
    updateItem(itemId: bigint, title: string, category: ItemCategory, price: bigint, description: string, fileIds: Array<string>): Promise<void>;
    updateSiteBranding(name: string, logoId: string, primaryColor: string): Promise<void>;
    updateTermsAndConditions(newTerms: string): Promise<void>;
}
