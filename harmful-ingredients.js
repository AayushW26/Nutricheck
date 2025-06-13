const HARMFUL_INGREDIENTS = {
    // Artificial Sweeteners
    'High Fructose Corn Syrup': 'Linked to obesity, Type 2 Diabetes, cardiovascular diseases, and non-alcoholic fatty liver disease.',
    'HFCS': 'Linked to obesity, Type 2 Diabetes, cardiovascular diseases, and non-alcoholic fatty liver disease.',
    'Aspartame': 'May cause headaches, digestive issues; not recommended for children.',
    'Sucralose': 'May alter gut microbiome; long-term effects under study.',
    'Acesulfame Potassium': 'Contains methylene chloride; may cause headaches and other symptoms.',
    
    // Trans Fats
    'Partially Hydrogenated': 'Contains trans fats linked to heart disease and increased bad cholesterol.',
    'Vanaspati': 'High in trans fats; linked to heart disease and increased bad cholesterol.',
    
    // Refined Ingredients
    'Maida': 'Refined flour lacking fiber; can contribute to blood sugar spikes and digestive issues.',
    'Refined Flour': 'Lacks fiber; can contribute to blood sugar spikes and digestive issues.',
    
    // Preservatives
    'MSG': 'May cause headaches, sweating, and digestive upset in sensitive individuals.',
    'Monosodium Glutamate': 'May cause headaches, sweating, and digestive upset in sensitive individuals.',
    'Sodium Benzoate': 'Can form carcinogenic benzene when combined with Vitamin C; may cause allergic reactions.',
    'BHA': 'Potential endocrine disruptor; possible carcinogenic effects in high doses.',
    'BHT': 'Potential endocrine disruptor; possible carcinogenic effects in high doses.',
    'TBHQ': 'Linked to stomach tumors and DNA damage in lab studies.',
    
    // Food Colors
    'Tartrazine': 'Can cause allergic reactions and behavioral issues in children.',
    'Sunset Yellow FCF': 'Linked to hyperactivity and allergic reactions.',
    'Ponceau 4R': 'May cause allergic reactions and behavioral issues.',
    'Brilliant Blue FCF': 'Known to cause chromosomal damage.',
    'Allura Red AC': 'Linked to chromosomal damage and hyperactivity.',
    'Fast Green FCF': 'Known to cause bladder tumors.',
    
    // Common Additives
    'Potassium Bromate': 'BANNED by FSSAI due to carcinogenic effects.',
    'Azodicarbonamide': 'Linked to respiratory issues and allergies.',
    'Sodium Metabisulfite': 'Can cause severe reactions in asthmatics.',
    'Propyl Gallate': 'Long-term use may increase cancer risk.',
    
    // Contaminants to Watch For
    'Lead': 'Toxic heavy metal; can cause neurological damage.',
    'Arsenic': 'Toxic heavy metal; can cause various health issues.',
    'Mercury': 'Toxic heavy metal; causes neurological damage.',
    'Cadmium': 'Toxic heavy metal; affects kidneys and bones.',
    'Aflatoxins': 'Naturally occurring toxins; highly carcinogenic.',
    'Patulin': 'Mycotoxin found in apple products; toxic.',
    'Ochratoxin A': 'Mycotoxin found in grains; toxic to kidneys.',
    
    // INS Numbers
    'INS 621': 'MSG - May cause adverse reactions in sensitive individuals.',
    'INS 211': 'Sodium Benzoate - Potential allergen and can form harmful compounds.',
    'INS 320': 'BHA - Possible carcinogenic effects.',
    'INS 321': 'BHT - Possible carcinogenic effects.',
    'INS 319': 'TBHQ - Linked to stomach tumors.',
    'INS 102': 'Tartrazine - Can cause allergic reactions.',
    'INS 110': 'Sunset Yellow - Linked to hyperactivity.',
    'INS 133': 'Brilliant Blue FCF - May cause chromosomal damage.',
    'INS 129': 'Allura Red - Linked to hyperactivity.',
    'INS 143': 'Fast Green FCF - Known to cause tumors.'
};
