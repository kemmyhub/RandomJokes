# 😂 RandomJokes - Modern Joke Generator

A professional, full-stack random joke generator with favorites functionality, AI integration, and a beautiful modern UI. Built with Express.js, vanilla JavaScript, and deployed-ready architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## ✨ Features

- 🎲 **Random Joke Generator** - Get jokes from a curated local collection
- ⭐ **Favorites System** - Save and manage your favorite jokes (localStorage)
- 🤖 **AI Integration** - Generate unique jokes using OpenAI (optional)
- 📱 **Responsive Design** - Works beautifully on all devices
- 🎨 **Modern UI** - Clean, professional interface with smooth animations
- 🔄 **Loading States** - Visual feedback during API calls
- 🚀 **Production Ready** - Security headers, compression, CORS enabled
- 🧪 **Tested** - Jest & Supertest integration

## 🛠 Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression
- **dotenv** - Environment configuration

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Modern CSS** - Flexbox, animations, responsive design
- **LocalStorage API** - Client-side favorites storage

### Testing
- **Jest** - Unit testing framework
- **Supertest** - HTTP assertion library

## 📦 Installation

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kemmyhub/RandomJokes.git
   cd RandomJokes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   # Optional: Add OpenAI API key for AI jokes
   # OPENAI_API_KEY=your_api_key_here
   ```

4. **Start the server**
   ```bash
   # Production mode
   npm start

   # Development mode (with nodemon)
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🚀 Usage

### Running the App
```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### API Endpoints

#### Get Random Joke
```http
GET /api/jokes/random
```
Returns a random joke from the local collection or external API fallback.

**Response:**
```json
{
  "success": true,
  "source": "local",
  "data": {
    "type": "single",
    "joke": "Why don't scientists trust atoms? Because they make up everything!",
    "category": "science"
  }
}
```

#### Get All Jokes
```http
GET /api/jokes/all
```
Returns all available jokes from the database.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

#### Generate AI Joke (Optional)
```http
POST /api/jokes/ai
```
Generates a unique joke using OpenAI API (requires API key).

**Response:**
```json
{
  "success": true,
  "source": "ai",
  "data": {
    "type": "single",
    "joke": "AI-generated joke here",
    "category": "ai-generated"
  }
}
```

#### Health Check
```http
GET /api/health
```
Check server status and uptime.

## 📁 Project Structure

```
RandomJokes/
├── client/                  # Frontend files
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styling
│   └── script.js           # Client-side JavaScript
├── server/                  # Backend files
│   ├── server.js           # Main server file
│   ├── routes/             # API routes
│   │   └── jokes.js        # Jokes endpoints
│   ├── data/               # Data storage
│   │   └── jokes.json      # Jokes database
│   └── utils/              # Utility functions
│       └── getNetworkIP.js # Network IP helper
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies & scripts
└── README.md               # Documentation
```

## 🎨 Adding More Jokes

Edit `server/data/jokes.json`:

```json
{
  "id": 11,
  "type": "single",
  "joke": "Your funny joke here!",
  "category": "general"
}
```

Or for two-part jokes:

```json
{
  "id": 12,
  "type": "twopart",
  "setup": "Setup line here?",
  "delivery": "Punchline here!",
  "category": "general"
}
```

## 🤖 Enabling AI Jokes

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart the server
4. Click "🤖 AI Joke" button in the UI

## 🌐 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Add Environment Variables** from `.env`
5. Deploy!

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Push code
git push heroku main
```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

Test files are located in the root directory (`*.test.js`).

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Controlled cross-origin access
- **Environment Variables** - Sensitive data protection
- **Input Validation** - API request validation
- **Error Handling** - Graceful error responses

## 🐛 Troubleshooting

### Port already in use
Change the `PORT` in `.env` file:
```env
PORT=3001
```

### AI jokes not working
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key is valid and has credits
- Restart the server after adding the key

### Favorites not persisting
- Check browser localStorage is enabled
- Clear browser cache and try again

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Joke API fallback powered by [JokeAPI](https://jokeapi.dev/)
- AI jokes powered by [OpenAI](https://openai.com/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ and lots of jokes**
