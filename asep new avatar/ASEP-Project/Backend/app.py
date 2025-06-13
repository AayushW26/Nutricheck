from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)  # Enables communication between frontend and backend

# Initialize Gemini
GOOGLE_API_KEY = 'AIzaSyCfgPZn0kZZPmk5eaaVvlkR-SrGH2rXH4k'  # Replace with your actual API key
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')  # Change model to gemini-pro

# Update database connection to use connection pooling
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "WWWase@2006",
    "database": "NutriCheck"
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

@app.route('/get_product', methods=['GET'])
def get_product():
    try:
        barcode = request.args.get('barcode')
        print(f"Received barcode: {barcode}")  # Debug print
        
        if not barcode:
            return jsonify({"error": "No barcode provided"}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        
        # Updated query with proper column names
        query = """
            SELECT name, barcode, calories, protein, carbohydrates, 
                   fat, fiber, sugar, sodium, analysis, allergen, alternative
            FROM Food_Nutrients 
            WHERE barcode = %s
        """
        cursor.execute(query, (barcode,))
        product = cursor.fetchone()
        
        print(f"Query result: {product}")  # Debug print
        
        if product:
            # Add ingredient analysis using Gemini
            ingredients_prompt = f"""Analyze the ingredients in {product.get('name', 'this product')} and categorize them into:
            1. Main Ingredients
            2. Preservatives
            3. Food Additives
            4. Artificial Colors
            5. Minerals & Vitamins
            6. Chemicals/Synthetic Ingredients"""

            ingredients_response = model.generate_content(ingredients_prompt)
            
            if ingredients_response and hasattr(ingredients_response, 'text'):
                try:
                    ingredients_analysis = json.loads(ingredients_response.text.strip('`').replace('json\n', '').replace('\n', ''))
                    product['ingredients_analysis'] = ingredients_analysis
                except json.JSONDecodeError:
                    product['ingredients_analysis'] = {}
            
            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404

    except mysql.connector.Error as err:
        print(f"Database error: {err}")  # Debug print
        return jsonify({"error": f"Database error: {str(err)}"}), 500
    except Exception as e:
        print(f"General error: {e}")  # Debug print
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection.is_connected():
            connection.close()

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

@app.route('/search_product', methods=['POST'])
def search_product():
    try:
        data = request.json
        product_name = data.get('product')
        
        if not product_name:
            return jsonify({"error": "No product name provided"}), 400

        # Modified prompt to include ingredients
        prompt = f"""Analyze the nutritional content and ingredients of {product_name} and provide the following information in JSON format:
        - calories (in kcal)
        - protein (in g)
        - carbohydrates (in g)
        - fat (in g)
        - saturated_fat (in g)
        - fiber (in g)
        - sugar (in g)
        - sodium (in mg)
        - ingredients (as an array of objects with 'name' and 'category' properties)
        
        For ingredients, categorize them as:
        - Main ingredients
        - Additives
        - Preservatives
        - Vitamins and minerals
        Return only the JSON object with these values."""

        response = model.generate_content(prompt)
        
        if response and hasattr(response, 'text'):
            try:
                json_str = response.text.strip('`').replace('json\n', '').replace('\n', '')
                nutrients = json.loads(json_str)
                
                # Add analysis for both nutrients and ingredients
                analysis_prompt = f"""Analyze the following for {product_name}:
                1. Nutritional values:
                Calories: {nutrients.get('calories')} kcal
                Sugar: {nutrients.get('sugar')}g
                Sodium: {nutrients.get('sodium')}mg
                Fat: {nutrients.get('fat')}g
                Saturated Fat: {nutrients.get('saturated_fat')}g
                
                2. Ingredients composition:
                {json.dumps(nutrients.get('ingredients', []), indent=2)}
                
                Provide analysis based on:
                - FSSAI guidelines for nutrients
                - Presence of artificial additives and preservatives
                - Overall healthiness of ingredients"""
                
                analysis_response = model.generate_content(analysis_prompt)
                nutrients['analysis'] = analysis_response.text if analysis_response else ''
                
                return jsonify(nutrients)
            except json.JSONDecodeError:
                return jsonify({"error": "Failed to parse nutrition data"}), 500
        else:
            return jsonify({"error": "No response from AI model"}), 500
            
    except Exception as e:
        print(f"Error in search_product endpoint: {str(e)}")
        return jsonify({
            "error": f"Failed to process request: {str(e)}",
            "status": 500
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
