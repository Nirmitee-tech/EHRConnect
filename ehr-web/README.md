This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Setup

The `.env.local` file has been created with default values for local development. Review and update if needed:

```bash
# View the configuration
cat .env.local

# Update values if needed (optional)
nano .env.local  # or use your preferred editor
```

**Key Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)
- `NEXTAUTH_URL` - Frontend URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET` - Session encryption secret (change in production!)
- `AUTH_PROVIDER` - Authentication method: `postgres` (default) or `keycloak`

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will connect to the backend API at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
