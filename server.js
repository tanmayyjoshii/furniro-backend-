const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
let products = [
  {
    id: '1',
    name: 'Syltherine',
    description: 'Stylish cafe chair',
    price: 2500000,
    originalPrice: 3500000,
    discount: 30,
    category: 'Dining',
    brand: 'Furniro',
    image: '/images/inside-weather.jpg',
    rating: 4.5,
    reviews: 120,
    badge: 'sale',
    sku: 'SS001',
    tags: ['Sofa', 'Chair', 'Home', 'Shop'],
    inStock: true
  },
  {
    id: '2',
    name: 'Leviosa',
    description: 'Stylish cafe chair',
    price: 2500000,
    originalPrice: null,
    discount: 0,
    category: 'Dining',
    brand: 'Furniro',
    image: '/images/phillip.jpg',
    rating: 4.7,
    reviews: 204,
    badge: null,
    sku: 'SS002',
    tags: ['Sofa', 'Chair', 'Home', 'Shop'],
    inStock: true
  },
  {
    id: '3',
    name: 'Lolito',
    description: 'Luxury big sofa',
    price: 7000000,
    originalPrice: 14000000,
    discount: 50,
    category: 'Living',
    brand: 'Furniro',
    image: '/images/hutomo.jpg',
    rating: 4.3,
    reviews: 89,
    badge: 'sale',
    sku: 'SS003',
    tags: ['Sofa', 'Living', 'Home', 'Shop'],
    inStock: true
  }
];

// Routes

// Get all products with filtering, sorting, and pagination
app.get('/api/products', (req, res) => {
  const { 
    page = 1, 
    limit = 16, 
    sort = 'default', 
    category, 
    brand, 
    minPrice, 
    maxPrice,
    search 
  } = req.query;

  let filteredProducts = [...products];

  // Filter by category
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by brand
  if (brand && brand !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Filter by price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
  }

  // Search functionality
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sorting
  switch (sort) {
    case 'name-asc':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    default:
      // Keep original order
      break;
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    totalProducts: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / limit),
    currentPage: parseInt(page),
    hasNextPage: endIndex < filteredProducts.length,
    hasPrevPage: startIndex > 0
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, brand, image, tags } = req.body;
  
  if (!name || !description || !price || !category || !brand) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price: parseInt(price),
    originalPrice: null,
    discount: 0,
    category,
    brand,
    image: image || '/images/default.jpg',
    rating: 0,
    reviews: 0,
    badge: null,
    sku: `SS${String(products.length + 1).padStart(3, '0')}`,
    tags: tags || [],
    inStock: true
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, description, price, category, brand, image, tags } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    description: description || products[productIndex].description,
    price: price ? parseInt(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    brand: brand || products[productIndex].brand,
    image: image || products[productIndex].image,
    tags: tags || products[productIndex].tags
  };

  res.json(products[productIndex]);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Get brands
app.get('/api/brands', (req, res) => {
  const brands = [...new Set(products.map(p => p.brand))];
  res.json(brands);
});

