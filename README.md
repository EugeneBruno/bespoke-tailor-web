# IVFODI Luxury Bespoke Fashion

A premium fashion e-commerce platform for **IVFODI Clothing**, built for showcasing luxury ready-to-wear collections and bespoke fashion services.

This platform allows customers to:

- Browse fashion collections by category
- View product details
- Add products to cart
- Checkout securely with Paystack
- Track orders
- Contact the brand directly
- Request bespoke/custom tailoring services

It also includes a secure **admin dashboard** for:

- Adding new products
- Managing customer orders
- Responding to customer messages
- Updating order statuses

---

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

### Backend / Services
- Supabase (Authentication + PostgreSQL Database)
- Cloudinary (Image hosting + optimization)
- Paystack (Payments)
- Nodemailer (Email notifications)

---

## Features

### Customer Features
- Luxury storefront UI
- Category browsing
- Dynamic product pages
- Cart functionality
- Secure checkout
- Order tracking
- Bespoke order request flow
- Contact form
- WhatsApp ordering option

### Admin Features
- Admin authentication
- Product upload with front/back image support
- Cloudinary image upload
- Order management
- Customer message management
- Reply-to-customer workflow
- Order status update emails

---

## Project Structure

```bash
src/
 ├── app/
 │   ├── admin/
 │   ├── api/
 │   ├── bespoke/
 │   ├── contact/
 │   ├── shop/
 │   ├── account/
 │   └── page.tsx
 │
 ├── components/
 ├── context/
 ├── lib/
 ├── utils/
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

### Security Note
Never expose these publicly:

- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `EMAIL_PASS`

These must remain server-side only.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/EugeneBruno/bespoke-tailor-web.git
```

Move into the project:

```bash
cd bespoke-tailor-web
```

Install dependencies:

```bash
npm install
```

---

## Running Locally

Start the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

Run production build:

```bash
npm start
```

---

## Admin Access

Admin access is role-protected through Supabase.

To grant admin access:

1. Create a user account
2. Open the `profiles` table in Supabase
3. Update the user's role:

```sql
role = 'admin'
```

---

## Payment Integration

Payments are handled via **Paystack**.

Supported flow:

- Customer checkout
- Payment verification
- Order creation
- Order confirmation workflow

---

## Image Handling

Product images are hosted on **Cloudinary**.

Features:

- Front image upload
- Back image upload
- Optimized delivery
- Cloud image caching

---

## Deployment

Recommended deployment platforms:

- Vercel
- Railway
- Netlify (frontend only)

For Vercel:

```bash
vercel
```

Be sure to add all environment variables in your deployment dashboard.

---

## SEO

The platform supports:

- Dynamic metadata
- Structured server/client separation
- Optimized image loading
- Search-engine friendly routing

---

## Future Improvements

Planned enhancements:

- Product editing/deletion from admin dashboard
- Wishlist
- Customer account order history
- Discount/coupon support
- Inventory management
- Real-time admin notifications
- Analytics dashboard

---

## Author

**Eugene Bruno**

GitHub: https://github.com/EugeneBruno

LinkedIn: https://linkedin.com/in/eugene-ayalogu-05077a365

---

## License

This project is private and built for IVFODI Clothing.