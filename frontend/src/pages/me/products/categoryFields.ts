/**
 * Category-driven field configuration for the Add Product form.
 *
 * Each category exposes:
 *  - `variantOptions`: variant axes a buyer picks (Size, Color, Volume, …)
 *    These produce SKU combinations and let the buyer choose what to order.
 *  - `attributes`: free-form descriptor fields the seller fills in once
 *    (Material, Brand, Power, Expiry date, …). Surfaced on the product page.
 *
 * Keep keys stable — they are persisted on the product document.
 */

export type AttributeKind = "text" | "number" | "select" | "textarea" | "date";

export interface AttributeField {
  key: string;
  label: string;
  kind: AttributeKind;
  placeholder?: string;
  hint?: string;
  options?: string[];
  optional?: boolean;
}

export interface VariantAxis {
  name: string;
  hint?: string;
  suggestions: string[];
  required?: boolean;
}

export interface CategoryConfig {
  label: string;
  description: string;
  variantOptions: VariantAxis[];
  attributes: AttributeField[];
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  fashion: {
    label: "Fashion & Accessories",
    description:
      "Clothing, shoes, bags, accessories. Buyers pick a size and color before ordering.",
    variantOptions: [
      {
        name: "Size",
        required: true,
        suggestions: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
      },
      {
        name: "Color",
        required: true,
        suggestions: ["Black", "White", "Beige", "Navy", "Red", "Pink", "Olive"],
      },
    ],
    attributes: [
      {
        key: "material",
        label: "Material",
        kind: "text",
        placeholder: "e.g. 100% cotton, linen blend",
      },
      {
        key: "fit",
        label: "Fit",
        kind: "select",
        options: ["Slim", "Regular", "Oversized", "Loose"],
        optional: true,
      },
      {
        key: "gender",
        label: "Gender",
        kind: "select",
        options: ["Unisex", "Women", "Men", "Kids"],
      },
      { key: "careInstructions", label: "Care instructions", kind: "textarea", optional: true },
    ],
  },

  electronics: {
    label: "Electronics & Gadgets",
    description: "Tech products. Variants typically capture color, storage, and connectivity.",
    variantOptions: [
      {
        name: "Color",
        suggestions: ["Black", "Silver", "Space Gray", "White", "Gold"],
      },
      {
        name: "Storage",
        suggestions: ["64GB", "128GB", "256GB", "512GB", "1TB"],
      },
      {
        name: "Connectivity",
        suggestions: ["Wi-Fi", "Wi-Fi + Cellular", "Bluetooth"],
        required: false,
      },
    ],
    attributes: [
      { key: "brand", label: "Brand", kind: "text", placeholder: "e.g. Sony, Anker" },
      { key: "model", label: "Model number", kind: "text" },
      { key: "warranty", label: "Warranty period", kind: "text", placeholder: "e.g. 12 months" },
      {
        key: "powerSource",
        label: "Power source",
        kind: "select",
        options: ["Battery", "AC adapter", "USB-C", "Rechargeable"],
        optional: true,
      },
      { key: "specifications", label: "Key specifications", kind: "textarea", optional: true },
    ],
  },

  beauty: {
    label: "Beauty & Personal Care",
    description: "Skincare, makeup, fragrance. Variants describe shade and net weight.",
    variantOptions: [
      {
        name: "Volume",
        suggestions: ["15 ml", "30 ml", "50 ml", "100 ml", "200 ml"],
      },
      {
        name: "Shade",
        suggestions: ["01 Ivory", "02 Beige", "03 Honey", "04 Caramel"],
        required: false,
      },
    ],
    attributes: [
      {
        key: "skinType",
        label: "Skin type",
        kind: "select",
        options: ["All skin types", "Oily", "Dry", "Combination", "Sensitive"],
      },
      { key: "ingredients", label: "Key ingredients", kind: "textarea" },
      { key: "expiry", label: "Expiry / PAO", kind: "text", placeholder: "e.g. 12M after opening" },
      { key: "crueltyFree", label: "Cruelty-free?", kind: "select", options: ["Yes", "No"], optional: true },
    ],
  },

