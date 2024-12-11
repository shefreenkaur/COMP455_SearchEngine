import requests
import pandas as pd
import json

def fetch_books_data(query, max_results=100):
    books_data = []
    base_url = 'https://openlibrary.org/search.json'
    
    response = requests.get(f"{base_url}?q={query}&limit={max_results}")
    data = response.json()
    
    if 'docs' in data:
        for book in data['docs']:
            books_data.append({
                "title": book.get('title', ''),
                "authors": book.get('author_name', []),
                "description": book.get('description', ''),
                "first_publish_year": book.get('first_publish_year', ''),
                "subject": book.get('subject', [])
            })
    
    return books_data

# Collect data
categories = ['fiction', 'science', 'history']
all_books = []

for category in categories:
    books = fetch_books_data(category)
    all_books.extend(books)

# Save to JSON
with open('books_data.json', 'w') as f:
    json.dump(all_books, f, indent=4)