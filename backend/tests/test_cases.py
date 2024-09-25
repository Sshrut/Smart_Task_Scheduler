import unittest
import json
import os
from datetime import datetime

# Set the SQLALCHEMY_DATABASE_URI environment variable before importing app1
os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

from app import app, db, User, Task

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register(self):
        response = self.app.post('/api/register',
                                 data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.get_data(as_text=True))

    def test_login(self):
        self.app.post('/api/register',
                      data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                      content_type='application/json')
        response = self.app.post('/api/login',
                                 data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', json.loads(response.get_data(as_text=True)))

    def test_add_task(self):
        self.app.post('/api/register',
                      data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                      content_type='application/json')
        login_response = self.app.post('/api/login',
                                       data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                       content_type='application/json')
        token = json.loads(login_response.get_data(as_text=True))['token']
        date_time_obj = datetime(2023, 10, 1, 10, 0)
        response = self.app.post('/api/add-task',
                                 data=json.dumps({'task': 'Test Task', 'date': date_time_obj.isoformat(), 'priority': 'High'}),
                                 content_type='application/json',
                                 headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('Task added successfully', response.get_data(as_text=True))

    def test_update_task(self):
        self.app.post('/api/register',
                      data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                      content_type='application/json')
        login_response = self.app.post('/api/login',
                                       data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                       content_type='application/json')
        token = json.loads(login_response.get_data(as_text=True))['token']
        date_time_obj = datetime(2023, 10, 1, 10, 0)
        self.app.post('/api/add-task',
                      data=json.dumps({'task': 'Test Task', 'date': date_time_obj.isoformat(), 'priority': 'High'}),
                      content_type='application/json',
                      headers={'Authorization': f'Bearer {token}'}
        )
        response = self.app.put('/api/update-task/1',
                                data=json.dumps({'completed': True}),
                                content_type='application/json',
                                headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('Task updated successfully', response.get_data(as_text=True))

    def test_get_user(self):
        self.app.post('/api/register',
                      data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                      content_type='application/json')
        login_response = self.app.post('/api/login',
                                       data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                       content_type='application/json')
        token = json.loads(login_response.get_data(as_text=True))['token']
        response = self.app.get('/api/user',
                                headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('username', json.loads(response.get_data(as_text=True)))

    def test_get_tasks(self):
        self.app.post('/api/register',
                      data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                      content_type='application/json')
        login_response = self.app.post('/api/login',
                                       data=json.dumps({'username': 'testuser', 'password': 'testpass'}),
                                       content_type='application/json')
        token = json.loads(login_response.get_data(as_text=True))['token']
        date_time_obj = datetime(2023, 10, 1, 10, 0)
        self.app.post('/api/add-task',
                      data=json.dumps({'task': 'Test Task', 'date': date_time_obj.isoformat(), 'priority': 'High'}),
                      content_type='application/json',
                      headers={'Authorization': f'Bearer {token}'}
        )
        response = self.app.get('/api/tasks',
                                headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('tasks', json.loads(response.get_data(as_text=True)))

if __name__ == '__main__':
    unittest.main()

