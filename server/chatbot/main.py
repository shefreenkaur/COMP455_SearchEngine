from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_book_details(title: str) -> str:
    try:
        # Make the search more specific
        response = requests.get(
            f"https://openlibrary.org/search.json?title={title}&fields=title,author_name,first_publish_year,description,subject&limit=1"
        )
        data = response.json()
        
        if not data.get('docs'):
            return f"I couldn't find detailed information about {title}."
            
        book = data['docs'][0]
        title = book.get('title', '')
        authors = ', '.join(book.get('author_name', ['Unknown']))
        year = book.get('first_publish_year', '')
        subjects = ', '.join(book.get('subject', [])[:5])  
        
        response = f"'{title}' by {authors} ({year}). "
        if subjects:
            response += f"This book is categorized as {subjects}. "
        
        return response
    except:
        return "Sorry, I had trouble finding information about that book."

def get_recommendations(genre: str) -> str:
    try:
        response = requests.get(
            f"https://openlibrary.org/search.json?subject={genre}&sort=rating&limit=3"
        )
        data = response.json()
        
        if not data.get('docs'):
            return f"I couldn't find any {genre} books at the moment."
            
        books = data['docs'][:3]
        recommendations = []
        for book in books:
            title = book.get('title')
            author = book.get('author_name', ['Unknown'])[0]
            recommendations.append(f"'{title}' by {author}")
            
        return "Here are some popular " + genre + " books you might enjoy: " + "; ".join(recommendations)
    except:
        return f"Sorry, I had trouble finding {genre} book recommendations."

@app.post("/chat")
async def chat(request: Dict[str, str]):
    user_message = request.get('message', '').lower().strip()
    
    if not user_message:
        return {"response": "Please ask me something about books!"}

    # Handle specific book inquiries
    if "describe" in user_message or "tell me about" in user_message or "what is" in user_message:
        # Extract book title - remove common phrases
        title = user_message.replace("describe", "").replace("tell me about", "").replace("what is", "").strip()
        return {"response": get_book_details(title)}
    
    # Handle recommendations
    if "recommend" in user_message or "suggest" in user_message:
        for genre in ["fantasy", "science fiction", "mystery", "romance", "thriller", "horror"]:
            if genre in user_message:
                return {"response": get_recommendations(genre)}
        return {"response": "What genre of books do you enjoy? I can recommend fantasy, science fiction, mystery, romance, thriller, or horror books!"}
    
    # Handle general book search
    if len(user_message.split()) <= 3:  # If it's a short query, assume it's a book title
        return {"response": get_book_details(user_message)}
    
    return {"response": "I can help you find books! Try:\n1. Ask about a specific book \n2. Get recommendations \n3. Search for books by title"}