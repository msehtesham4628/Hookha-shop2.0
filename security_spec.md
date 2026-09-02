# Security Specification: World Hookah Market Firestore RBAC & Data Fortress

## 1. Data Invariants
1. **User Identity & Role Immutability**: A customer cannot elevate their own role to `ADMIN` or `SUPER_ADMIN`. Profiles can only be created by the authenticated owner (`request.auth.uid == userId`) with default role `CUSTOMER`.
2. **Bootstrapped Super Admin**: The runtime operator `ehtesham4628@gmail.com` possesses verified administrative authority mapped via `/admins/{adminId}` or runtime verified email matching.
3. **Public Catalog Readability**: Products, Categories, and Brands are publicly readable by all clients, but writes and updates require administrative authority (`isAdmin()`).
4. **Order Ownership & State Machine**: An order cannot be created with another user's ID. Once placed, only admins can alter `orderStatus` and `paymentStatus`. Customers can read only their own orders (`resource.data.userId == request.auth.uid`).
5. **Review Integrity**: Verified product reviews must have `userId == request.auth.uid` and valid rating values between 1 and 5.
6. **Wholesale B2B Confidentiality**: Wholesale applications can be submitted by anyone, but read and reviewed exclusively by administrators.
7. **Wishlist Privacy**: A user's wishlist document `/wishlists/{userId}` is strictly private to the user (`request.auth.uid == userId`) and administrators.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1: Privilege Escalation on Register**
   - User signs up with `{ id: "uid_123", role: "SUPER_ADMIN", email: "attacker@test.com" }` to `/users/uid_123`.
2. **Payload 2: Shadow Field Injection on User Update**
   - Customer updates profile with `{ firstName: "Jane", isAdmin: true, totalSpent: 999999 }`.
3. **Payload 3: Cross-User Profile Tampering**
   - User `uid_abc` tries to update `/users/uid_xyz`.
4. **Payload 4: Catalog Price Hijacking**
   - Unauthenticated/Customer user attempts to update `/products/shisha-1` with `{ price: 0.01 }`.
5. **Payload 5: Order Spoofing (Impersonation)**
   - User `uid_123` creates an order with `userId: "uid_999"`.
6. **Payload 6: Unauthorized Order Scraping (Blind List)**
   - Unauthenticated or non-admin user attempts to list all orders in `/orders`.
7. **Payload 7: Self-Approval of Wholesale Application**
   - Applicant attempts to update their `/wholesaleApplications/app_123` with `{ status: "APPROVED" }`.
8. **Payload 8: Toxic Document ID Injection (Resource Poisoning)**
   - Attacker attempts write to document ID with 5000 random punctuation characters.
9. **Payload 9: Unbounded Array Flooding (Denial of Wallet)**
   - Attacker attempts to write a wishlist with 50,000 product IDs.
10. **Payload 10: Fake Review Rating Injection**
    - User submits review with `rating: 99` or `rating: -5`.
11. **Payload 11: Email Spoof Admin Access (Unverified Email)**
    - Attacker with unverified email `ehtesham4628@gmail.com` where `email_verified == false` attempts admin write.
12. **Payload 12: Coupon Code Alteration**
    - Customer tries to write a 100% off coupon code to `/coupons/FREE100`.
