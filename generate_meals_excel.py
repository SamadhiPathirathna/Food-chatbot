import pandas as pd
import random

# Base meal data similar to your existing meals.py structure but expanded
meal_types = ["breakfast", "lunch", "dinner", "snack"]
preferences = ["vegetarian", "non_vegetarian"]
categories = ["healthy", "comfort"]

# Sample food items per category (expand as needed)
sample_foods = {
    "breakfast": {
        "vegetarian": {
            "healthy": [
                "Oatmeal with berries and chia seeds",
                "Avocado toast with cherry tomatoes",
                "Smoothie bowl with banana and spinach",
                "Greek yogurt with honey and walnuts",
                "Whole grain cereal with almond milk"
            ],
            "comfort": [
                "Pancakes with maple syrup",
                "French toast with powdered sugar",
                "Cream cheese bagel with jam",
                "Cinnamon rolls",
                "Cheese and tomato omelette"
            ]
        },
        "non_vegetarian": {
            "healthy": [
                "Egg white omelette with spinach",
                "Boiled eggs with avocado slices",
                "Smoked salmon on whole wheat toast",
                "Turkey bacon and scrambled eggs",
                "Chicken sausage with grilled veggies"
            ],
            "comfort": [
                "Bacon and eggs with toast",
                "Sausage sandwich with cheese",
                "Breakfast burrito with eggs and ham",
                "Ham and cheese croissant",
                "Fried eggs with hash browns"
            ]
        }
    },
    "lunch": {
        "vegetarian": {
            "healthy": [
                "Grilled veggie wrap with hummus",
                "Lentil salad with cucumber and tomato",
                "Quinoa bowl with roasted vegetables",
                "Caprese salad with basil and mozzarella",
                "Stuffed bell peppers with rice and beans"
            ],
            "comfort": [
                "Cheesy pasta with marinara sauce",
                "Vegetable curry with basmati rice",
                "Mac and cheese",
                "Vegetable lasagna",
                "Grilled cheese sandwich with tomato soup"
            ]
        },
        "non_vegetarian": {
            "healthy": [
                "Grilled chicken salad with mixed greens",
                "Baked fish with steamed vegetables",
                "Turkey and avocado sandwich",
                "Shrimp and quinoa salad",
                "Chicken stir-fry with broccoli and peppers"
            ],
            "comfort": [
                "Chicken biryani",
                "Beef burger with fries",
                "Pulled pork sandwich",
                "Fried chicken with mashed potatoes",
                "Spaghetti and meatballs"
            ]
        }
    },
    "dinner": {
        "vegetarian": {
            "healthy": [
                "Vegetable soup with kale and beans",
                "Stir-fried tofu with broccoli and peppers",
                "Grilled portobello mushrooms with quinoa",
                "Zucchini noodles with pesto sauce",
                "Roasted vegetable medley with couscous"
            ],
            "comfort": [
                "Paneer butter masala with naan",
                "Mac and cheese",
                "Vegetable pot pie",
                "Spinach and cheese stuffed shells",
                "Cheese enchiladas"
            ]
        },
        "non_vegetarian": {
            "healthy": [
                "Baked salmon with asparagus",
                "Chicken stir-fry with vegetables",
                "Grilled shrimp with quinoa salad",
                "Turkey meatloaf with green beans",
                "Seared tuna with mixed greens"
            ],
            "comfort": [
                "Fried rice with chicken",
                "Beef stew with carrots and potatoes",
                "Roast chicken with stuffing",
                "Spaghetti carbonara",
                "BBQ ribs with coleslaw"
            ]
        }
    },
    "snack": {
        "vegetarian": {
            "healthy": [
                "Fruit salad with mint",
                "Mixed nuts and dried fruit",
                "Carrot sticks with hummus",
                "Greek yogurt with blueberries",
                "Rice cakes with almond butter"
            ],
            "comfort": [
                "Cheese toast",
                "Chocolate chip cookies",
                "Pretzels with cheese dip",
                "Banana bread",
                "Granola bars"
            ]
        },
        "non_vegetarian": {
            "healthy": [
                "Boiled eggs",
                "Grilled chicken strips",
                "Turkey jerky",
                "Smoked salmon cucumber bites",
                "Tuna salad on celery sticks"
            ],
            "comfort": [
                "Chicken nuggets",
                "Meat pies",
                "Sausage rolls",
                "Buffalo wings",
                "Pork rinds"
            ]
        }
    }
}

# Generate data rows
data = []
for _ in range(200):
    meal_type = random.choice(meal_types)
    preference = random.choice(preferences)
    category = random.choice(categories)
    food_list = sample_foods[meal_type][preference][category]
    suggestion = random.choice(food_list)
    data.append({
        "meal_type": meal_type,
        "preference": preference,
        "category": category,
        "suggestion": suggestion
    })

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
df.to_excel("meals_dataset_200.xlsx", index=False)

print("Excel file 'meals_dataset_200.xlsx' created successfully!")
