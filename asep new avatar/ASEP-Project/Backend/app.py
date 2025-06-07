from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Enables communication between frontend and backend

# Initialize Gemini
GOOGLE_API_KEY = ''  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')  # Change model to gemini-pro

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="NutriCheck"  # Correct database name
)

cursor = db.cursor(dictionary=True)

@app.route('/get_product', methods=['GET'])
def get_product():
    barcode = request.args.get('barcode')
    
    if not barcode:
        return jsonify({"error": "No barcode provided"}), 400

    query = "SELECT * FROM Food_Nutrients WHERE barcode = %s"
    cursor.execute(query, (barcode,))
    product = cursor.fetchone()

    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        context = data.get('context', '')  # Get context if provided
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Create prompt with context if available
        prompt = f"""As a nutrition expert, please provide advice about: {user_message}
        {context}
        Focus on providing evidence-based nutritional information and healthy eating recommendations."""

        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        # Check if response is valid
        if response and hasattr(response, 'text'):
            return jsonify({
                "success": True,
                "response": response.text,
                "status": 200
            })
        else:
            return jsonify({
                "success": False,
                "error": "Invalid response from AI model",
                "status": 500
            }), 500
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # For debugging
        return jsonify({
            "success": False,
            "error": f"Failed to process request: {str(e)}",
            "status": 500
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
