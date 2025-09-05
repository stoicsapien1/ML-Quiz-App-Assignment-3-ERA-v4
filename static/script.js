// Global variables
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let quizQuestions = [];

// DOM elements
const quizConfig = document.getElementById('quiz-config');
const loading = document.getElementById('loading');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const errorMessage = document.getElementById('error-message');

// Form elements
const configForm = document.getElementById('config-form');
const quizForm = document.getElementById('quiz-form');

// Quiz elements
const questionsContainer = document.getElementById('questions-container');
const questionCounter = document.getElementById('question-counter');
const difficultyBadge = document.getElementById('difficulty-badge');
const quizTopic = document.getElementById('quiz-topic');

// Navigation elements
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

// Results elements
const scorePercentage = document.getElementById('score-percentage');
const scoreText = document.getElementById('score-text');
const scoreMessage = document.getElementById('score-message');
const resultsList = document.getElementById('results-list');

// Action buttons
const newQuizBtn = document.getElementById('new-quiz-btn');
const retryQuizBtn = document.getElementById('retry-quiz-btn');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    configForm.addEventListener('submit', handleConfigSubmit);
    quizForm.addEventListener('submit', handleQuizSubmit);
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    newQuizBtn.addEventListener('click', startNewQuiz);
    retryQuizBtn.addEventListener('click', retryQuiz);
});

// Handle quiz configuration form submission
async function handleConfigSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(configForm);
    const config = {
        api_key: formData.get('api-key'),
        topic: formData.get('topic'),
        num_questions: parseInt(formData.get('num-questions')),
        difficulty: formData.get('difficulty')
    };
    
    // Validate form
    if (!config.api_key.trim()) {
        showError('Please enter your Gemini API key');
        return;
    }
    
    if (!config.topic.trim()) {
        showError('Please enter a quiz topic');
        return;
    }
    
    if (config.num_questions < 1 || config.num_questions > 25) {
        showError('Number of questions must be between 1 and 25');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        const response = await fetch('/generate_quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate quiz');
        }
        
        // Store quiz data
        currentQuiz = data;
        quizQuestions = data.questions;
        currentQuestionIndex = 0;
        userAnswers = {};
        
        // Update UI
        quizTopic.textContent = config.topic;
        difficultyBadge.textContent = config.difficulty;
        difficultyBadge.className = `difficulty-badge ${config.difficulty}`;
        
        // Show quiz
        showQuiz();
        
    } catch (error) {
        showError(`Failed to generate quiz: ${error.message}`);
    }
}

// Show loading state
function showLoading() {
    hideAllSections();
    loading.classList.remove('hidden');
}

// Show quiz interface
function showQuiz() {
    hideAllSections();
    quizContainer.classList.remove('hidden');
    displayQuestion();
    updateNavigation();
}

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    // Update question counter
    questionCounter.textContent = `Question ${questionNumber} of ${quizQuestions.length}`;
    
    // Create question HTML
    const questionHTML = `
        <div class="question">
            <h3>${questionNumber}. ${question.question}</h3>
            <div class="options">
                ${Object.entries(question.options).map(([key, value]) => `
                    <label class="option ${userAnswers[currentQuestionIndex] === key ? 'selected' : ''}">
                        <input type="radio" name="question-${currentQuestionIndex}" value="${key}" 
                               ${userAnswers[currentQuestionIndex] === key ? 'checked' : ''}>
                        <span><strong>${key}.</strong> ${value}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    questionsContainer.innerHTML = questionHTML;
    
    // Add event listeners to options
    const options = questionsContainer.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update visual state
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Store answer
            userAnswers[currentQuestionIndex] = radio.value;
            updateNavigation();
        });
    });
}

// Update navigation buttons
function updateNavigation() {
    const hasAnswer = userAnswers[currentQuestionIndex] !== undefined;
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = !hasAnswer || isLastQuestion;
    submitBtn.classList.toggle('hidden', !isLastQuestion || !hasAnswer);
}

// Show previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateNavigation();
    }
}

// Show next question
function showNextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateNavigation();
    }
}

// Handle quiz submission
async function handleQuizSubmit(e) {
    e.preventDefault();
    
    // Validate all questions are answered
    const unansweredQuestions = [];
    for (let i = 0; i < quizQuestions.length; i++) {
        if (userAnswers[i] === undefined) {
            unansweredQuestions.push(i + 1);
        }
    }
    
    if (unansweredQuestions.length > 0) {
        showError(`Please answer all questions. Unanswered: ${unansweredQuestions.join(', ')}`);
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch('/submit_quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                answers: userAnswers,
                questions: quizQuestions
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit quiz');
        }
        
        // Show results
        showResults(data);
        
    } catch (error) {
        showError(`Failed to submit quiz: ${error.message}`);
    }
}

// Show quiz results
function showResults(data) {
    hideAllSections();
    resultsContainer.classList.remove('hidden');
    
    // Update score display
    scorePercentage.textContent = `${data.percentage}%`;
    scoreText.textContent = `You scored ${data.score} out of ${data.total}`;
    
    // Update score message
    let message = '';
    if (data.percentage >= 90) {
        message = 'Excellent! You\'re a machine learning expert!';
    } else if (data.percentage >= 80) {
        message = 'Great job! You have a solid understanding!';
    } else if (data.percentage >= 70) {
        message = 'Good work! Keep studying to improve!';
    } else if (data.percentage >= 60) {
        message = 'Not bad! Review the topics and try again!';
    } else {
        message = 'Keep learning! Practice makes perfect!';
    }
    scoreMessage.textContent = message;
    
    // Display detailed results
    resultsList.innerHTML = data.results.map((result, index) => `
        <div class="result-item ${result.is_correct ? 'correct' : 'incorrect'}">
            <div class="result-question">
                <strong>Question ${index + 1}:</strong> ${result.question}
            </div>
            <div class="result-answers">
                <div class="result-answer user">
                    <strong>Your answer:</strong> ${result.user_answer}
                </div>
                <div class="result-answer ${result.is_correct ? 'correct' : 'incorrect'}">
                    <strong>Correct answer:</strong> ${result.correct_answer}
                </div>
            </div>
            <div class="result-explanation">
                <strong>Explanation:</strong> ${result.explanation}
            </div>
        </div>
    `).join('');
}

// Start a new quiz
function startNewQuiz() {
    hideAllSections();
    quizConfig.classList.remove('hidden');
    
    // Reset form
    configForm.reset();
    configForm.querySelector('#topic').value = 'Machine Learning';
    configForm.querySelector('#num-questions').value = '10';
    configForm.querySelector('#difficulty').value = 'intermediate';
    
    // Reset quiz state
    currentQuiz = null;
    currentQuestionIndex = 0;
    userAnswers = {};
    quizQuestions = [];
}

// Retry current quiz
function retryQuiz() {
    currentQuestionIndex = 0;
    userAnswers = {};
    showQuiz();
}

// Hide all sections
function hideAllSections() {
    quizConfig.classList.add('hidden');
    loading.classList.add('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Show error message
function showError(message) {
    hideAllSections();
    quizConfig.classList.remove('hidden');
    
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Utility function to show success message
function showSuccess(message) {
    // You can implement a success message system here if needed
    console.log('Success:', message);
}
