This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

🚀 Features

-Fully responsive UI for smooth booking experience
-Sign in with Google (NextAuth authentication)
-Browse available cabins with detailed information
-Real-time price and discount calculations
-Create and manage bookings
-Edit guest profile (nationality, ID)
-Cancel bookings with validation
-Pay Now or Pay on Arrival option during booking
-Thank you page post-booking confirmation

🔧 Tech Stack

Frontend
-Next.js (App Router) – React framework for SSR/SSG
-React Hook Form – Form handling
-React Query – Data fetching & caching
-Styled Components – Styling with dark mode support

Backend & Database
-Supabase – Postgres-based backend for real-time DB and authentication
-NextAuth.js – Authentication using Google provider
-Stripe / Razorpay – Payment integration for booking payments

⚙️ Functionality

-Booking Flow: Guests select a cabin → pick dates → fill form → book
-Payment Flow:
If "Pay Now": Redirects to Stripe checkout
If "Pay on Arrival": Confirms booking without payment
-Authentication: Guests must sign in to book/view/manage reservations
-Profile Management: Update guest nationality and ID
-Authorization: Users can only modify their own bookings/profile

🧪 Validation

-Form validations for booking and profile updates
-Prevents invalid date ranges or guest numbers

🔒 Security

-All server actions validate authentication & authorization
-No booking/profile updates allowed for other users
-Webhook-based payment verification for extra security

🛠 Future Enhancements

-Add email confirmations
-Improve accessibility & animations

🛠️ How to Run the Guest Hotel Booking App Locally

1. Clone the Repository

git clone https://github.com/your-username/guest-hotel-booking-app.git
cd guest-hotel-booking-app

2. Install Dependencies

```bash
npm install
```

3. Set Up Environment Variables
   Create a .env.local file in the root directory and add the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

💡 You can get SUPABASE_URL and ANON_KEY from your Supabase project settings
And Google credentials from Google Cloud Console

4. Run the Development Server

```bash
npm run dev
```

Your app will be running at http://localhost:3000

5. Supabase Setup
   Make sure you’ve created the following tables in your Supabase project:

-guests
-bookings
-cabins
-settings

And inserted sample data (or use your admin app to add data).

6. Authentication Setup
   The app uses NextAuth with Google login.

After logging in, users are automatically created in the guests table if they don’t exist already.
