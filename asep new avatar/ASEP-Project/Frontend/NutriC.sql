CREATE DATABASE Nutricheck;
USE Nutricheck;



CREATE TABLE Food_Nutrients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    calories FLOAT NOT NULL,
    protein FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    carbohydrates FLOAT NOT NULL,
    fiber FLOAT NOT NULL,
    sugar FLOAT NOT NULL,
    sodium FLOAT NOT NULL,

);

-- Insert data with remarks
INSERT INTO Food_Nutrients (barcode, name, calories, protein, fat, carbohydrates, fiber, sugar, sodium)
VALUES 
    ('8901058905090', 'Maggi Noodles', 420, 8.5, 17.8, 55.5, 2.6, 3.5, 980),
    ('8901491101539', 'Lays Classic Salted', 536, 6.5, 34.8, 52.5, 4.8, 0.6, 580, 'High in fat and carbohydrates'),
    ('8901764029380', 'Kurkure Masala Munch', 550, 6.2, 35.0, 53.5, 4.5, 2.8, 920, 'Contains artificial flavors'),
    ('8906013030640', 'Bingo Mad Angles', 520, 6.0, 32.5, 54.0, 4.0, 1.2, 750, 'Moderate sodium content'),
    ('8906001050484', 'Britannia Bourbon', 480, 4.8, 20.5, 68.0, 2.5, 28.0, 450, 'High in sugar and fat'),
    ('7622201741471', 'Oreo Biscuits', 480, 4.7, 19.7, 69.0, 2.0, 38.0, 490, 'Very high in sugar'),
    ('8901764031048', 'Unibic Choco Chip Cookies', 525, 5.0, 27.5, 62.0, 3.5, 34.0, 480, 'High sugar content'),
    ('8901765110025', 'Dark Fantasy Choco Fills', 520, 5.5, 30.0, 58.5, 3.8, 32.5, 420, 'Rich in chocolate and fat');
    
    ALTER TABLE food_nutrients
ADD COLUMN analysis VARCHAR(255),
ADD COLUMN allergen VARCHAR(255),
ADD COLUMN alternative VARCHAR(255);

DESCRIBE food_nutrients;

INSERT INTO food_nutrients 
    (barcode, name, calories, protein, fat, carbohydrates, fiber, sugar, sodium, analysis, allergen, alternative) 
VALUES 
    ('8901491504782', 'Lay\'s West Indies Hot \'n\' Sweet Chilli', 540, 6.7, 32.5, 54.9, 0, 6, 673, 
     'High fat content, moderate sugar, high sodium', 'Milk', 
     'Baked potato chips, Air-popped popcorn, Vegetable chips'),

    ('7622202272639', 'Dairy Milk Chocolate', 550, 7.8, 30.5, 58.0, 2.5, 52.5, 40, 
     'High sugar, processed', 'Dairy', 
     'Dark chocolate 85% cocoa'),

    ('8904004404647', 'Haldiram\'s Salted Peanuts', 637, 20.62, 51.91, 21.85, 3.33, 0, 425, 
     'High fat content, moderate protein, low sugar', 'Peanuts', 
     'Roasted almonds, Baked chickpeas, Sunflower seeds'),

    ('8901764012273', 'Coca-Cola (475 ml)', 194, 0, 0, 51.8, 0, 51.8, 43, 
     'High sugar content, no fat or protein', 'None', 
     'Sparkling water, Diet cola, Fruit-infused water');
     
     SELECT * FROM food_nutrients;
     
     INSERT INTO food_nutrients 
    (barcode, name, calories, protein, fat, carbohydrates, fiber, sugar, sodium, analysis, allergen, alternative) 
VALUES 
('8901058006025', 'Maggi Noodles', 420, 8.5, 17.8, 55.5, 2.6, 3.5, 980, 
'Processed food, high sodium content', 'Gluten', 'Homemade whole wheat pasta');

SELECT * FROM food_nutrients;

