const mongoose = require('mongoose');
const Item = require('./models/Item');
const User = require('./models/User');
require('dotenv').config();

// Sample data for clothing items
const clothingData = [
  {
    title: "Nike Air Max 270 Sneakers",
    description: "Comfortable running shoes with excellent cushioning. Perfect for daily wear and sports activities.",
    size: "US 10",
    color: "Black/White",
    brand: "Nike",
    price: 4500,
    coinReward: 45,
    category: "Footwear",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]
  },
  {
    title: "Levi's 501 Original Jeans",
    description: "Classic straight-fit jeans in dark blue denim. Timeless style that goes with everything.",
    size: "32x32",
    color: "Dark Blue",
    brand: "Levi's",
    price: 2800,
    coinReward: 28,
    category: "Bottoms",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"]
  },
  {
    title: "Adidas Ultraboost Running Shoes",
    description: "Premium running shoes with responsive cushioning. Great for long-distance running.",
    size: "US 9",
    color: "Grey/Orange",
    brand: "Adidas",
    price: 6500,
    coinReward: 65,
    category: "Footwear",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"]
  },
  {
    title: "H&M Cotton T-Shirt",
    description: "Soft cotton t-shirt in classic white. Perfect for everyday wear and layering.",
    size: "M",
    color: "White",
    brand: "H&M",
    price: 800,
    coinReward: 8,
    category: "Tops",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"]
  },
  {
    title: "Zara Blazer Jacket",
    description: "Professional blazer in navy blue. Perfect for office wear and formal occasions.",
    size: "L",
    color: "Navy Blue",
    brand: "Zara",
    price: 3200,
    coinReward: 32,
    category: "Outerwear",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"]
  },
  {
    title: "Puma RS-X Sneakers",
    description: "Retro-inspired sneakers with bold design. Great for street style and casual wear.",
    size: "US 8",
    color: "Red/White",
    brand: "Puma",
    price: 3800,
    coinReward: 38,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"]
  },
  {
    title: "Uniqlo Denim Jacket",
    description: "Classic denim jacket with comfortable fit. Versatile piece for any season.",
    size: "M",
    color: "Light Blue",
    brand: "Uniqlo",
    price: 1800,
    coinReward: 18,
    category: "Outerwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"]
  },
  {
    title: "Converse Chuck Taylor All Star",
    description: "Iconic canvas sneakers in classic black. Timeless design that never goes out of style.",
    size: "US 7",
    color: "Black",
    brand: "Converse",
    price: 2200,
    coinReward: 22,
    category: "Footwear",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400"]
  },
  {
    title: "Gap Khaki Chinos",
    description: "Comfortable khaki chinos with perfect fit. Ideal for both casual and semi-formal occasions.",
    size: "30x32",
    color: "Khaki",
    brand: "Gap",
    price: 1500,
    coinReward: 15,
    category: "Bottoms",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400"]
  },
  {
    title: "Vans Old Skool Skate Shoes",
    description: "Classic skate shoes with side stripe design. Perfect for skateboarding and street style.",
    size: "US 9",
    color: "Black/White",
    brand: "Vans",
    price: 2800,
    coinReward: 28,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400"]
  },
  {
    title: "Forever 21 Summer Dress",
    description: "Floral print summer dress with adjustable straps. Perfect for warm weather and casual outings.",
    size: "S",
    color: "Floral Print",
    brand: "Forever 21",
    price: 1200,
    coinReward: 12,
    category: "Dresses",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"]
  },
  {
    title: "New Balance 574 Classic",
    description: "Comfortable lifestyle sneakers with retro design. Great for everyday wear and light activities.",
    size: "US 10",
    color: "Grey/Blue",
    brand: "New Balance",
    price: 3200,
    coinReward: 32,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400"]
  },
  {
    title: "Tommy Hilfiger Polo Shirt",
    description: "Classic polo shirt with embroidered logo. Perfect for casual and semi-formal occasions.",
    size: "L",
    color: "Navy Blue",
    brand: "Tommy Hilfiger",
    price: 1800,
    coinReward: 18,
    category: "Tops",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400"]
  },
  {
    title: "ASOS Skinny Jeans",
    description: "Modern skinny jeans in dark wash. Stretchy denim for maximum comfort and style.",
    size: "30x30",
    color: "Dark Blue",
    brand: "ASOS",
    price: 1600,
    coinReward: 16,
    category: "Bottoms",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"]
  },
  {
    title: "Reebok Classic Leather",
    description: "Timeless leather sneakers with clean design. Versatile footwear for any casual outfit.",
    size: "US 8",
    color: "White",
    brand: "Reebok",
    price: 2400,
    coinReward: 24,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"]
  },
  {
    title: "Hollister Hoodie",
    description: "Comfortable cotton hoodie with kangaroo pocket. Perfect for layering in cooler weather.",
    size: "M",
    color: "Grey",
    brand: "Hollister",
    price: 1400,
    coinReward: 14,
    category: "Tops",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"]
  },
  {
    title: "Fila Disruptor Sneakers",
    description: "Chunky sneakers with bold design. Trendy footwear that makes a statement.",
    size: "US 9",
    color: "White",
    brand: "Fila",
    price: 3600,
    coinReward: 36,
    category: "Footwear",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"]
  },
  {
    title: "Mango Blouse",
    description: "Elegant silk blouse with button-up design. Perfect for office wear and formal occasions.",
    size: "S",
    color: "White",
    brand: "Mango",
    price: 2200,
    coinReward: 22,
    category: "Tops",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400"]
  },
  {
    title: "Pull&Bear Cargo Pants",
    description: "Comfortable cargo pants with multiple pockets. Great for outdoor activities and casual wear.",
    size: "32x32",
    color: "Olive Green",
    brand: "Pull&Bear",
    price: 1200,
    coinReward: 12,
    category: "Bottoms",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400"]
  },
  {
    title: "Skechers Go Walk",
    description: "Lightweight walking shoes with memory foam insole. Perfect for long walks and daily comfort.",
    size: "US 9",
    color: "Black",
    brand: "Skechers",
    price: 2800,
    coinReward: 28,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400"]
  },
  {
    title: "Bershka Denim Shirt",
    description: "Classic denim shirt with button-up design. Versatile piece that can be worn as shirt or jacket.",
    size: "M",
    color: "Light Blue",
    brand: "Bershka",
    price: 1000,
    coinReward: 10,
    category: "Tops",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"]
  },
  {
    title: "Under Armour Training Shorts",
    description: "Performance shorts with built-in liner. Perfect for workouts and athletic activities.",
    size: "M",
    color: "Black",
    brand: "Under Armour",
    price: 1600,
    coinReward: 16,
    category: "Bottoms",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400"]
  },
  {
    title: "Lacoste Tennis Shoes",
    description: "Classic tennis shoes with clean design. Great for both sports and casual wear.",
    size: "US 8",
    color: "White/Green",
    brand: "Lacoste",
    price: 4200,
    coinReward: 42,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"]
  },
  {
    title: "Massimo Dutti Sweater",
    description: "Soft wool sweater with ribbed texture. Perfect for layering in cooler weather.",
    size: "L",
    color: "Navy Blue",
    brand: "Massimo Dutti",
    price: 2800,
    coinReward: 28,
    category: "Tops",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"]
  },
  {
    title: "Levi's Trucker Jacket",
    description: "Classic denim jacket with comfortable fit. Timeless piece that never goes out of style.",
    size: "M",
    color: "Medium Blue",
    brand: "Levi's",
    price: 2400,
    coinReward: 24,
    category: "Outerwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"]
  },
  {
    title: "Adidas Stan Smith",
    description: "Iconic tennis shoes with clean design. Versatile footwear for any casual outfit.",
    size: "US 9",
    color: "White/Green",
    brand: "Adidas",
    price: 3800,
    coinReward: 38,
    category: "Footwear",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400"]
  },
  {
    title: "Zara Midi Skirt",
    description: "Elegant midi skirt with pleated design. Perfect for office wear and formal occasions.",
    size: "S",
    color: "Black",
    brand: "Zara",
    price: 1800,
    coinReward: 18,
    category: "Bottoms",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"]
  },
  {
    title: "Nike Air Force 1",
    description: "Classic white sneakers with clean design. Iconic footwear that goes with everything.",
    size: "US 10",
    color: "White",
    brand: "Nike",
    price: 5200,
    coinReward: 52,
    category: "Footwear",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]
  },
  {
    title: "H&M Cardigan",
    description: "Soft knit cardigan with button-up design. Perfect for layering and cooler weather.",
    size: "M",
    color: "Beige",
    brand: "H&M",
    price: 1200,
    coinReward: 12,
    category: "Tops",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"]
  },
  {
    title: "Puma Suede Classic",
    description: "Retro-inspired suede sneakers with clean design. Great for street style and casual wear.",
    size: "US 8",
    color: "Red",
    brand: "Puma",
    price: 2400,
    coinReward: 24,
    category: "Footwear",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"]
  },
  {
    title: "Uniqlo Oxford Shirt",
    description: "Classic oxford shirt with button-up design. Perfect for office wear and formal occasions.",
    size: "L",
    color: "Light Blue",
    brand: "Uniqlo",
    price: 1400,
    coinReward: 14,
    category: "Tops",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400"]
  }
];

