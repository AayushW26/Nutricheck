import React from 'react';
import './Product.css';

const Product = ({ product }) => {
    return (
        <div className="product-container">
            <div className="product-header">
                <h1 className="product-title">{product.product_name}</h1>
                <p className="product-brand">{product.brand_name}</p>
            </div>

            <div className="product-image">
                <img src={product.image_url} alt={product.product_name} />
            </div>

            <div className="nutrients-levels">
                <div className="nutrient">
                    <span className="nutrient-name">Calories:</span>
                    <span className="nutrient-value">{product.nutriments?.energy || 0} kcal</span>
                </div>
                <div className="nutrient">
                    <span className="nutrient-name">Protein:</span>
                    <span className="nutrient-value">{product.nutriments?.proteins || 0} g</span>
                </div>
                <div className="nutrient">
                    <span className="nutrient-name">Fat:</span>
                    <span className="nutrient-value">{product.nutriments?.fat || 0} g</span>
                </div>
                <div className="nutrient">
                    <span className="nutrient-name">Carbohydrates:</span>
                    <span className="nutrient-value">{product.nutriments?.carbohydrates || 0} g</span>
                </div>
            </div>

            {/* Add ingredients section */}
            <div className="ingredients-section">
                <h3>Ingredients</h3>
                <p className="ingredients-text">
                    {product.ingredients_text || "No ingredients information available"}
                </p>
            </div>
        </div>
    );
};

export default Product;