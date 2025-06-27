import unittest
from app import app
from unittest.mock import patch

class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_homepage(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"<!DOCTYPE html>", response.data)

    def test_get_suggestion_with_mock(self):
        # 👇 Patch the random.choice used in chatbot.py
        with patch("chatbot.random.choice", return_value="Egg white omelette"):
            response = self.client.get("/suggest?type=breakfast&preference=non_vegetarian&category=healthy")
            self.assertEqual(response.status_code, 200)
            self.assertIn("Egg white omelette", response.get_data(as_text=True))

    def test_daily_plan_with_mock(self):
        with patch("chatbot.random.choice", return_value="Mock Meal"):
            response = self.client.get("/suggest?type=daily_plan&preference=vegetarian&category=comfort")
            self.assertEqual(response.status_code, 200)
            self.assertIn("Mock Meal", response.get_data(as_text=True))

    def test_missing_params(self):
        response = self.client.get("/suggest?type=lunch")
        self.assertEqual(response.status_code, 400)

if __name__ == "__main__":
    unittest.main()
