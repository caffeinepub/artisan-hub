import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";

actor {
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ItemCategory = {
    #threeDPrint;
    #ceramic;
    #painting;
    #music;
    #video;
    #other;
  };

  public type SiteBranding = {
    name : Text;
    logoId : Text;
    primaryColor : Text;
  };

  public type Artist = {
    id : Principal;
    name : Text;
    stripeAccountId : Text;
  };

  public type Item = {
    id : Nat;
    artistId : Principal;
    title : Text;
    category : ItemCategory;
    price : Nat;
    description : Text;
    fileIds : [Text];
  };

  public type PurchaseRecord = {
    id : Nat;
    item : Item;
    buyer : Principal;
    seller : Artist;
    amount : Nat;
    artistShare : Nat;
    platformCommission : Nat;
    status : PurchaseStatus;
  };

  public type PurchaseStatus = {
    #pending;
    #completed;
    #refunded;
  };

  public type UserProfile = {
    name : Text;
  };

  public type ItemUpload = {
    title : Text;
    category : ItemCategory;
    price : Nat;
    description : Text;
    files : [Storage.ExternalBlob];
  };

  // Site configuration
  var siteBranding : SiteBranding = {
    name = "Artisan Hub";
    logoId = "";
    primaryColor = "#000000";
  };
  var commissionRate : Float = 0.1;
  var termsAndConditions : Text = "";

  // Persistent storage
  var nextItemId = 1;
  var nextPurchaseId = 1;

  let artists = Map.empty<Principal, Artist>();
  let items = Map.empty<Nat, Item>();
  let purchases = Map.empty<Nat, PurchaseRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var stripe : ?Stripe.StripeConfiguration = null;

  // User Profile Management - required to match the default authorization component
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Required Stripe
  public query func isStripeConfigured() : async Bool {
    stripe != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripe := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripe) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Artist Management
  public shared ({ caller }) func createArtist(name : Text, stripeAccountId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can become artists");
    };

    switch (artists.get(caller)) {
      case (?_) { Runtime.trap("Artist already exists"); };
      case (null) {
        let artist : Artist = {
          id = caller;
          name;
          stripeAccountId;
        };
        artists.add(caller, artist);
      };
    };
  };

  public query func getArtist(artistId : Principal) : async Artist {
    switch (artists.get(artistId)) {
      case (null) { Runtime.trap("Artist not found") };
      case (?artist) { artist };
    };
  };

  public shared ({ caller }) func updateArtist(name : Text, stripeAccountId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update artist profiles");
    };

    switch (artists.get(caller)) {
      case (null) { Runtime.trap("Artist not found") };
      case (?_) {
        let updated : Artist = {
          id = caller;
          name;
          stripeAccountId;
        };
        artists.add(caller, updated);
      };
    };
  };

  public query func getAllArtists() : async [Artist] {
    artists.values().toArray();
  };

  // Item Management
  public shared ({ caller }) func createItem(
    title : Text,
    category : ItemCategory,
    price : Nat,
    description : Text,
    fileIds : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only artists can create items");
    };

    switch (artists.get(caller)) {
      case (null) { Runtime.trap("Artist not found") };
      case (?_) {
        let item : Item = {
          id = nextItemId;
          artistId = caller;
          title;
          category;
          price;
          description;
          fileIds;
        };
        items.add(nextItemId, item);
        nextItemId += 1;
      };
    };
  };

  public query func getItem(itemId : Nat) : async Item {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
  };

  public shared ({ caller }) func updateItem(
    itemId : Nat,
    title : Text,
    category : ItemCategory,
    price : Nat,
    description : Text,
    fileIds : [Text]
  ) : async () {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the artist or admins can update this item");
        };

        switch (artists.get(item.artistId)) {
          case (null) { Runtime.trap("Artist not found") };
          case (?_) {
            let updated : Item = {
              id = itemId;
              artistId = item.artistId;
              title;
              category;
              price;
              description;
              fileIds;
            };
            items.add(itemId, updated);
          };
        };
      };
    };
  };

  public query func getItemsByArtist(artistId : Principal) : async [Item] {
    items.values().toArray().filter(func(i) { i.artistId == artistId });
  };

  public query func getAllItems() : async [Item] {
    items.values().toArray();
  };

  public query func getItemsByCategory(category : ItemCategory) : async [Item] {
    items.values().toArray().filter(func(i) { i.category == category });
  };

  // Purchase Management
  public shared ({ caller }) func processPurchase(itemId : Nat) : async Nat {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        switch (artists.get(item.artistId)) {
          case (null) { Runtime.trap("Artist not found") };
          case (?artist) {
            let artistShare = (item.price.toFloat() * (1.0 - commissionRate)).toInt().toNat();
            let platformCommission = (item.price.toFloat() * commissionRate).toInt().toNat();

            let purchase : PurchaseRecord = {
              id = nextPurchaseId;
              item;
              buyer = caller;
              seller = artist;
              amount = item.price;
              artistShare = artistShare;
              platformCommission = platformCommission;
              status = #pending;
            };
            purchases.add(nextPurchaseId, purchase);
            nextPurchaseId += 1;
            purchase.id;
          };
        };
      };
    };
  };

  public query ({ caller }) func getPurchase(purchaseId : Nat) : async PurchaseRecord {
    switch (purchases.get(purchaseId)) {
      case (null) { Runtime.trap("Purchase not found") };
      case (?purchase) {
        // Only buyer, seller, or admin can view purchase details
        if (caller != purchase.buyer and caller != purchase.seller.id and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only buyer, seller, or admins can view this purchase");
        };
        purchase;
      };
    };
  };

  public query ({ caller }) func getPurchasesByUser(userId : Principal) : async [PurchaseRecord] {
    // Users can only query their own purchases unless they're admin
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own purchases");
    };

    purchases.values().toArray().filter(
      func(p) {
        p.buyer == userId or p.seller.id == userId;
      }
    );
  };

  public query ({ caller }) func getAllPurchases() : async [PurchaseRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all purchases");
    };
    purchases.values().toArray();
  };

  // Admin - Site Configuration
  public shared ({ caller }) func updateSiteBranding(
    name : Text,
    logoId : Text,
    primaryColor : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update site branding");
    };

    siteBranding := {
      name;
      logoId;
      primaryColor;
    };
  };

  public query func getSiteBranding() : async SiteBranding {
    siteBranding;
  };

  public shared ({ caller }) func updateCommissionRate(newRate : Float) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update commission rate");
    };
    commissionRate := newRate;
  };

  public query func getCommissionRate() : async Float {
    commissionRate;
  };

  public shared ({ caller }) func updateTermsAndConditions(newTerms : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update terms and conditions");
    };
    termsAndConditions := newTerms;
  };

  public query func getTermsAndConditions() : async Text {
    termsAndConditions;
  };

  // Admin - Platform Statistics
  public query ({ caller }) func getRevenueStats() : async {
    totalSales : Nat;
    totalCommission : Nat;
    totalArtistShare : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view revenue statistics");
    };

    let allPurchases = purchases.values().toArray();
    let totalSales = allPurchases.foldLeft(0, func(acc, record) { acc + record.amount });
    let totalCommission = allPurchases.foldLeft(0, func(acc, record) { acc + record.platformCommission });
    let totalArtistShare = allPurchases.foldLeft(0, func(acc, record) { acc + record.artistShare });

    {
      totalSales;
      totalCommission;
      totalArtistShare;
    };
  };

  public query ({ caller }) func getAllArtistsAndTransactions() : async {
    artists : [Artist];
    items : [Item];
    purchases : [PurchaseRecord];
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all platform data");
    };

    {
      artists = artists.values().toArray();
      items = items.values().toArray();
      purchases = purchases.values().toArray();
    };
  };
};
