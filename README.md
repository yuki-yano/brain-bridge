# Brain Bridge

A browser extension that provides instant AI-powered translation for selected text on any webpage.

## Features

- **Instant Translation**: Select any text and translate it with a single right-click
- **Multiple AI Providers**: Support for OpenAI, Anthropic Claude, and Google Gemini
- **Smart Language Detection**: Automatically translates Japanese to English and other languages to Japanese
- **Shadow DOM UI**: Tooltip display that doesn't interfere with webpage styles
- **Token Usage Tracking**: Monitor API usage and translation costs
- **Cross-browser Support**: Works on both Chrome and Firefox

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/yuki-yano/brain-bridge.git
cd brain-bridge
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the extension:
```bash
pnpm build
```

4. Load the extension:
   - **Chrome**: 
     1. Open `chrome://extensions/`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select `.output/chrome-mv3` directory
   - **Firefox**:
     1. Open `about:debugging`
     2. Click "This Firefox"
     3. Click "Load Temporary Add-on"
     4. Select any file in `.output/firefox-mv3` directory

## Development

```bash
# Start development server
pnpm dev              # Chrome (manual installation required)
pnpm dev:firefox      # Firefox (auto-installs)

# Build for production
pnpm build            # Build for all browsers
pnpm build:chrome     # Chrome only
pnpm build:firefox    # Firefox only

# Create distribution packages
pnpm zip              # Create zip files for distribution
pnpm zip:chrome       # Chrome only
pnpm zip:firefox      # Firefox only

# Code quality
pnpm type-check       # TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
```

## Usage

1. Click the Brain Bridge extension icon
2. Select your preferred AI provider
3. Enter your API key for the selected provider
4. Choose the model you want to use
5. Select any text on a webpage
6. Right-click and choose "Translate with Brain Bridge"
7. View the translation in the tooltip

## Configuration

### API Keys

You'll need an API key from one of the supported providers:
- [OpenAI API](https://platform.openai.com/api-keys)
- [Anthropic Claude API](https://console.anthropic.com/)
- [Google Gemini API](https://makersuite.google.com/app/apikey)

### Available Models

**OpenAI:**
- GPT-4.1
- GPT-4.1 mini
- GPT-4.1 nano

**Claude:**
- Claude 4 Sonnet
- Claude 3.5 Sonnet
- Claude 3.5 Haiku

**Gemini:**
- Gemini 2.5 Flash
- Gemini 2.5 Flash-Lite
- Gemini 2.5 Pro

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Build Tool**: Vite

## Privacy

- API keys are stored securely in browser sync storage
- Only selected text is sent to the AI provider
- No data is collected or stored by the extension itself

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[Yuki Yano](https://github.com/yuki-yano)