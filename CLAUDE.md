# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brain Bridge is a browser extension built with WXT framework that provides real-time translation capabilities. It supports multiple AI providers (OpenAI, Anthropic Claude, Google Gemini) and allows users to translate selected text on web pages.

## Development Commands

### Running the Development Server

```bash
pnpm dev                 # Start development server with Chrome (manual installation required)
pnpm dev:chrome          # Explicitly use Chrome
pnpm dev:firefox         # Use Firefox (auto-installs extension)
```

**Note**: Chrome requires manual extension installation:
1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` directory

Firefox automatically installs the extension during development.

### Building for Production

```bash
pnpm build              # Build for both Chrome and Firefox
pnpm build:chrome       # Build for Chrome only
pnpm build:firefox      # Build for Firefox only
```

### Creating Distribution Packages

```bash
pnpm zip                # Create zip files for both browsers
pnpm zip:chrome         # Create Chrome extension zip
pnpm zip:firefox        # Create Firefox extension zip
```

### Code Quality

```bash
pnpm type-check         # Run TypeScript type checking
pnpm lint               # Run ESLint
pnpm lint:fix           # Run ESLint with auto-fix
pnpm format             # Format code with Prettier
```

## Architecture & Key Components

### Extension Structure

- **WXT Framework**: The project uses WXT for browser extension development, which provides a modern development experience with HMR support
- **Content Script** (`src/entrypoints/content/index.tsx`): Handles text selection, DOM manipulation, and renders translation tooltips using React shadow DOM
- **Background Script** (`src/entrypoints/background.ts`): Manages API calls to translation providers and handles context menu interactions
- **Popup** (`src/entrypoints/popup/`): Provides user interface for configuration

### Translation Flow

1. User selects text on a webpage
2. Context menu option "Brain Bridgeで選択範囲を翻訳" appears
3. Background script receives the request and calls the configured AI provider
4. Translation result is displayed in a tooltip via shadow DOM to avoid CSS conflicts

### AI Provider Integration

- Supports OpenAI, Anthropic Claude, and Google Gemini APIs
- Uses the `ai` SDK for unified interface across providers
- API keys are stored in browser sync storage

### Key Technical Decisions

- **Shadow DOM**: Used for UI components to prevent CSS conflicts with host pages
- **TypeScript**: Full TypeScript support with strict type checking
- **React 19**: Used for UI components with the latest React features
- **Tailwind CSS**: For styling with CSS-in-JS for critical styles

## Important Files

- `wxt.config.ts`: WXT configuration including manifest permissions
- `src/const.ts`: Likely contains constants for the extension
- `src/components/TranslatedTooltip.tsx`: Main tooltip component for displaying translations
- Browser permissions required: `storage`, `contextMenus`, and host permissions for AI provider domains
