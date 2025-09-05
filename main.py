from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
def configure_gemini(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        topic = data.get('topic', 'Machine Learning')
        num_questions = min(int(data.get('num_questions', 10)), 25)  # Max 25 questions
        difficulty = data.get('difficulty', 'intermediate')
        
        if not api_key:
            return jsonify({'error': 'API key is required'}), 400
        
        # Configure Gemini with the provided API key
        model = configure_gemini(api_key)
        
        # Create the prompt for quiz generation
        prompt = f"""
        Generate a {difficulty} level quiz about {topic} with exactly {num_questions} multiple-choice questions.
        
        Each question should have:
        - A clear, well-formatted question
        - 4 answer options (A, B, C, D)
        - Only one correct answer
        - An explanation for the correct answer
        
        Format the response as a JSON object with this structure:
        {{
            "questions": [
                {{
                    "question": "Question text here",
                    "options": {{
                        "A": "Option A text",
                        "B": "Option B text", 
                        "C": "Option C text",
                        "D": "Option D text"
                    }},
                    "correct_answer": "A",
                    "explanation": "Explanation of why this answer is correct"
                }}
            ]
        }}
        
        Make sure the questions are educational and test understanding of {topic} concepts.
        """
        
        # Generate the quiz
        response = model.generate_content(prompt)
        
        # Parse the response
        try:
            # Extract JSON from the response
            response_text = response.text
            # Find JSON content between ```json and ``` or just parse the whole response
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text.strip()
            
            quiz_data = json.loads(json_text)
            
            # Validate the structure
            if 'questions' not in quiz_data:
                raise ValueError("Invalid quiz format")
            
            return jsonify(quiz_data)
            
        except (json.JSONDecodeError, ValueError) as e:
            # If JSON parsing fails, create a fallback quiz
            fallback_quiz = create_fallback_quiz(topic, num_questions, difficulty)
            return jsonify(fallback_quiz)
            
    except Exception as e:
        return jsonify({'error': f'Failed to generate quiz: {str(e)}'}), 500

def create_fallback_quiz(topic, num_questions, difficulty):
    """Create a fallback quiz if Gemini API fails"""
    fallback_questions = [
        {
            "question": f"What is the primary goal of {topic}?",
            "options": {
                "A": "To memorize data patterns",
                "B": "To learn patterns from data and make predictions",
                "C": "To store large amounts of data",
                "D": "To visualize data"
            },
            "correct_answer": "B",
            "explanation": f"{topic} aims to learn patterns from data and make predictions on new, unseen data."
        },
        {
            "question": f"Which of the following is NOT a type of {topic} algorithm?",
            "options": {
                "A": "Supervised Learning",
                "B": "Unsupervised Learning", 
                "C": "Reinforcement Learning",
                "D": "Random Learning"
            },
            "correct_answer": "D",
            "explanation": "Random Learning is not a recognized type of machine learning algorithm."
        }
    ]
    
    # Repeat questions if needed to reach the requested number
    questions = []
    for i in range(num_questions):
        question = fallback_questions[i % len(fallback_questions)].copy()
        question["question"] = f"{i+1}. {question['question']}"
        questions.append(question)
    
    return {"questions": questions}

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.get_json()
        user_answers = data.get('answers', {})
        quiz_questions = data.get('questions', [])
        
        results = []
        correct_count = 0
        
        for i, question in enumerate(quiz_questions):
            user_answer = user_answers.get(str(i), '')
            correct_answer = question.get('correct_answer', '')
            is_correct = user_answer == correct_answer
            
            if is_correct:
                correct_count += 1
            
            results.append({
                'question_index': i,
                'question': question.get('question', ''),
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'explanation': question.get('explanation', '')
            })
        
        total_questions = len(quiz_questions)
        score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        return jsonify({
            'results': results,
            'score': correct_count,
            'total': total_questions,
            'percentage': round(score_percentage, 2)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process quiz submission: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