// Blog posts
const blogPosts = [
  {
    id: '1',
    title: 'Going all-in with millennial design',
    excerpt: 'Discover how millennial design principles are transforming modern furniture. Learn about the key elements that make furniture appealing to younger generations.',
    content: 'Full blog post content about millennial design trends, including sustainable materials, minimalist aesthetics, and multifunctional pieces...',
    author: 'Sarah Johnson',
    date: '2022-10-14',
    category: 'Design',
    image: '/images/blog1.jpg',
    tags: ['design', 'millennial', 'furniture']
  },
  {
    id: '2',
    title: 'Exploring new ways of decorating',
    excerpt: 'Transform your living space with innovative decorating techniques. From color psychology to space optimization, discover fresh ideas for your home.',
    content: 'Complete guide to modern decorating techniques, including color schemes, lighting, and furniture arrangement...',
    author: 'Michael Chen',
    date: '2022-10-10',
    category: 'Interior',
    image: '/images/blog2.jpg',
    tags: ['decorating', 'interior', 'design']
  },
  {
    id: '3',
    title: 'Handmade pieces that took time to make',
    excerpt: 'Celebrate the art of handcrafted furniture. Learn about traditional techniques and the value of artisan-made pieces in our modern world.',
    content: 'In-depth look at traditional furniture making techniques and the stories behind handcrafted pieces...',
    author: 'Emily Rodriguez',
    date: '2022-10-05',
    category: 'Handmade',
    image: '/images/blog3.jpg',
    tags: ['handmade', 'crafts', 'furniture']
  },
  {
    id: '4',
    title: 'Modern home in Milan',
    excerpt: 'Take a tour of a stunning modern home in Milan that perfectly balances contemporary design with Italian elegance.',
    content: 'Detailed case study of a modern Milanese home, featuring contemporary furniture and innovative design solutions...',
    author: 'Alessandro Rossi',
    date: '2022-09-28',
    category: 'Design',
    image: 'https://via.placeholder.com/600x400/FF6347/FFFFFF?text=Milan+Home',
    tags: ['modern', 'milan', 'interior']
  },
  {
    id: '5',
    title: 'Colorful office redesign',
    excerpt: 'See how a drab office space was transformed into an inspiring workplace using bold colors and creative furniture solutions.',
    content: 'Before and after case study of an office redesign project, focusing on color psychology and productivity...',
    author: 'Jessica Park',
    date: '2022-09-20',
    category: 'Interior',
    image: 'https://via.placeholder.com/600x400/32CD32/FFFFFF?text=Office+Design',
    tags: ['office', 'color', 'productivity']
  },
  {
    id: '6',
    title: 'Sustainable furniture materials',
    excerpt: 'Learn about eco-friendly materials that are revolutionizing the furniture industry and how to choose sustainable options.',
    content: 'Comprehensive guide to sustainable furniture materials, including bamboo, reclaimed wood, and recycled materials...',
    author: 'David Green',
    date: '2022-09-15',
    category: 'Wood',
    image: 'https://via.placeholder.com/600x400/2E8B57/FFFFFF?text=Sustainable+Materials',
    tags: ['sustainable', 'eco-friendly', 'materials']
  },
  {
    id: '7',
    title: 'Small space furniture solutions',
    excerpt: 'Maximize your small living space with clever furniture choices and space-saving design techniques.',
    content: 'Practical tips for furnishing small spaces, including multifunctional furniture and storage solutions...',
    author: 'Lisa Wang',
    date: '2022-09-08',
    category: 'Design',
    image: 'https://via.placeholder.com/600x400/FF69B4/FFFFFF?text=Small+Spaces',
    tags: ['small-space', 'multifunctional', 'storage']
  },
  {
    id: '8',
    title: 'Vintage furniture restoration',
    excerpt: 'Bring old furniture back to life with professional restoration techniques and creative upcycling ideas.',
    content: 'Step-by-step guide to furniture restoration, including cleaning, repairing, and refinishing techniques...',
    author: 'Robert Smith',
    date: '2022-09-01',
    category: 'Crafts',
    image: 'https://via.placeholder.com/600x400/8B4513/FFFFFF?text=Vintage+Restoration',
    tags: ['vintage', 'restoration', 'upcycling']
  }
];

// Get blog posts
app.get('/api/blog', (req, res) => {
  const { page = 1, limit = 6, category, search } = req.query;
  
  let filteredPosts = [...blogPosts];

  if (category && category !== 'all') {
    filteredPosts = filteredPosts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    filteredPosts = filteredPosts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  res.json({
    posts: paginatedPosts,
    totalPosts: filteredPosts.length,
    totalPages: Math.ceil(filteredPosts.length / limit),
    currentPage: parseInt(page)
  });
});

// Get blog categories
app.get('/api/blog/categories', (req, res) => {
  const categories = [...new Set(blogPosts.map(p => p.category))];
  res.json(categories);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
