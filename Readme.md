# PersonaForge V1

An AI-powered personal portfolio generator that transforms your resume into a stunning, professional personal portfolio website in seconds.

## 🎯 Overview

PersonaForge is a full-stack web application that uses artificial intelligence to automatically generate professional personal portfolio websites from uploaded resume documents (PDF and image files). It eliminates the need for manual HTML/CSS coding and provides an intuitive interface for portfolio customization and editing.

## ✨ Key Features

- **AI-Powered Portfolio Generation**: Automatically creates responsive HTML portfolios from resume uploads
- **Multi-Format Support**: Process PDF and image-based resumes
- **Real-Time Editing**: Edit generated portfolios with natural language instructions
- **Responsive Design**: Auto-generated portfolios work seamlessly across all devices
- **Smart Parsing**: Intelligent extraction of information from various resume formats
- **Live Preview**: Instant preview of your portfolio as you make changes
- **Easy Customization**: Simple instruction-based editing without coding knowledge

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Features in Detail](#-features-in-detail)
- [Deployment](#-deployment)
- [Performance Notes](#-performance-notes)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## 🏗️ Architecture

[INSERT ARCHITECTURE DIAGRAM HERE]

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.2.8
- **Styling**: Styled Components 6.5.0
- **Testing**: React Testing Library, Jest
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **Language**: Python 3
- **AI/LLM**: LangChain with Groq API (OpenAI GPT-OSS-120B)
- **File Processing**: 
  - PDF extraction (PyPDF or similar)
  - Image text extraction (OCR)
- **CORS Support**: FastAPI CORS middleware
- **Environment**: Python virtual environment
- **Deployment**: Render

### External Services
- **LLM Provider**: Groq (for fast AI inference)
- **Model**: OpenAI GPT-OSS-120B
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render

## 📁 Project Structure

```
PersonaForge-V1/
├── backend/
│   ├── app.py                 # FastAPI main application
│   ├── generate.py            # AI portfolio generation logic
│   ├── image_extract.py       # Extract text from images (OCR)
│   ├── pdf_extract.py         # Extract text from PDF files
│   ├── parser.py              # Parse extracted text into structured JSON
│   ├── models.py              # Pydantic models and data structures
│   ├── update_code.py         # Handle portfolio editing instructions
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (not included in repo)
│
├── frontend/
│   ├── public/
│   │   ├── index.html         # Main HTML template
│   │   ├── manifest.json      # PWA manifest
│   │   └── robots.txt         # SEO robots file
│   │
│   ├── src/
│   │   ├── App.js             # Root React component
│   │   ├── App.css            # Global styles
│   │   ├── index.js           # React entry point
│   │   ├── index.css          # Base styles
│   │   │
│   │   ├── components/
│   │   │   ├── Home.jsx       # Main home page component
│   │   │   ├── Upload.jsx     # File upload interface
│   │   │   ├── FilePreview.jsx # Resume preview component
│   │   │   ├── Input.jsx      # Edit instruction input
│   │   │   └── Loader.jsx     # Loading state component
│   │   │
│   │   ├── setupTests.js      # Jest configuration
│   │   ├── reportWebVitals.js # Performance monitoring
│   │   └── App.test.js        # App component tests
│   │
│   ├── package.json           # NPM dependencies and scripts
│   └── README.md              # Frontend specific documentation
│
└── Readme.md                  # This file
```

## 💻 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git
- Groq API Key (get free key from [Groq Console](https://console.groq.com))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```env
   HOST=http://localhost:3000  # Frontend URL (adjust for production)
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run development server**
   ```bash
   python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (if using environment variables)
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm start
   ```

Frontend will be available at `http://localhost:3000`

## 🚀 Usage

### Basic Workflow

1. **Upload Resume**
   - Click on upload area or select file
   - Supported formats: PDF, PNG, JPG, JPEG
   - Your resume will be processed

2. **Wait for Generation**
   - AI analyzes your resume
   - Generates professional HTML portfolio
   - Preview appears in real-time

3. **Edit & Customize**
   - Use natural language instructions to edit
   - Example: "Change the background to dark blue"
   - Example: "Add a projects section"
   - Changes apply instantly

4. **Download/Deploy**
   - Download generated HTML
   - Deploy to your preferred hosting
   - Share your portfolio link

### Example Prompts for Editing

- "Make the navbar sticky and add a dark theme"
- "Increase the font size for better readability"
- "Add social media links in the footer"
- "Highlight the skills section with a different background color"
- "Make the portfolio mobile-responsive with proper padding"

## 🎨 Features in Detail

### Portfolio Generation
- Automatically extracts information from resumes
- Generates semantic, well-structured HTML
- Includes inline CSS for easy deployment
- Vanilla JavaScript for interactivity
- Responsive design for all screen sizes
- Sticky navbar for navigation
- Structured sections:
  - Introduction/About
  - Experience
  - Education
  - Skills (badge-style)
  - Certifications
  - Contact Footer

### Smart Text Extraction
- **PDF Extraction**: Handles various PDF formats and layouts
- **Image Extraction**: OCR-based text extraction from images
- **Intelligent Parsing**: Converts unstructured text into JSON format

### Edit & Refine
- Apply changes using natural language
- No coding knowledge required
- Real-time HTML updates
- Maintains portfolio structure integrity

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Optimized for desktop, tablet, and mobile
- Touch-friendly interface

## 🌐 Deployment

### Frontend - Vercel

1. **Connect Repository**
   - Push your code to GitHub
   - Visit [vercel.com](https://vercel.com)
   - Import your repository

2. **Configure Settings**
   ```
   Framework: Create React App
   Build Command: npm run build
   Output Directory: build
   ```

3. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add `REACT_APP_API_URL` pointing to your Render backend

4. **Deploy**
   - Vercel automatically deploys on push
   - Your portfolio builder is live!

**Frontend URL**: [YOUR_VERCEL_DEPLOYMENT_URL_HERE]

### Backend - Render

1. **Prepare Code**
   - Ensure `requirements.txt` is in root
   - Create `render.yaml` or configure in Render dashboard

2. **Create Web Service on Render**
   - Visit [render.com](https://render.com)
   - New → Web Service
   - Connect your GitHub repository

3. **Configure**
   ```
   Name: personaforge-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app:app --host 0.0.0.0 --port 10000
   ```

4. **Set Environment Variables**
   - `HOST`: Your Vercel frontend URL
   - `GROQ_API_KEY`: Your Groq API key

5. **Deploy**
   - Render automatically deploys on push

## ⏱️ Performance Notes

⚠️ **Important**: The backend is deployed on Render (free tier), which has the following characteristics:

- **Cold Start Time**: Approximately **30-50 seconds** for first request after inactivity
- **Initial Loading**: Please be patient on your first use after opening the app
- **Subsequent Requests**: Faster after warm-up (2-5 seconds typically)

**Tips for Better Experience:**
- Allow 30-50 seconds for the first request
- Backend may spin down after 15 minutes of inactivity
- Subsequent uses within the session will be faster
- Consider upgrading to paid tier for consistent performance

## 📊 API Endpoints

### POST `/generate`
Generates portfolio from uploaded file

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF or Image)
```

**Response:**
```json
{
  "html": "<!DOCTYPE html>..."
}
```

### POST `/edit`
Edits existing portfolio with instructions

**Request:**
```json
{
  "html": "<!DOCTYPE html>...",
  "instruction": "Change the background to dark blue"
}
```

**Response:**
```json
{
  "html": "<!DOCTYPE html>..."
}
```

## 🖼️ Demo/Preview

[INSERT GIF/VIDEO OF APPLICATION DEMO HERE]

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev)
- [LangChain Documentation](https://js.langchain.com/)
- [Groq Documentation](https://console.groq.com/docs)
- [Styled Components](https://styled-components.com/)

## 🔮 Future Enhancements

- [ ] Multiple portfolio templates
- [ ] Custom color scheme picker
- [ ] Export to PDF
- [ ] Hosting integration (deploy directly to hosting platforms)
- [ ] Portfolio templates library
- [ ] Collaborative editing
- [ ] Analytics dashboard
- [ ] Custom domain mapping
- [ ] Version history and rollback
- [ ] AI-powered content suggestions
- [ ] SEO optimization tools
- [ ] A/B testing for portfolio sections

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend URL is correctly set in frontend `.env`
- Check CORS settings in `app.py`
- Verify backend is running on Render

### File Upload Issues
- Ensure file format is PDF or image (PNG, JPG, JPEG)
- Maximum file size: Check Render file upload limits
- Try with a different resume format

### Slow Performance
- First request after inactivity takes 30-50 seconds (Render free tier)
- Check your internet connection
- Try refreshing the page

### Portfolio Not Generated
- Check browser console for errors
- Ensure resume contains extractable text
- Try with a different resume format
- Check if API key is valid

## 📝 Environment Variables

### Backend (`.env`)
```
HOST=https://your-vercel-frontend-url.com
GROQ_API_KEY=your_groq_api_key
```

### Frontend (`.env`)
```
REACT_APP_API_URL=https://your-render-backend-url.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Created by Aayush

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the amazing backend framework
- [React](https://react.dev) for the frontend library
- [Groq](https://groq.com) for fast LLM inference
- [LangChain](https://www.langchain.com/) for LLM orchestration
- [Vercel](https://vercel.com) for frontend hosting
- [Render](https://render.com) for backend hosting

---

**Status**: Active Development  
**Last Updated**: 2026-08-06  
**Version**: 1.0.0

🌟 If you find this project helpful, please consider giving it a star!
