from flask import Flask, render_template
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Firebase Realtime DB URL (to fetch data)
FIREBASE_DATA_URL = os.getenv("FIREBASE_URL")  # should end with /data.json
FIREBASE_CONFIG_URL = os.getenv("FIREBASE_DB_URL")  # base URL for JS Firebase init

# Dashboard Route
@app.route("/")
def dashboard():
    try:
        response = requests.get(FIREBASE_DATA_URL)
        data = response.json()
        if data is None:
            data = {}
    except Exception as e:
        data = {"error": str(e)}

    firebase_url = FIREBASE_CONFIG_URL

    firebase_config = {
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "databaseURL": os.getenv("FIREBASE_DB_URL"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID"),
        "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
    }

    return render_template("dashboard.html", data=data, firebase_config=firebase_config, firebase_url=firebase_url)