# 📝 Smart Task Scheduler

The Smart Task Scheduler is a productivity application designed to help users manage their tasks efficiently. It leverages Natural Language Processing (NLP) to automatically extract due dates and times from task descriptions, ensuring tasks are always scheduled appropriately. If a user doesn't provide a due date, the system attempts to determine it from the description. The project uses a modern web tech stack with Flask for the backend, React for the frontend, and deploys on AWS for scalability and performance.

## 🌟 Features

- **NLP-powered Task Scheduling**: Extract due dates from task descriptions using NLP if not explicitly provided.
- **MySQL Database**: Securely store tasks in AWS RDS MySQL.
- **User-friendly Interface**: Interactive and responsive React frontend for managing tasks.
- **Cloud-hosted**: Deployed using AWS services (S3 for frontend, Elastic Beanstalk for backend).
- **CI/CD Pipeline**: Integrated continuous integration and deployment (CI/CD) with AWS CodePipeline and CodeBuild.

## 🚀 Tech Stack

**Backend:**

- Flask: Python micro-framework to create the RESTful API.


**Frontend:**

- React: JavaScript library for building the user interface.

**Database:**

- AWS RDS MySQL: Managed MySQL database for storing tasks.

**Cloud Deployment:**

- Frontend: Deployed as a static website on AWS S3.
- Backend: Deployed on AWS Elastic Beanstalk for scalable and reliable API hosting.

**CI/CD Pipeline:**

- AWS CodePipeline & CodeBuild: Automates deployment from GitHub using webhooks and buildspec.yml.

## 📂 Project Structure

The project is organized into two main directories: frontend and backend.

```
smart-task-scheduler/
│
├── backend/
│   ├── app.py                   # Flask application entry point
│   ├── buildspec.yml             # Build specifications for AWS CodeBuild
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Elastic Beanstalk process file
│   ├── aws-eb-cli-setup/         # AWS EB CLI setup files
│   ├── .elasticbeanstalk/        # Elastic Beanstalk configuration folder
│   └── README.md                 # Backend-specific readme (optional)
│
├── frontend/
│   ├── public/                   # Static assets (index.html, favicon, etc.)
│   ├── src/                      # React components, hooks, and utils
│   ├── .gitignore                # Files to ignore in Git
│   ├── buildspec.yml             # Buildspec for AWS CodeBuild (frontend deployment)
│   ├── package-lock.json         # Lock file for npm packages
│   ├── package.json              # Frontend project metadata and dependencies
│   └── README.md                 # Frontend-specific readme (optional)
│
└── README.md                     # Main project readme (this file)
```

## 📦 Installation and Setup

### 1. Backend Setup:

**Prerequisites:**

- Python 3.x
- MySQL (or AWS RDS MySQL)
- Flask

**Steps:**

Clone the repository:

```bash
git clone https://github.com/Sshrut/smart_task_scheduler.git
cd smart_task_scheduler/backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Configure the database:

Set up a MySQL database locally or use AWS RDS.

Update the database URI in your Flask configuration:

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://<username>:<password>@<db-endpoint>:3306/<database>'
```

Run the Flask application:

```bash
python app.py
```


### 2. Frontend Setup:

**Prerequisites:**

- Node.js
- npm (Node Package Manager)

**Steps:**

Navigate to the frontend directory:

```bash
cd frontend/smart-task-scheduler
```

- Open the `.env` file and set `REACT_APP_API_URL` to http://localhost:portnumber (backend).

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```




### 3. Deployment

#### AWS Deployment

#### Backend Deployment:

- Use Elastic Beanstalk Deployment:
  - Use Procfile to define how the app should run.
  - Deploy the backend via AWS Elastic Beanstalk using the .elasticbeanstalk configurations.
- Database: Managed by AWS RDS MySQL.

#### Frontend Deployment:

- Open the `.env` file and set `REACT_APP_API_URL` to your Elastic Beanstalk URL.
- Run `npm run build` which will create a build folder in the same directory as your `package.json`.
- Upload everything from the build directory to an S3 bucket and enable static website hosting.

### CI/CD Setup

**AWS CodeBuild & CodePipeline:**

- The project uses AWS CodePipeline to automate deployments on GitHub pushes.
- Use the buildspec.yml files in both the backend and frontend directories to define the build and deployment steps.

**Webhooks:**

- Configure GitHub webhooks to trigger AWS CodePipeline on code pushes.

## 🧠 NLP for Task Scheduling

The backend incorporates NLP (Natural Language Processing) to automatically extract due dates and times from task descriptions. If a task is entered without a due date, the system uses NLP to determine and extract date-related information.

**Example:**

**Task:**

"Finish the project report by next Tuesday."

**Extracted Due Date:**

Next Tuesday (calculated based on the current date when the task is added).

## 📖 Usage

- Add a task: Enter a task description, optionally providing a due date.
- Automatic Date Extraction: If a due date isn't explicitly provided, the system uses NLP to attempt to infer one from the task description.
- Task Management: View, update, or delete tasks from the UI.

## 🛠 Future Enhancements

- User Authentication: Enable user accounts for personalized task management.
- Task Prioritization: Implement a system to prioritize tasks based on urgency or importance.
- Notifications: Add email or push notifications for upcoming deadlines.
- Enhanced NLP: Improve NLP capabilities to recognize a wider variety of date and time formats. We can leverage various pretrained models available in the market to enhance our NLP features, such as BERT, GPT, or spaCy, which offer advanced natural language understanding and processing capabilities.

## 🤝 Contributing

Contributions are welcome! Here's how you can get involved:

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m 'Add some feature'
```

4. Push the branch:

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more details.

## 🧑‍💻 Author

**Sshrut**

GitHub: [@Sshrut](https://github.com/Sshrut)