  food: {
    label: "Food & Beverages",
    description: "Edible goods. Capture pack size and expiry — required for compliance.",
    variantOptions: [
      {
        name: "Pack Size",
        suggestions: ["100g", "250g", "500g", "1kg", "Family Pack"],
      },
      {
        name: "Flavor",
        suggestions: ["Original", "Spicy", "Sweet", "Salty"],
        required: false,
      },
    ],
    attributes: [
      { key: "ingredients", label: "Ingredients", kind: "textarea" },
      { key: "expiry", label: "Expiry date", kind: "date" },
      { key: "storage", label: "Storage instructions", kind: "text", placeholder: "e.g. Refrigerate after opening" },
      {
        key: "dietary",
        label: "Dietary",
        kind: "select",
        options: ["—", "Halal", "Vegan", "Vegetarian", "Gluten-free"],
        optional: true,
      },
      { key: "allergens", label: "Allergen warnings", kind: "text", optional: true },
    ],
  },

  home: {
    label: "Home & Living",
    description: "Furniture, décor, kitchenware. Capture material and dimensions.",
    variantOptions: [
      { name: "Color", suggestions: ["Natural", "White", "Black", "Walnut", "Beige"] },
      { name: "Size", suggestions: ["Small", "Medium", "Large"], required: false },
    ],
    attributes: [
      { key: "material", label: "Material", kind: "text" },
      { key: "roomType", label: "Suitable room", kind: "text", optional: true },
      { key: "assembly", label: "Assembly required?", kind: "select", options: ["No", "Yes"], optional: true },
    ],
  },

  mother_baby: {
    label: "Mother & Baby",
    description: "Baby products. Variant on age range, capture safety info.",
    variantOptions: [
      { name: "Age Range", required: true, suggestions: ["0-3M", "3-6M", "6-12M", "1-2Y", "2-4Y"] },
      { name: "Color", suggestions: ["Pink", "Blue", "Yellow", "White"], required: false },
    ],
    attributes: [
      { key: "ageGroup", label: "Recommended age", kind: "text" },
      { key: "safetyCert", label: "Safety certification", kind: "text", optional: true },
      { key: "material", label: "Material", kind: "text" },
    ],
  },

  toys: {
    label: "Toys & Hobbies",
    description: "Toys, models, hobbies. Variant on color, capture age range.",
    variantOptions: [
      { name: "Color", suggestions: ["Red", "Blue", "Green", "Yellow"], required: false },
      { name: "Size", suggestions: ["S", "M", "L"], required: false },
    ],
    attributes: [
      { key: "ageGroup", label: "Recommended age", kind: "text", placeholder: "e.g. 6+" },
      { key: "material", label: "Material", kind: "text" },
      { key: "batteryRequired", label: "Battery required?", kind: "select", options: ["No", "Yes"], optional: true },
    ],
  },

