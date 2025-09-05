# Machine Learning Quiz Web App

A modern, interactive web application that generates personalized machine learning quizzes using Google's Gemini AI. Built with Flask backend and vanilla HTML/CSS/JavaScript frontend, this app allows users to test their knowledge on various ML topics with customizable difficulty levels and question counts.
[![ML Quiz App Demo](https://img.youtube.com/vi/Ecvasiz2DLk/0.jpg)](https://youtu.be/Ecvasiz2DLk)

## 🌟 Features

- **AI-Powered Quiz Generation**: Uses Google Gemini API to generate intelligent, context-aware quiz questions
- **Customizable Parameters**: Choose topic, number of questions (1-25), and difficulty level
- **Modern UI/UX**: Beautiful, responsive design with smooth animations and intuitive navigation
- **Real-time Results**: Instant feedback with detailed explanations for each answer
- **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Error Handling**: Robust error handling with user-friendly messages
- **Fallback System**: Includes fallback questions if API fails

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10 or higher** - [Download Python](https://www.python.org/downloads/)
- **uv package manager** - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Google Gemini API Key** - [Get your free API key](https://makersuite.google.com/app/apikey)

### Step 1: Clone or Download the Project

If you have git installed:
```bash
git clone <your-repo-url>
cd ml-quiz-app
```

Or simply download and extract the project files to a folder.

### Step 2: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
uv sync
```

This command will:
- Create a virtual environment automatically
- Install all required dependencies (Flask, Google Generative AI, etc.)
- Set up the project for development

### Step 3: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (you'll need this to run the app)

### Step 4: Run the Application

Start the Flask development server:

```bash
uv run python main.py
```

You should see output similar to:
```
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
 * Debug mode: on
```

### Step 5: Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

## 📖 How to Use the App

### 1. Configure Your Quiz

When you first open the app, you'll see the quiz configuration form:

- **Gemini API Key**: Enter your Google Gemini API key
- **Quiz Topic**: Choose any ML topic (e.g., "Machine Learning", "Deep Learning", "Neural Networks")
- **Number of Questions**: Select 1-25 questions
- **Difficulty Level**: Choose from Beginner, Intermediate, or Advanced

### 2. Generate and Take the Quiz

1. Click "Generate Quiz" to create your personalized quiz
2. The AI will generate questions based on your specifications
3. Navigate through questions using "Previous" and "Next" buttons
4. Select your answer for each question
5. Click "Submit Quiz" when you've answered all questions

### 3. Review Your Results

After submission, you'll see:
- Your overall score and percentage
- Detailed results for each question
- Correct answers and explanations
- Options to take another quiz or retry the same one

## 🛠️ Technical Details

### Project Structure

```
ml-quiz-app/
├── main.py                 # Flask backend application
├── pyproject.toml          # Project configuration and dependencies
├── README.md              # This file
├── templates/
│   └── index.html         # Main HTML template
└── static/
    ├── style.css          # CSS styles
    └── script.js          # JavaScript functionality
```

### Dependencies

- **Flask 3.0+**: Web framework for the backend
- **google-generativeai**: Google's Gemini AI client library
- **flask-cors**: Cross-origin resource sharing support
- **python-dotenv**: Environment variable management

### API Endpoints

- `GET /`: Serves the main quiz interface
- `POST /generate_quiz`: Generates quiz questions using Gemini AI
- `POST /submit_quiz`: Processes quiz answers and returns results

## 🔧 Configuration Options

### Environment Variables

You can create a `.env` file in the project root to set default values:

```env
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=development
```

### Customization

The app is highly customizable:

- **Styling**: Modify `static/style.css` to change colors, fonts, and layout
- **Quiz Logic**: Update `main.py` to modify quiz generation or scoring
- **UI Behavior**: Edit `static/script.js` to change frontend interactions

## 🐛 Troubleshooting

### Common Issues

**1. "API key is required" error**
- Make sure you've entered a valid Gemini API key
- Check that the API key is active in your Google AI Studio account

**2. "Failed to generate quiz" error**
- Verify your internet connection
- Check if your API key has sufficient quota
- Try a different topic or reduce the number of questions

**3. App won't start**
- Ensure Python 3.10+ is installed
- Run `uv sync` to install dependencies
- Check that port 5000 is not in use by another application

**4. Styling issues**
- Clear your browser cache
- Check browser console for JavaScript errors
- Ensure all static files are properly served

### Getting Help

If you encounter issues:

1. Check the terminal/command prompt for error messages
2. Open browser developer tools (F12) to see console errors
3. Verify all dependencies are installed correctly
4. Ensure your API key is valid and has quota remaining

## 🚀 Deployment

### Local Development

The app runs in debug mode by default, which is perfect for development:

```bash
uv run python main.py
```

### Production Deployment

For production deployment:

1. Set `debug=False` in `main.py`
2. Use a production WSGI server like Gunicorn
3. Set up proper environment variables
4. Configure your web server (Nginx, Apache) as a reverse proxy

Example with Gunicorn:
```bash
uv add gunicorn
uv run gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

If you have questions or need help:

1. Check this README for common solutions
2. Look at the code comments for implementation details
3. Open an issue on the project repository
4. Contact the development team

---

**Happy Learning!** 🎓

This app is designed to make learning machine learning concepts fun and interactive. Whether you're a beginner or an expert, you can test your knowledge and learn something new with every quiz!
