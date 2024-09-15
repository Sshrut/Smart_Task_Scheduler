import os
import re
import jwt
from datetime import datetime,timedelta
import calendar
from dateutil import parser
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from functools import wraps
from flask_sqlalchemy import SQLAlchemy
import spacy  # Import SpaCy
from textblob import TextBlob 

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
  # Enable CORS for the app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')  # Replace with a secure key

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

nlp = spacy.load('en_core_web_sm')  # Load SpaCy model

db = SQLAlchemy(app)

# Define database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    priority = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))

# Manually initialize the database tables
def create_tables():
    with app.app_context():
        db.create_all()

# Token validation decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            token = token.split()[1]  # Remove 'Bearer' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except Exception:
            return jsonify({'error': 'Invalid token!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# Custom parsing logic
def extract_task(text):
    # Extract the task part before any date/time references
    task_match = re.match(r'(.+?)(?:\b(by|at|before|on|next|tomorrow|end of this week|1st of next month)\b|$)', text, re.IGNORECASE)
    if task_match:
        return re.sub(r'\s+', ' ', task_match.group(1).strip())  # Extract everything before the date/time keyword
    return text.strip()

def extract_datetime(text):
    now = datetime.now()
    date = None
    time = None

    # Handle relative days like 'tomorrow', 'next Tuesday', etc.
    if "tomorrow" in text:
        date = now + timedelta(days=1)
    elif "next" in text:
        weekday = re.search(r'next (\w+)', text, re.IGNORECASE)
        if weekday:
            day_name = weekday.group(1).capitalize()
            if day_name in calendar.day_name:
                day_number = list(calendar.day_name).index(day_name)
                days_ahead = (day_number - now.weekday() + 7) % 7
                if days_ahead==0:
                    days_ahead+=7
                date = now + timedelta(days=days_ahead)
    elif any(day in text for day in calendar.day_name):
        weekday = re.search(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)', text, re.IGNORECASE).group(1)
        day_number = list(calendar.day_name).index(weekday)
        days_ahead = (day_number - now.weekday() + 7) % 7
        if days_ahead==0:
            days_ahead+=7
        date = now + timedelta(days=days_ahead)
    elif "end of this week" in text:
        days_until_sunday = (6 - now.weekday()) % 7
        date = now + timedelta(days=days_until_sunday)
    elif "1st of next month" in text:
        next_month = now.month % 12 + 1
        year = now.year + (1 if next_month == 1 else 0)
        date = datetime(year, next_month, 1)
    elif re.search(r'\d{1,2}(?:st|nd|rd|th) of (\w+)', text, re.IGNORECASE):
        day_match = re.search(r'(\d{1,2})(?:st|nd|rd|th) of (\w+)', text, re.IGNORECASE)
        day = int(day_match.group(1))
        month_name = day_match.group(2)
        month_number = list(calendar.month_name).index(month_name)
        date = datetime(now.year, month_number, day)
    else:
        date = None

    # Handle time mentions like '2:30pm', '3pm', or 'morning', 'afternoon'
    time_match = re.search(r'(\d{1,2}:\d{2}\s?[ap]m|\d{1,2}\s?[ap]m)', text, re.IGNORECASE)
    if time_match:
        try:
            time_str = time_match.group(1).replace(" ", "")
            time = parser.parse(time_str).strftime("%I:%M %p")
        except ValueError:
            time = None
    else:
        time_of_day_map = {
            "morning": "09:00 AM",
            "afternoon": "12:00 PM",
            "evening": "07:00 PM",
            "night": "08:00 PM",
            "noon": "12:00 PM",
        }
        for key, value in time_of_day_map.items():
            if key in text:
                time = value
                break

    # Adjust date to ensure it is not in the past
    if date:
        date = datetime.combine(date, datetime.min.time())
        if date < now:
            date = now + timedelta(days=7 - (now.weekday() - list(calendar.day_name).index(day_name)) % 7)

    if date and time:
        date = datetime.combine(date, parser.parse(time).time())
    elif date and not time:
        date = datetime.combine(date, datetime.min.time())
    
    date_str = date.strftime('%Y-%m-%d') if date else None
    return date_str, time

def extract_information(text):
    doc = nlp(text)  # Process text with SpaCy

    task = extract_task(text)
    date, time = extract_datetime(text)

    # Demonstrate named entity recognition with SpaCy
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    # Demonstrate sentiment analysis with TextBlob
    sentiment = TextBlob(text).sentiment

    task = re.sub(r'\b(for|the|to)\b', '', task).strip()
    task = re.sub(r'\s+', ' ', task)

    print("Extracted Entities:", entities)  # Output extracted entities to show NLP usage
    print("Sentiment Analysis:", sentiment)  # Output sentiment analysis to show NLP usage

    return {"Task": task, "Date": date, "Time": time, "Entities": entities, "Sentiment": sentiment}

# Register user
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'User already exists'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login user
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate JWT token
    token = jwt.encode({
        'sub': username,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token}), 200

# Add task (Protected route)
@app.route('/api/add-task', methods=['POST'])
@token_required
def add_task(current_user):
    data = request.json
    task = data.get('task')
    date_time_str = data.get('date')
    priority = data.get('priority')

    if not task:
        return jsonify({'error': 'Task description is required'}), 400

    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    

    if date_time_str:
        try:
            # Split the date and time if provided in a single string
            date_time_parts = date_time_str.split('T')
            date_str = date_time_parts[0]
            time_str = ' '.join(date_time_parts[1:]) if len(date_time_parts) > 1 else None

            # Use the provided date and time
            task_info = {"Task": task, "Date": date_str, "Time": time_str}
        except Exception as e:
            return jsonify({'error': f'Invalid date/time format: {str(e)}'}), 400
        
        task_info['dt']=date_time_str
    else:
        # If date and time are not provided, use NLP for extraction
        task_info = extract_information(task)
        # print(task_info)
        # print(type(task_info['Date']))
        # print(type(task_info['Time']))
        dstr=task_info["Date"]
        tstr=task_info["Time"]
        date_format = "%Y-%m-%d"
        time_format = "%I:%M %p"
        try:
        # Parse the date and time strings
            date_part = datetime.strptime(dstr, date_format)
            time_part = datetime.strptime(tstr, time_format).time()
        
        # Combine date and time into a single datetime object
            combined_datetime = datetime.combine(date_part, time_part)
        except:
            print("Error parsing date or time")
            return None


        task_info['dt']=combined_datetime
    
    # Use custom parsing logic to process the task description and extract relevant info
    if not task_info:
        return jsonify({'error': 'Could not process the task description'}), 500

    task_entry = Task(
        task=task_info['Task'],
        date=task_info['dt'],
        priority=priority,
        user_id=user.id
    )
    db.session.add(task_entry)
    db.session.commit()

    return jsonify({'message': 'Task added successfully', 'task': {
        'id': task_entry.id,
        'task': task_entry.task,
        'date': task_entry.date.isoformat(),
        'priority': task_entry.priority,
        'completed': task_entry.completed
    }}), 201

# Update task (Protected route)
@app.route('/api/update-task/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    data = request.json
    completed = data.get('completed')

    task = Task.query.filter_by(id=task_id, user=User.query.filter_by(username=current_user).first()).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    task.completed = completed
    db.session.commit()

    return jsonify({'message': 'Task updated successfully', 'task': {
        'id': task.id,
        'task': task.task,
        'date': task.date.isoformat(),
        'priority': task.priority,
        'completed': task.completed
    }}), 200

# Get tasks for the current user (Protected route)
@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_tasks = Task.query.filter_by(user_id=user.id).all()

    # Sort tasks by completion status, date, and priority
    user_tasks.sort(key=lambda t: (
        t.completed,  # Completed tasks last
        t.date,  # Date
        {'urgent': 1, 'high': 2, 'medium': 3, 'low': 4}.get(t.priority.lower(), 99)  # Priority
    ))

    tasks_list = [{
        'id': t.id,
        'task': t.task,
        'date': t.date.isoformat(),
        'priority': t.priority,
        'completed': t.completed
    } for t in user_tasks]

    return jsonify({'tasks': tasks_list}), 200

# Main entry point
if __name__ == '__main__':
    create_tables()  # Manually initialize the database tables
    app.run(host='0.0.0.0', port=8000)
    #app.run(debug=True)

