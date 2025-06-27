from flask import Flask, render_template, request, jsonify
from chatbot import get_meal_suggestion, suggest_daily_plan

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/suggest')
def suggest():
    meal_type = request.args.get('type')
    preference = request.args.get('preference')
    category = request.args.get('category')

    if not meal_type or not preference or not category:
        return jsonify({"error": "Missing one or more required parameters: type, preference, category"}), 400

    if meal_type == "daily_plan":
        plan = suggest_daily_plan(preference, category)
        return jsonify({"plan": plan})
    else:
        suggestion = get_meal_suggestion(meal_type, preference, category)
        return jsonify({"suggestion": suggestion})

if __name__ == "__main__":
    app.run(debug=True)