  sports: {
    label: "Sports & Outdoors",
    description: "Sports gear. Variant on size and color, capture sport.",
    variantOptions: [
      { name: "Size", required: true, suggestions: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", suggestions: ["Black", "White", "Red", "Blue"], required: false },
    ],
    attributes: [
      { key: "sport", label: "Sport / activity", kind: "text", placeholder: "e.g. Running, Yoga" },
      { key: "material", label: "Material", kind: "text", optional: true },
      { key: "gender", label: "Gender", kind: "select", options: ["Unisex", "Women", "Men", "Kids"] },
    ],
  },

  automotive: {
    label: "Automotive",
    description: "Car & moto parts. Capture compatibility info.",
    variantOptions: [
      { name: "Color", suggestions: ["Black", "Silver", "Carbon"], required: false },
    ],
    attributes: [
      { key: "compatibility", label: "Vehicle compatibility", kind: "textarea", placeholder: "e.g. Toyota Vios 2014-2019" },
      { key: "partNumber", label: "Part number / OEM", kind: "text", optional: true },
      { key: "material", label: "Material", kind: "text", optional: true },
    ],
  },

  health: {
    label: "Health & Wellness",
    description: "Vitamins, supplements, medical aids. Variant on pack count.",
    variantOptions: [
      { name: "Pack Size", suggestions: ["30 capsules", "60 capsules", "90 capsules"] },
    ],
    attributes: [
      { key: "ingredients", label: "Active ingredients", kind: "textarea" },
      { key: "dosage", label: "Recommended dosage", kind: "text" },
      { key: "expiry", label: "Expiry date", kind: "date" },
      { key: "fdaCert", label: "FDA / regulatory certification", kind: "text", optional: true },
    ],
  },

  pet: {
    label: "Pet Supplies",
    description: "Pet food, accessories. Variant on size, capture pet type.",
    variantOptions: [
      { name: "Pet Size", suggestions: ["XS", "S", "M", "L", "XL"], required: false },
      { name: "Color", suggestions: ["Brown", "Black", "Pink"], required: false },
    ],
    attributes: [
      {
        key: "petType",
        label: "Pet type",
        kind: "select",
        options: ["Dog", "Cat", "Bird", "Fish", "Small animal", "Reptile"],
      },
      { key: "material", label: "Material", kind: "text", optional: true },
    ],
  },

  office: {
    label: "Office & Stationery",
    description: "Stationery, office supplies. Variant on color and pack quantity.",
    variantOptions: [
      { name: "Color", suggestions: ["Black", "Blue", "Red", "Multi"], required: false },
      { name: "Pack", suggestions: ["1 pc", "5 pcs", "10 pcs", "Bulk"], required: false },
    ],
    attributes: [
      { key: "material", label: "Material", kind: "text", optional: true },
      { key: "useCase", label: "Use case", kind: "text", optional: true },
    ],
  },

  tools: {
    label: "Tools & Home Improvement",
    description: "Hand tools, power tools, hardware. Capture power source.",
    variantOptions: [
      { name: "Size", suggestions: ["S", "M", "L"], required: false },
      { name: "Voltage", suggestions: ["110V", "220V", "Battery"], required: false },
    ],
    attributes: [
      { key: "material", label: "Material", kind: "text" },
      {
        key: "powerSource",
        label: "Power source",
        kind: "select",
        options: ["Manual", "Battery", "Corded electric", "Pneumatic"],
        optional: true,
      },
      { key: "warranty", label: "Warranty", kind: "text", optional: true },
    ],
  },

  jewelry: {
    label: "Jewelry & Watches",
    description: "Jewelry & watches. Variant on metal, gemstone, ring size.",
    variantOptions: [
      {
        name: "Metal",
        required: true,
        suggestions: ["Gold", "Silver", "Rose Gold", "Platinum", "Stainless Steel"],
      },
      {
        name: "Ring Size",
        suggestions: ["5", "6", "7", "8", "9", "10"],
        required: false,
      },
    ],
    attributes: [
      { key: "purity", label: "Metal purity", kind: "text", placeholder: "e.g. 18K, 925 sterling" },
      { key: "gemstone", label: "Gemstone", kind: "text", optional: true },
      { key: "weight", label: "Weight (g)", kind: "number", optional: true },
      { key: "warranty", label: "Warranty / certificate", kind: "text", optional: true },
    ],
  },

  digital: {
    label: "Digital Products",
    description: "Software, e-books, licenses. No physical variants needed.",
    variantOptions: [
      { name: "License", suggestions: ["1 device", "3 devices", "Family", "Business"], required: false },
    ],
    attributes: [
      { key: "fileType", label: "File type", kind: "text", placeholder: "e.g. PDF, MP4, ZIP" },
      { key: "deliveryMethod", label: "Delivery method", kind: "text", placeholder: "e.g. Email link, Account dashboard" },
      { key: "licenseDuration", label: "License duration", kind: "text", optional: true },
    ],
  },

  others: {
    label: "Others",
    description: "Catch-all for anything not covered above.",
    variantOptions: [],
    attributes: [
      { key: "notes", label: "Additional details", kind: "textarea", optional: true },
    ],
  },
};

export const DEFAULT_CONFIG: CategoryConfig = CATEGORY_CONFIG.others;

export const getCategoryConfig = (value: string): CategoryConfig =>
  CATEGORY_CONFIG[value] || DEFAULT_CONFIG;
