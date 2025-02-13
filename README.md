# Book Search and Exploration Platform
## Description
A modern, personalized book discovery application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features include book searching, saving, personal notes, and an AI-powered chatbot assistant for recommendations.
Features

1. Advanced book search using OpenLibrary API
2. User authentication and account management
3. Personal book collection management
4. Note-taking functionality for saved books
5. book recommendation chatbot
Responsive, user-friendly interface
![image](https://github.com/user-attachments/assets/69773fc7-008d-4276-be75-7db137006f66)

## Technologies Used

1. Frontend: React.js, Apollo Client, React Bootstrap
2. Backend: Node.js, Express.js, GraphQL, Apollo Server
3. Database: MongoDB
4. Authentication: JWT (JSON Web Tokens)
5. APIs: OpenLibrary API
6. Chatbot: FastAPI, Python

## Installation

Clone the repository:
``` bash

git clone [repository-url]
cd book-search
``` 
Install dependencies:

# Install root dependencies
``` bash
npm install
``` 
# Install client dependencies
``` bash
cd client
npm install
``` 
# Install server dependencies
``` bash
cd ../server
npm install
``` 
# Set up environment variables:
Create a .env file in the server directory:
``` bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
``` 
# Set up the chatbot:
``` bash
cd server/chatbot
python -m venv venv
source venv/bin/activate  
``` 
# On Windows: 
Please check requirements.txt
``` bash
venv\Scripts\activate
pip install <requirements.txt>
``` 
Start the development servers:
``` bash
Start main application (from root directory)
npm run develop
``` 
# Start chatbot server (optional)
cd server/chatbot
python -m uvicorn main:app --reload --port 8000

## Access the application:


1. Main application: http://localhost:3000
2. GraphQL playground: http://localhost:3001/graphql
3. Chatbot API: http://localhost:8000
![image](https://github.com/user-attachments/assets/39b2f32a-a483-424d-92e8-6ac2cc9444c0)

# Features Details
Book Search

1. Search by title, author, or keywords
2. View detailed book information
3. Save books to personal collection
4. Personal Notes

# Add notes to saved books
  ``` javascript 
mutation AddBookNote($bookId: String!, $note: String!) {
  addBookNote(bookId: $bookId, note: $note) {
    savedBooks {
      bookId
      notes {
        content
        createdAt
      }
    }
  }
}
 ```
![image](https://github.com/user-attachments/assets/04cd225d-6271-4094-8d6e-55434d3d9587)

# AI Chatbot

Get book recommendations
Ask about specific books
Receive personalized suggestions

# API Reference
OpenLibrary API
The application uses OpenLibrary's search API:
 https://openlibrary.org/search.json?q={searchTerm}
 
GraphQL Endpoints
``` javascript
Search books
query SearchBooks($searchTerm: String!) {
  searchBooks(searchTerm: $searchTerm) {
    books {
      bookId
      title
      authors
      description
    }
  }
}
``` 
# Save a book
``` javascript
mutation SaveBook($bookInput: SaveBookInput!) {
  saveBook(book: $bookInput) {
    _id
    savedBooks {
      bookId
      title
    }
  }
}
```
# Contributing

Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Submit a pull request

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

1. OpenLibrary API for book data
2. Original MERN project creators
3. MongoDB Atlas for database hosting

## Author

Shefreen Kaur

Contact

GitHub: shefreenkaur
Email: shefreenkaur@gmail.com
