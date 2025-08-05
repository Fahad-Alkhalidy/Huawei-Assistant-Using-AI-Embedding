# Huawei Certification Assistant

An AI-powered chatbot that helps users with questions about Huawei certifications and technologies. The chatbot uses your knowledge base of Huawei certification materials to provide accurate and helpful responses.

## Features

- 🤖 **AI-Powered Chat**: Uses groq for intelligent responses
- 📚 **Knowledge Base**: Leverages Pinecone vector database for semantic search
- 🎯 **Huawei Focus**: Specialized in Huawei certifications and technologies
- 💬 **Real-time Chat**: Modern chat interface with typing indicators
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: groq
- **Icons**: Lucide React

## Prerequisites

Before running this application, you need:

1. **Grok API Key**: Get one from [OpenAI Platform](https://platform.openai.com/)
2. **Knowledge Files**: Your Huawei certification materials in .txt format

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Groq Configuration
Groq_API_KEY=your_openai_api_key_here
AI_Provider="groq"
# Optional
NEXT_PUBLIC_APP_NAME=Huawei Certification Assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Knowledge Base

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Visit the setup page: `http://localhost:3000/`

### 3. Start Chatting

Once initialization is complete, visit `http://localhost:3000/test-all` to start using the chatbot!

## Knowledge Base Structure

Your knowledge files should be organized in the `knowledge/` directory like this:

```
knowledge/
├── 5G/
│   ├── HCIA-5G.md
│   ├── HCIP-5G-Core.md
│   └── ...
├── datacom/
│   ├── HCIA-Datacom.md
│   ├── HCIP-Datacom.md
│   └── ...
├── cloud-computing/
│   ├── HCIA-Cloud-Computing.md
│   └── ...
└── ...
```

## API Endpoints

- `POST /api/chat` - Handles chat messages and returns AI responses

## Usage

1. **Ask Questions**: Type your questions about Huawei certifications
2. **Get Responses**: The AI will search your knowledge base and provide relevant answers
3. **Explore Topics**: Ask about specific technologies like 5G, datacom, cloud computing, etc.

## Example Questions

- "What is HCIA certification?"
- "Tell me about 5G core network architecture"
- "What are the prerequisites for HCIP Datacom?"
- "Explain Huawei cloud computing solutions"
- "What topics are covered in HCIA Security?"

## Troubleshooting

### Common Issues

1. **"No knowledge chunks found"**

   - Check that your markdown files are in the `knowledge/` directory
   - Ensure files have `.txt` extension

2. **"Failed to process your request"**
   - Verify your API keys are working

### Debug Steps

1. Check the browser console for errors
2. Verify your `.env.local` file has all required variables
3. Test your API keys independently

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the repository.
