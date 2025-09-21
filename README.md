# One Day at a Time (ODAT)

An interactive financial simulation game designed to build empathy and understanding of the challenges faced by low-income families through immersive decision-making experiences.

## About

**One Day at a Time** is an experiential learning tool that puts participants in the shoes of families making difficult financial decisions under resource constraints. Through 14 days of realistic scenarios, players navigate trade-offs between basic needs, health, family stability, and employment while managing limited resources.

This application was developed in collaboration with **Youth Corps Singapore** as a voluntary contribution to support their community engagement and education initiatives. The digital platform enables facilitators to run engaging workshops that foster empathy and awareness about socioeconomic challenges.

## Features

- **Real-time Multiplayer**: Multiple participants can join sessions simultaneously
- **Presenter Controls**: Dedicated interface for facilitators to manage game flow
- **Interactive Scenarios**: 14 days of realistic financial decision-making
- **Consequence System**: Interconnected hit system affecting family, health, and employment
- **Financial Tools**: Borrowing, loan repayment, and asset management options
- **Results Dashboard**: Comprehensive end-game analysis and discussion points

## Getting Started

This app uses [Next.js](https://nextjs.org) with [Convex](https://convex.dev) as a real-time backend.

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Local Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the Next.js development server:**

   ```bash
   pnpm dev
   ```

3. **In a separate terminal, start Convex:**

   ```bash
   npx convex dev
   ```

4. **Seed the game scenarios:**
   - Open the Convex dashboard URL printed in the terminal
   - Navigate to Functions
   - Run the `scenarios:seed` function once

5. **Access the application:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create a new session to get a room code
   - Share the code with participants to join

### Quick Start Guide

**For Facilitators:**

1. Click "Create New Session" to generate a room code
2. Share the code with participants
3. Use the presenter controls to start the game and advance through days
4. Present scenarios using the full-screen presentation view

**For Participants:**

1. Enter the room code and your name
2. Make financial decisions each day by choosing Option A or B
3. Monitor your resources, loans, and family/health/job status
4. View final results and discuss outcomes

## Game Mechanics

The simulation includes several interconnected systems designed to reflect real-world financial pressures:

### Hit System

- Players accumulate Family, Health, and Job hits based on their choices
- **3 Family hits** → 1 Health hit (Family hits reset to 0)
- **3 Health hits** → 1 Job hit (Health hits reset to 0)
- **3 Job hits** → Player becomes unemployed (permanent)

### Financial Options

- **Borrow Money**: Up to 3 times during the game (increments of $100-$400)
- **Pawn Wedding Ring**: Get $150 immediately (one-time option)
- **Repay Loan**: Pay back borrowed amount + 10% interest
- **Redeem Ring**: Retrieve wedding ring for $159 (if previously pawned)

### Employment Impact

- Starting resources: $150 per player
- On Day 14, unemployed players cannot choose salary-related options
- Certain choices are restricted based on employment status

### Decision Consequences

- **Day 5 → Day 8**: Previous choices affect available options
- **Day 14**: Job performance (hit count) determines final option availability
- **End Game**: Unpaid loans automatically deducted from final resources

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Convex (real-time database and functions)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Vercel (recommended)

## Collaboration

This project was developed in collaboration with **Youth Corps Singapore** to support their community engagement and educational initiatives. The development was completed voluntarily to contribute to meaningful social impact programs.

### About Youth Corps Singapore

Youth Corps Singapore is a platform that connects young people to volunteer opportunities and community projects, fostering civic engagement and social responsibility among Singapore's youth.

## Acknowledgments

- **Youth Corps Singapore** for the collaboration and opportunity to contribute to community education
- The original "One Day at a Time" experiential learning methodology
- All facilitators and participants who help bring awareness to socioeconomic challenges

---

Developed by Archer Chua in collaboration with Youth Corps Singapore
