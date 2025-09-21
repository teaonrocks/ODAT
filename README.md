This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## ODAT Game Quick Start

This app uses Convex as a realtime backend. To run locally:

1. Install dependencies and start Next.js dev server.
2. In a separate terminal, start Convex dev which also sets `NEXT_PUBLIC_CONVEX_URL`.
3. Seed the scenarios using the `scenarios:seed` function.

Steps:

```bash
pnpm install
pnpm dev
```

In another terminal:

```bash
npx convex dev
```

Then open the Convex dashboard URL printed in the terminal, go to Functions, run `scenarios:seed` once.

Navigate to <http://localhost:3000> and:

- Create Game to get a code and open the host dashboard.
- Share the code; players join from the home page.
- Host starts the game and advances days. Players choose A/B each day.
- Results page shows final resources and choices.

### Game Mechanics

The simulation includes several interconnected systems:

**Hit System:**

- Players accumulate Family, Health, and Job hits based on their choices
- 3 Family hits → 1 Health hit (Family hits reset to 0)
- 3 Health hits → 1 Job hit (Health hits reset to 0)
- 3 Job hits → Player becomes unemployed (permanent)

**Financial Options:**

- **Borrow Money**: Up to 3 times during the game
- **Pawn Wedding Ring**: Get $150 immediately (one-time)
- **Repay Loan**: Pay back borrowed amount + 10% interest
- **Redeem Ring**: Get ring back for $159 (if pawned)

**Employment Impact:**

- On Day 14, unemployed players cannot choose the "Receive Salary" option
- Starting cash is $150 per player (increased from $100)

**Player Status Panel:**

- Real-time display of cash, loan balance, hits, employment status
- Interactive buttons for financial actions with validation
- Visual hit indicators showing progress toward next penalty
