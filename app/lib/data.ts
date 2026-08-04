import type { Restaurant, OpeningHours, MenuSection } from "./types";

// Common opening-hour presets
const allDay: OpeningHours[] = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "00:00",
  close: "23:59",
}));
const standard: OpeningHours[] = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "10:00",
  close: "23:00",
}));
const cafe: OpeningHours[] = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "07:00",
  close: "22:00",
}));
const evening: OpeningHours[] = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: "17:00",
  close: "23:30",
}));

/**
 * Local seed data. Acts as an offline-friendly fallback whenever Firestore is
 * empty or unreachable, so the site always renders something meaningful.
 *
 * Photos are deliberately omitted: `photoUrl()` resolves them by restaurant
 * name through /api/photo, so the images track the real venue instead of a
 * hardcoded stock ID. Set `image` on a Firestore doc to override.
 */
export const seedRestaurants: Restaurant[] = [
  {
    id: "dinemore",
    slug: "dinemore",
    name: "Dinemore",
    cuisine: ["Seafood", "Grill"],
    priceLevel: 2,
    rating: 4.5,
    reviewCount: 218,
    description:
      "Open round the clock on the waterfront, which is most of the appeal at 3am. The reef fish comes off the grill whole and the portions are bigger than they look on the menu.",
    location: "Malé",
    address: "Boduthakurufaanu Magu, Malé",
    coords: { lat: 4.1755, lng: 73.5093 },
    tags: ["Ocean View", "24/7", "Fresh Seafood", "Date Spots"],
    phone: "+960 330 1234",
    email: "hello@dinemore.mv",
    hours: allDay,
    featured: true,
    createdAt: 1710000000000,
    menu: [
      {
        name: "From the grill",
        items: [
          {
            name: "Whole grilled reef fish",
            description: "Whatever came in that morning, with lime and chilli",
            price: 185,
            popular: true,
          },
          { name: "Garlic butter prawns", price: 165, tags: ["Shellfish"] },
          { name: "Reef fish steak", description: "Charred, served with rice", price: 145 },
          { name: "Mixed seafood platter", description: "For two", price: 340, popular: true },
        ],
      },
      {
        name: "Local plates",
        items: [
          { name: "Mas huni & roshi", description: "Breakfast, served all day", price: 45, popular: true },
          { name: "Garudhiya with rice", description: "Fish broth, lime, chilli, onion", price: 65 },
          { name: "Fihunu mas", description: "Chilli-rubbed grilled fish", price: 95, tags: ["Spicy"] },
        ],
      },
      {
        name: "Sides & drinks",
        items: [
          { name: "Papadhu", price: 15, tags: ["Vegetarian"] },
          { name: "Coconut rice", price: 35, tags: ["Vegetarian"] },
          { name: "Fresh lime juice", price: 40, tags: ["Vegetarian"] },
          { name: "Black tea", price: 20, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "chicking",
    slug: "chicking",
    name: "Chicking",
    cuisine: ["Fast Food", "Fried Chicken"],
    priceLevel: 1,
    rating: 4.2,
    reviewCount: 512,
    description:
      "Fried chicken chain with branches on both islands. Consistent rather than exciting — you know exactly what you're getting, which is the point when it's late and you're hungry.",
    location: "Hulhumalé",
    address: "Nirolhu Magu, Hulhumalé",
    coords: { lat: 4.2105, lng: 73.5406 },
    tags: ["Fast food", "Family", "Takeaway", "Budget"],
    phone: "+960 333 2211",
    email: "order@chicking.mv",
    hours: standard,
    createdAt: 1712000000000,
    menu: [
      {
        name: "Chicken",
        items: [
          { name: "3 pc broasted chicken", price: 95, popular: true },
          { name: "8 pc bucket", description: "Feeds three, roughly", price: 240, popular: true },
          { name: "Spicy wings (6)", price: 85, tags: ["Spicy"] },
          { name: "Chicken strips (5)", price: 75 },
        ],
      },
      {
        name: "Burgers & wraps",
        items: [
          { name: "Zinger burger", price: 65, tags: ["Spicy"], popular: true },
          { name: "Classic chicken burger", price: 55 },
          { name: "Chicken shawarma wrap", price: 60 },
          { name: "Veg burger", price: 45, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Fries", price: 30, tags: ["Vegetarian"] },
          { name: "Loaded cheese fries", price: 55 },
          { name: "Coleslaw", price: 25, tags: ["Vegetarian"] },
          { name: "Soft drink", price: 20, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "marrybrown",
    slug: "marrybrown",
    name: "MarryBrown",
    cuisine: ["Fast Food", "Halal"],
    priceLevel: 1,
    rating: 4.0,
    reviewCount: 341,
    description:
      "The Malaysian halal fast-food chain, and a reliable family stop on Majeedhee Magu. Rice sets and fried chicken rather than burgers alone, which sets it apart from the rest of the strip.",
    location: "Malé",
    address: "Majeedhee Magu, Malé",
    coords: { lat: 4.1748, lng: 73.5089 },
    tags: ["Fast food", "Family", "Halal", "Takeaway"],
    phone: "+960 332 5566",
    email: "hello@marrybrown.mv",
    hours: standard,
    createdAt: 1709000000000,
    menu: [
      {
        name: "Rice sets",
        items: [
          { name: "Chicken rice set", description: "With soup and a drink", price: 85, popular: true },
          { name: "Nasi lemak with fried chicken", price: 95, popular: true },
          { name: "Curry rice bowl", price: 75, tags: ["Spicy"] },
        ],
      },
      {
        name: "Chicken & burgers",
        items: [
          { name: "2 pc golden fried chicken", price: 80 },
          { name: "Crispy chicken burger", price: 60 },
          { name: "Fish burger", price: 55 },
          { name: "Chicken nuggets (6)", price: 45 },
        ],
      },
      {
        name: "Sides & desserts",
        items: [
          { name: "Fries", price: 30, tags: ["Vegetarian"] },
          { name: "Mashed potato", price: 30, tags: ["Vegetarian"] },
          { name: "Sundae", price: 35, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "grillhut",
    slug: "grillhut",
    name: "GrillHut",
    cuisine: ["Grill", "Steakhouse"],
    priceLevel: 3,
    rating: 4.9,
    reviewCount: 176,
    description:
      "A proper steak is hard to find here and this is where to go for one. Small menu, cooked over charcoal, and they'll push back if you order a fillet well done.",
    location: "Hulhumalé",
    address: "Central Park, Hulhumalé",
    coords: { lat: 4.2119, lng: 73.5411 },
    tags: ["Organic", "Farm-to-Table", "Date Spots", "Top rated"],
    phone: "+960 335 7788",
    email: "grill@grillhut.mv",
    hours: evening,
    featured: true,
    createdAt: 1707000000000,
    menu: [
      {
        name: "Charcoal grill",
        items: [
          { name: "Ribeye, 300g", description: "Aged 28 days", price: 420, popular: true },
          { name: "Tenderloin, 220g", price: 390 },
          { name: "Lamb chops", description: "Three, with rosemary", price: 340 },
          { name: "Half chicken", description: "Brined overnight, charred", price: 210, popular: true },
        ],
      },
      {
        name: "Starters",
        items: [
          { name: "Grilled octopus", price: 165 },
          { name: "Burrata with tomato", price: 140, tags: ["Vegetarian"] },
          { name: "Bone marrow on toast", price: 120 },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Truffle fries", price: 65, tags: ["Vegetarian"] },
          { name: "Charred broccolini", price: 55, tags: ["Vegetarian"] },
          { name: "Peppercorn sauce", price: 25 },
        ],
      },
    ],
  },
  {
    id: "bakerloo",
    slug: "bakerloo",
    name: "Bakerloo",
    cuisine: ["Café", "Bakery"],
    priceLevel: 2,
    rating: 4.6,
    reviewCount: 287,
    description:
      "Croissants come out around eight and are usually gone by eleven. Good espresso, a handful of tables, and a queue at the counter most mornings.",
    location: "Malé",
    address: "Chaandhanee Magu, Malé",
    coords: { lat: 4.1739, lng: 73.5102 },
    tags: ["Cozy", "Coffee", "Breakfast", "Cafés"],
    phone: "+960 331 4400",
    email: "hi@bakerloo.mv",
    hours: cafe,
    createdAt: 1713000000000,
    menu: [
      {
        name: "Bakery",
        items: [
          { name: "Butter croissant", price: 35, tags: ["Vegetarian"], popular: true },
          { name: "Almond croissant", price: 45, tags: ["Vegetarian", "Nuts"] },
          { name: "Pain au chocolat", price: 40, tags: ["Vegetarian"] },
          { name: "Cinnamon roll", price: 45, tags: ["Vegetarian"], popular: true },
          { name: "Sourdough loaf", price: 70, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Coffee",
        items: [
          { name: "Espresso", price: 25, tags: ["Vegetarian"] },
          { name: "Flat white", price: 45, tags: ["Vegetarian"], popular: true },
          { name: "Cortado", price: 40, tags: ["Vegetarian"] },
          { name: "Iced latte", price: 50, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Breakfast",
        items: [
          { name: "Eggs on sourdough", price: 85, tags: ["Vegetarian"] },
          { name: "Tuna melt", price: 90 },
          { name: "Yoghurt, granola, fruit", price: 65, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "seasalt",
    slug: "seasalt",
    name: "Sea Salt",
    cuisine: ["Seafood", "Mediterranean"],
    priceLevel: 3,
    rating: 4.8,
    reviewCount: 199,
    description:
      "Mezze and grilled fish a few steps from the water. Book the outside tables — the room inside is fine but the point is the view and the breeze.",
    location: "Malé",
    address: "Rah Dhebai Hingun, Malé",
    coords: { lat: 4.1767, lng: 73.5081 },
    tags: ["Ocean View", "Date Spots", "Top rated", "Mediterranean"],
    phone: "+960 330 9090",
    email: "table@seasalt.mv",
    hours: evening,
    featured: true,
    createdAt: 1706000000000,
    menu: [
      {
        name: "Mezze",
        items: [
          { name: "Hummus with warm flatbread", price: 75, tags: ["Vegetarian"], popular: true },
          { name: "Baba ganoush", price: 75, tags: ["Vegetarian"] },
          { name: "Grilled halloumi", price: 95, tags: ["Vegetarian"] },
          { name: "Calamari, lemon, aioli", price: 120, popular: true },
        ],
      },
      {
        name: "From the sea",
        items: [
          { name: "Whole sea bass", description: "Salt-baked, for two", price: 380, popular: true },
          { name: "Grilled tuna steak", price: 195 },
          { name: "Prawn saganaki", description: "Tomato, feta, chilli", price: 210, tags: ["Shellfish"] },
        ],
      },
      {
        name: "Sweet",
        items: [
          { name: "Baklava", price: 65, tags: ["Vegetarian", "Nuts"] },
          { name: "Lemon posset", price: 70, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "spicebazaar",
    slug: "spice-bazaar",
    name: "Spice Bazaar",
    cuisine: ["Indian", "Curry"],
    priceLevel: 2,
    rating: 4.4,
    reviewCount: 263,
    description:
      "North Indian cooking with a tandoor that gets properly hot. Ask for it Maldivian-spicy if you mean it — the default is toned down for tourists.",
    location: "Hulhumalé",
    address: "Beach Road, Hulhumalé",
    coords: { lat: 4.2098, lng: 73.5423 },
    tags: ["Spicy", "Family", "Vegetarian", "Halal"],
    phone: "+960 334 1212",
    email: "eat@spicebazaar.mv",
    hours: standard,
    createdAt: 1711500000000,
    menu: [
      {
        name: "Tandoor",
        items: [
          { name: "Chicken tikka", price: 145, popular: true },
          { name: "Seekh kebab", price: 155, tags: ["Spicy"] },
          { name: "Tandoori prawns", price: 195, tags: ["Shellfish"] },
          { name: "Paneer tikka", price: 125, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Curries",
        items: [
          { name: "Butter chicken", price: 155, popular: true },
          { name: "Rogan josh", price: 175, tags: ["Spicy"] },
          { name: "Dal makhani", price: 105, tags: ["Vegetarian"], popular: true },
          { name: "Chana masala", price: 95, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Rice & breads",
        items: [
          { name: "Chicken biryani", price: 165, popular: true },
          { name: "Garlic naan", price: 35, tags: ["Vegetarian"] },
          { name: "Butter roti", price: 25, tags: ["Vegetarian"] },
          { name: "Jeera rice", price: 55, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "sakura",
    slug: "sakura",
    name: "Sakura",
    cuisine: ["Japanese", "Sushi"],
    priceLevel: 3,
    rating: 4.7,
    reviewCount: 154,
    description:
      "Eight seats at the counter and a set omakase on weekends. Book ahead; walk-ins rarely work. The tuna is local and it shows.",
    location: "Malé",
    address: "Ameenee Magu, Malé",
    coords: { lat: 4.1721, lng: 73.5111 },
    tags: ["Sushi", "Date Spots", "Top rated", "Quiet"],
    phone: "+960 332 8899",
    email: "reserve@sakura.mv",
    hours: evening,
    createdAt: 1705000000000,
    menu: [
      {
        name: "Counter",
        items: [
          { name: "Omakase, 12 pieces", description: "Weekends only, book ahead", price: 650, popular: true },
          { name: "Chef's nigiri set, 8 pieces", price: 380, popular: true },
        ],
      },
      {
        name: "Nigiri & sashimi",
        items: [
          { name: "Local yellowfin tuna", description: "Two pieces", price: 90, popular: true },
          { name: "Salmon", description: "Two pieces", price: 85 },
          { name: "Sashimi selection", description: "Nine pieces", price: 260 },
          { name: "Tamago", price: 45, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Hot & sides",
        items: [
          { name: "Miso soup", price: 45, tags: ["Vegetarian"] },
          { name: "Chicken karaage", price: 110 },
          { name: "Agedashi tofu", price: 85, tags: ["Vegetarian"] },
          { name: "Edamame", price: 45, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "tikitaka",
    slug: "tiki-taka",
    name: "Tiki Taka",
    cuisine: ["Tapas", "Spanish"],
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 132,
    description:
      "Small plates meant for sharing, and loud enough that you won't hear the next table. Order four between two and add more if you're still hungry.",
    location: "Hulhumalé",
    address: "Hiyaa Flats, Hulhumalé",
    coords: { lat: 4.2132, lng: 73.5399 },
    tags: ["Lively", "Sharing", "Date Spots", "Late Night"],
    phone: "+960 335 3434",
    email: "hola@tikitaka.mv",
    hours: evening,
    createdAt: 1710500000000,
    menu: [
      {
        name: "Tapas",
        items: [
          { name: "Patatas bravas", price: 75, tags: ["Vegetarian"], popular: true },
          { name: "Gambas al ajillo", description: "Garlic prawns", price: 135, tags: ["Shellfish"], popular: true },
          { name: "Croquetas", description: "Four, chicken and béchamel", price: 85 },
          { name: "Pimientos de padrón", price: 70, tags: ["Vegetarian"] },
          { name: "Tortilla española", price: 80, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Larger",
        items: [
          { name: "Seafood paella", description: "For two, 30 minutes", price: 340, popular: true },
          { name: "Chicken paella", description: "For two, 30 minutes", price: 290 },
        ],
      },
      {
        name: "Drinks",
        items: [
          { name: "Virgin sangria", price: 65, tags: ["Vegetarian"] },
          { name: "Sparkling water", price: 35, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "greenleaf",
    slug: "green-leaf",
    name: "Green Leaf",
    cuisine: ["Vegan", "Healthy"],
    priceLevel: 2,
    rating: 4.5,
    reviewCount: 118,
    description:
      "Entirely plant-based, which is still rare in Malé. Bowls, juices and a short list of baked things. Portions are generous enough that you won't leave hungry.",
    location: "Malé",
    address: "Sosun Magu, Malé",
    coords: { lat: 4.1758, lng: 73.5075 },
    tags: ["Vegan", "Healthy", "Cafés", "Vegetarian"],
    phone: "+960 331 7676",
    email: "hello@greenleaf.mv",
    hours: cafe,
    createdAt: 1712500000000,
    menu: [
      {
        name: "Bowls",
        items: [
          { name: "Falafel and grain bowl", price: 115, tags: ["Vegan"], popular: true },
          { name: "Coconut curry bowl", price: 110, tags: ["Vegan", "Spicy"] },
          { name: "Acai bowl", price: 95, tags: ["Vegan"], popular: true },
          { name: "Tofu poke bowl", price: 120, tags: ["Vegan"] },
        ],
      },
      {
        name: "Juices",
        items: [
          { name: "Cold-pressed green", description: "Cucumber, apple, ginger, lime", price: 65, tags: ["Vegan"] },
          { name: "Beet and orange", price: 60, tags: ["Vegan"] },
          { name: "Watermelon mint", price: 55, tags: ["Vegan"] },
        ],
      },
      {
        name: "Sweet",
        items: [
          { name: "Raw brownie", price: 55, tags: ["Vegan", "Nuts"] },
          { name: "Banana bread", price: 45, tags: ["Vegan"] },
        ],
      },
    ],
  },
  {
    id: "burgerbros",
    slug: "burger-bros",
    name: "Burger Bros",
    cuisine: ["Fast Food", "Burgers"],
    priceLevel: 1,
    rating: 4.1,
    reviewCount: 402,
    description:
      "Smash patties, a short menu and a counter you order at. Cheap, fast, and busy from about seven onwards.",
    location: "Hulhumalé",
    address: "Bageechaa Magu, Hulhumalé",
    coords: { lat: 4.2087, lng: 73.5417 },
    tags: ["Fast food", "Budget", "Takeaway", "Family"],
    phone: "+960 333 1010",
    email: "yo@burgerbros.mv",
    hours: standard,
    createdAt: 1713500000000,
    menu: [
      {
        name: "Burgers",
        items: [
          { name: "Single smash", price: 65, popular: true },
          { name: "Double smash", price: 95, popular: true },
          { name: "Bacon-style beef stack", description: "Halal beef rashers", price: 110 },
          { name: "Crispy chicken", price: 75 },
          { name: "Mushroom and halloumi", price: 70, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Crinkle fries", price: 30, tags: ["Vegetarian"] },
          { name: "Cheese fries", price: 50 },
          { name: "Onion rings", price: 40, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Shakes",
        items: [
          { name: "Chocolate shake", price: 55, tags: ["Vegetarian"], popular: true },
          { name: "Vanilla shake", price: 50, tags: ["Vegetarian"] },
          { name: "Salted caramel shake", price: 60, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "lagoon",
    slug: "lagoon",
    name: "Lagoon Rooftop",
    cuisine: ["International", "Cocktails"],
    priceLevel: 4,
    rating: 4.8,
    reviewCount: 96,
    description:
      "Top floor, open sides, and the best view of the harbour you'll get from a restaurant table. Expensive by Malé standards and priced for the occasion rather than the food.",
    location: "Malé",
    address: "Henveiru, Malé",
    coords: { lat: 4.1779, lng: 73.5064 },
    tags: ["Rooftop", "Date Spots", "Top rated", "Fine Dining"],
    phone: "+960 330 5050",
    email: "sky@lagoon.mv",
    hours: evening,
    featured: true,
    createdAt: 1704000000000,
    menu: [
      {
        name: "Tasting menu",
        items: [
          { name: "Five courses", description: "Whole table only", price: 890, popular: true },
          { name: "Five courses, vegetarian", description: "Whole table only", price: 790, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "À la carte",
        items: [
          { name: "Seared tuna, ponzu", price: 260 },
          { name: "Lobster linguine", price: 480, tags: ["Shellfish"], popular: true },
          { name: "Beef short rib", description: "Braised eight hours", price: 420 },
          { name: "Wild mushroom risotto", price: 240, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Mocktails",
        items: [
          { name: "Lagoon spritz", price: 110, tags: ["Vegetarian"], popular: true },
          { name: "Passionfruit cooler", price: 95, tags: ["Vegetarian"] },
          { name: "Smoked pineapple", price: 120, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "islandbrew",
    slug: "island-brew",
    name: "Island Brew",
    cuisine: ["Café", "Brunch"],
    priceLevel: 2,
    rating: 4.6,
    reviewCount: 224,
    description:
      "Brunch runs all day, which is the main reason people come. Plenty of plants, decent wifi, and nobody minds if you sit with a laptop for three hours.",
    location: "Hulhumalé",
    address: "Amin Avenue, Hulhumalé",
    coords: { lat: 4.2114, lng: 73.5388 },
    tags: ["Brunch", "Coffee", "Cafés", "Cozy"],
    phone: "+960 334 6262",
    email: "morning@islandbrew.mv",
    hours: cafe,
    createdAt: 1711000000000,
    menu: [
      {
        name: "All-day brunch",
        items: [
          { name: "Eggs benedict", price: 105, popular: true },
          { name: "Shakshuka with flatbread", price: 95, tags: ["Vegetarian", "Spicy"] },
          { name: "Avocado toast, poached egg", price: 90, tags: ["Vegetarian"], popular: true },
          { name: "Full breakfast", description: "Eggs, beans, halal sausage, toast", price: 130 },
          { name: "Buttermilk pancakes", price: 85, tags: ["Vegetarian"] },
        ],
      },
      {
        name: "Coffee",
        items: [
          { name: "Long black", price: 40, tags: ["Vegetarian"] },
          { name: "Cappuccino", price: 45, tags: ["Vegetarian"] },
          { name: "Oat flat white", price: 55, tags: ["Vegan"] },
          { name: "Cold brew", price: 55, tags: ["Vegan"] },
        ],
      },
      {
        name: "Lunch",
        items: [
          { name: "Chicken caesar", price: 115 },
          { name: "Tuna sandwich", price: 85 },
          { name: "Soup of the day", price: 70, tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "thaiorchid",
    slug: "thai-orchid",
    name: "Thai Orchid",
    cuisine: ["Thai", "Asian"],
    priceLevel: 2,
    rating: 4.4,
    reviewCount: 187,
    description:
      "Thai cooking that hasn't been flattened out for visitors. The green curry has real heat and the som tam will take the roof of your mouth off if you let it.",
    location: "Malé",
    address: "Fareedhee Magu, Malé",
    coords: { lat: 4.1735, lng: 73.5097 },
    tags: ["Spicy", "Family", "Date Spots", "Asian"],
    phone: "+960 332 4747",
    email: "sawadee@thaiorchid.mv",
    hours: standard,
    createdAt: 1710800000000,
    menu: [
      {
        name: "Curries",
        items: [
          { name: "Green curry, chicken", price: 145, tags: ["Spicy"], popular: true },
          { name: "Massaman beef", price: 175 },
          { name: "Red curry, tofu", price: 125, tags: ["Vegetarian", "Spicy"] },
          { name: "Panang prawn", price: 185, tags: ["Shellfish", "Spicy"] },
        ],
      },
      {
        name: "Noodles & rice",
        items: [
          { name: "Pad thai, prawn", price: 155, tags: ["Shellfish", "Nuts"], popular: true },
          { name: "Pad see ew, chicken", price: 135 },
          { name: "Thai fried rice", price: 115 },
        ],
      },
      {
        name: "Soups & salads",
        items: [
          { name: "Tom yum goong", price: 125, tags: ["Shellfish", "Spicy"], popular: true },
          { name: "Tom kha gai", price: 115 },
          { name: "Som tam", description: "Green papaya, properly hot", price: 85, tags: ["Vegetarian", "Spicy"] },
        ],
      },
    ],
  },
];

export function getSeedRestaurants(): Restaurant[] {
  return seedRestaurants;
}

/** Every menu section across the seed set, used for menu-aware search. */
export function allMenuSections(): MenuSection[] {
  return seedRestaurants.flatMap((r) => r.menu ?? []);
}