const seedItems = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get or create the main user
    let yashUser = await User.findOne({ email: 'yashdhankecha8@gmail.com' });
    if (!yashUser) {
      yashUser = await User.create({
        name: 'Yash Dhankecha',
        email: 'yashdhankecha8@gmail.com',
        password: 'Test123!',
        isEmailVerified: true
      });
      console.log('Created Yash Dhankecha user');
    }

    // Create admin user
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Created admin user (admin@gmail.com / admin123)');
    }

    // Create owner user
    let ownerUser = await User.findOne({ email: 'owner@gmail.com' });
    if (!ownerUser) {
      ownerUser = await User.create({
        name: 'System Owner',
        email: 'owner@gmail.com',
        password: 'owner123',
        role: 'owner',
        isEmailVerified: true
      });
      console.log('Created owner user (owner@gmail.com / owner123)');
    }

    // Create a few other users
    const otherUsersData = [
      { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', password: 'Test123!', isEmailVerified: true },
      { name: 'Mike Chen', email: 'mike.chen@example.com', password: 'Test123!', isEmailVerified: true },
      { name: 'Emma Davis', email: 'emma.davis@example.com', password: 'Test123!', isEmailVerified: true }
    ];
    const otherUsers = [];
    for (const userData of otherUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) user = await User.create(userData);
      otherUsers.push(user);
    }

    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');

    // Diverse product data (40 items, 10 for Yash, 30 for others)
    const categories = [
      'Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Shoes', 'Accessories', 'Bags', 'Jewelry', 'Activewear', 'Swimwear',
      'Suits', 'Sleepwear', 'Denim', 'Sweaters', 'Hats', 'Scarves', 'Socks', 'Underwear', 'Blazers', 'Coats'
    ];
    const images = [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=400&fit=crop', // Tops
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', // Bottoms
      'https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?w=400&h=400&fit=crop', // Outerwear
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=400&fit=crop', // Dresses
      'https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa5c?w=400&h=400&fit=crop', // Shoes
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=400&fit=crop', // Accessories
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop', // Bags
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop', // Jewelry
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=400&fit=crop', // Activewear
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop', // Swimwear
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', // Suits
      'https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?w=400&h=400&fit=crop', // Sleepwear
      'https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa5c?w=400&h=400&fit=crop', // Denim
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop', // Sweaters
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop', // Hats
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=400&fit=crop', // Scarves
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop', // Socks
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', // Underwear
      'https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?w=400&h=400&fit=crop', // Blazers
      'https://images.unsplash.com/photo-1517263904808-5dc0d6d3fa5c?w=400&h=400&fit=crop', // Coats
    ];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'Free Size'];
    const brands = ['Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Levi\'s', 'Gucci', 'Prada', 'Coach', 'Chanel', 'Puma', 'Reebok', 'Under Armour', 'Gap', 'Forever 21', 'Mango', 'Versace', 'Tommy Hilfiger', 'Burberry', 'Hermes'];
    const conditions = ['New', 'Like New', 'Good', 'Fair'];

    // Helper to get a random element
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];

    // 10 items for Yash
    const yashItems = Array.from({ length: 10 }).map((_, i) => ({
      title: `Yash's ${categories[i]} #${i + 1}`,
      description: `A stylish ${categories[i].toLowerCase()} from Yash's collection.`,
      size: rand(sizes),
      color: rand(['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray', 'Brown', 'Purple']),
      brand: rand(brands),
      price: Math.floor(Math.random() * 2000) + 200,
      coinReward: Math.floor(Math.random() * 50) + 10,
      status: 'approved',
      flagged: false,
      images: [images[i]],
      category: categories[i],
      condition: rand(conditions),
      user: yashUser._id
    }));

    // 30 items for other users, covering all categories
    const otherItems = Array.from({ length: 30 }).map((_, i) => {
      const catIdx = (i + 10) % categories.length;
      return {
        title: `${categories[catIdx]} Item #${i + 1}`,
        description: `A great ${categories[catIdx].toLowerCase()} for your wardrobe.`,
        size: rand(sizes),
        color: rand(['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray', 'Brown', 'Purple']),
        brand: rand(brands),
        price: Math.floor(Math.random() * 2000) + 200,
        coinReward: Math.floor(Math.random() * 50) + 10,
        status: 'approved',
        flagged: false,
        images: [images[catIdx]],
        category: categories[catIdx],
        condition: rand(conditions),
        user: rand(otherUsers)._id
      };
    });

    const items = [...yashItems, ...otherItems];
    await Item.insertMany(items);
    console.log(`Successfully seeded ${items.length} clothing items`);

    // Display some sample items
    const sampleItems = await Item.find().limit(5);
    console.log('\nSample items created:');
    sampleItems.forEach(item => {
      console.log(`- ${item.title} (₹${item.price})`);
    });

    mongoose.connection.close();
    console.log('\nDatabase seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedItems(); 