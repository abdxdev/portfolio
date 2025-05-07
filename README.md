# Dynamic Developer Portfolio

A modern, responsive, and dynamic portfolio website built with Next.js 15, React 18, TypeScript, and TailwindCSS. This portfolio showcases a developer's skills, projects, experience, and allows visitors to provide feedback, all with a clean, professional design and smooth animations.

![Portfolio Screenshot](screenshots/screenshot_1.png)

## Features

- **Responsive Design**: Fully responsive layout that adapts to all device sizes
- **Dark/Light Mode**: Built-in theme toggler for user preference
- **API-Driven Content**: Dynamic content fetching through API routes
- **PostgreSQL Integration**: Database storage for visitor feedback
- **Modern UI Components**: Built with Radix UI components for consistent, accessible design
- **Dynamic Project Showcase**: Interactive project cards with details and links
- **Skills Visualization**: Visual representation of technical skills and proficiency
- **Visitor Feedback System**: Interactive form allowing visitors to leave feedback
- **Performance Optimized**: Fast loading with Next.js and Turbopack
- **SEO Ready**: Metadata optimization for better search engine visibility

## Tech Stack

- [Next.js 15](https://nextjs.org/) with [Turbopack](https://turbo.build/pack)
- [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) for styling
- [PostgreSQL](https://www.postgresql.org/) for database
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Embla Carousel](https://www.embla-carousel.com/) for image carousels
- [Lucide React](https://lucide.dev/) for icons

## Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/github-portfolio.git
   cd github-portfolio
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**:

   Create a `.env.local` file in the root directory with the following variables:

   ```
   # PostgreSQL Connection
   POSTGRES_URL=postgresql://username:password@localhost:5432/portfolio_db

   # Optional: Any additional API keys or configuration
   ```

4. **Set up the PostgreSQL database**:

   - Create a new PostgreSQL database
   - The schema will be automatically initialized when the app runs for the first time
   - Alternatively, you can manually execute the SQL schema from `src/lib/db/schema.sql`

5. **Customize your portfolio**:

   - Update personal information in:
     - `src/app/page.tsx` for main layout and metadata
     - `src/components/AboutMe.tsx` for your bio
     - `src/components/Profile.tsx` for profile information
     - `src/data/skills.json` for your technical skills
     - `src/data/socials.json` for your social media links

6. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see your portfolio.

## API Endpoints

The portfolio includes several API endpoints for dynamic content:

- `/api/portfolio` - Returns all portfolio data
- `/api/portfolio/projects` - Returns projects data
- `/api/portfolio/skills` - Returns skills data
- `/api/portfolio/socials` - Returns social media links
- `/api/portfolio/friends` - Returns network/connections data
- `/api/feedback` - Endpoint for submitting and retrieving visitor feedback

## Project Configuration

This portfolio automatically pulls your projects from GitHub and displays them based on special formatting in your repository descriptions. Here's how to set up your projects:

### Formatting GitHub Repository Descriptions

Your projects are pulled from GitHub repositories using a special syntax in the repository descriptions:

```
Your regular description text: marker1 marker2 marker3
```

### Available Markers:

- `p<number>` - Sets the priority (lower numbers appear first). Example: `p0` for top priority
- `s<number>` - Specifies the number of screenshots. Example: `s3` for 3 screenshots
- `m` - Marks as a university project
- `w` - Marks as currently working on (active project)

### Example Description:

```
A responsive web portfolio built with Next.js and TailwindCSS:p0:s3:w
```

This means:

- Regular description: "A responsive web portfolio built with Next.js and TailwindCSS"
- Priority: 0 (highest)
- Screenshots: 3 screenshots expected
- Status: Currently working on this project

### Adding Screenshots to Your Repositories

If you specify screenshots using the `s` marker, you need to add these images to each repository:

1. Create a `screenshots` folder in your repository
2. Add numbered screenshots like `screenshot_1.png`, `screenshot_2.png`, etc.
3. The number of screenshots should match the number in your `s` marker

### Configuring GitHub Username

In your portfolio's `socials.json` file, make sure you have your GitHub username correctly configured:

1. Open `src/data/socials.json`
2. Ensure your GitHub account is properly configured with `"github": true` flag:
   ```json
   {
     "name": "GitHub",
     "username": "your-github-username",
     "url": "https://github.com/your-github-username",
     "github": true
   }
   ```

### Example Repository Descriptions

Here are some example formats for your GitHub repository descriptions:

- Basic project: `My awesome project that does cool things`
- High-priority project with screenshots: `Interactive dashboard for data visualization:p0:s2`
- University project: `Database management system with SQL backend:m:s1`
- Active project: `E-commerce platform with React and Node.js:w:s3`
- Combined features: `Machine learning model for image recognition:p1:m:w:s4`

### Troubleshooting Projects Display

- If projects aren't showing up, check your GitHub API request limits
- Ensure repository descriptions follow the correct format with a colon separating the description from markers
- Verify your screenshots follow the naming convention and are in the correct location
- Check the browser console for any errors in the network requests

## Deployment

This project can be easily deployed to Vercel:

1. Push your repository to GitHub
2. Import your repository into Vercel
3. Configure the environment variables
4. Deploy!

For other hosting platforms, build the production version:

```bash
npm run build
npm run start
```

## Customization

### Themes

Modify the theme colors in `tailwind.config.ts`:

```typescript
// Customize colors, spacing, fonts, etc.
```

### Adding New Skills

Add new skills to `src/data/skills.json` following the existing schema.

### Adding New Projects

Create new project entries through the API or modify existing mock data.

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-icon-schema` - Generate icon schema from components

## License

MIT License

## Acknowledgements

- UI Components inspiration from [shadcn/ui](https://ui.shadcn.com/)
- Original design inspiration from [GitHub Profile](https://github.com/achris-alonzo30)
