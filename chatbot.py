import random
import pandas as pd

# Load Excel data once (adjust path if needed)
meals_df = pd.read_excel("meals_dataset_200.xlsx")

def get_meal_suggestion(meal_type, preference, category):
    filtered = meals_df[
        (meals_df['meal_type'].str.lower() == meal_type.lower()) &
        (meals_df['preference'].str.lower() == preference.lower()) &
        (meals_df['category'].str.lower() == category.lower())
    ]

    if filtered.empty:
        return "Sorry, I don't have suggestions for that combination."

    return random.choice(filtered['suggestion'].tolist())

def suggest_daily_plan(preference, category):
    plan = {}
    for meal_type in ["breakfast", "lunch", "dinner", "snack"]:
        plan[meal_type] = get_meal_suggestion(meal_type, preference, category)
    return plan

def chatbot():
    print("👋 Welcome to the Food Suggestion Chatbot!")
    print("Type 'quit' to exit at any time.")

    while True:
        pref_input = input("Do you prefer vegetarian or non-vegetarian meals? ").lower()
        if "non" in pref_input:
            preference = "non_vegetarian"
            break
        elif "veg" in pref_input:
            preference = "vegetarian"
            break
        else:
            print("Please type 'vegetarian' or 'non-vegetarian'.")

    while True:
        category_input = input("Are you looking for 'healthy' food or 'comfort' food? ").lower()
        if category_input in ["healthy", "comfort"]:
            category = category_input
            break
        else:
            print("Please choose either 'healthy' or 'comfort'.")

    while True:
        user_input = input("You: ").lower()

        if "quit" in user_input:
            print("Bot: Goodbye! Enjoy your meals!")
            break
        elif "daily plan" in user_input or "daily meals" in user_input:
            daily_plan = suggest_daily_plan(preference, category)
            print("Bot: Here's your daily meal plan:")
            for meal_type, meal in daily_plan.items():
                print(f"  {meal_type.capitalize()}: {meal}")
        elif "breakfast" in user_input:
            print("Bot:", get_meal_suggestion("breakfast", preference, category))
        elif "lunch" in user_input:
            print("Bot:", get_meal_suggestion("lunch", preference, category))
        elif "dinner" in user_input:
            print("Bot:", get_meal_suggestion("dinner", preference, category))
        elif "snack" in user_input or "snacks" in user_input:
            print("Bot:", get_meal_suggestion("snack", preference, category))
        elif "what should i eat" in user_input or "what to eat" in user_input:
            meal_type = random.choice(["breakfast", "lunch", "dinner", "snack"])
            print(f"Bot: How about this for {meal_type}? {get_meal_suggestion(meal_type, preference, category)}")
        else:
            print("Bot: Ask me about breakfast, lunch, dinner, snacks, or say 'daily plan' for a full day meal plan.")


if __name__ == "__main__":
    chatbot()
