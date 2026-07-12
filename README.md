# Vectra Forge

Vectra Forge is an AI-powered design tool that generates instant, high-quality product mockups from your vector or logo uploads. Built with React and powered by Google's Gemini 2.5 Flash, it allows designers and merchandisers to visualize their branding on various products with realistic lighting, shadows, and textures.

## Features

### 🔨 Mockup Studio
- **Logo Integration**: Upload PNG/JPG logos with transparent backgrounds.
- **Smart Scaling**: Adjust logo branding size from subtle to bold.
- **Multi-Product Support**: Generate mockups for Mugs, T-Shirts, Hoodies, Tote Bags, and Notebooks.
- **Batch Generation**: Select multiple products to generate a full merchandise suite in one go.
- **Advanced Customization**:
  - **Color Selection**: Choose from preset colors for apparel.
  - **Shadow Physics**: Control shadow intensity, tone, and direction for realistic integration.
  - **Environment Prompts**: Add context (e.g., "Cyberpunk street lights", "Soft studio lighting") to the generation.

### 🪄 Refine / Edit
- **AI Editing**: Use text prompts to refine or modify generated images.
- **Batch Editing**: Apply changes to multiple images simultaneously.

### 🗂️ Workflow Tools
- **History Sidebar**: Keep track of all your generated mockups.
- **Download**: Export high-resolution mockups.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience.

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SanskarSontakke/Vectra-Forge.git
   cd Vectra-Forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Deployment

Build the application for production:

```bash
npm run build
```

This will generate a `dist` folder ready for deployment on static hosting services like Vercel, Netlify, or GitHub Pages.

## License

MIT © 2026 Sanskar Sontakke
