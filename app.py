import os
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Read API key and model from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")  # default free model

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set. Add it to your .env file.")

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are Chef AI — a warm, knowledgeable personal food and nutrition assistant.

PERSONALITY: Friendly and enthusiastic about food, like a knowledgeable chef friend. Never robotic.

YOUR ABILITIES:
- Suggest specific, real meals for breakfast, lunch, dinner, snacks, or full daily plans
- Provide accurate nutrition estimates for any meal you suggest
- Answer follow-up questions: recipes, ingredients, substitutions, allergens
- Adapt to dietary preferences: vegetarian, vegan, non-vegetarian, gluten-free, keto
- Suggest meals based on mood: healthy, comfort food, quick, budget-friendly
- Handle questions like "what can I make with chicken and rice?" or "I want something spicy"

STRICT RESPONSE RULES:
1. When suggesting ANY single meal, ALWAYS include this EXACT block at the end on its own line:
   [NUTRITION: calories=XXX, protein=XXg, carbs=XXg, fat=XXg]

2. For daily meal plans, include [NUTRITION: ...] after EACH meal.

3. Use **bold** only for meal names.

4. Keep responses warm and concise — 2 to 4 sentences.

5. If the user asks for a recipe, provide a brief 5-step recipe.

6. If the user says "I ate this", confirm cheerfully.

7. Never say "As an AI". You ARE Chef AI.
"""

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *messages
            ],
            max_tokens=800,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({
            "error": "API request failed",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)