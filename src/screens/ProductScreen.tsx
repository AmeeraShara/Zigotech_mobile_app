// src/screens/ProductsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { categoryService, Product } from '../services/CategoryService';

// API Configuration - Hardcoded
const API_BASE_URL = 'http://localhost:8001/index.php';

export default function ProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params as { 
    categoryId: string; 
    categoryName: string;
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryId]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      
      const filteredProducts = await categoryService.getProductsByCategory(categoryId);
      
      setProducts(filteredProducts);
      
      // Initialize quantities for each product
      const initialQuantities: {[key: string]: number} = {};
      filteredProducts.forEach(product => {
        if (product.id) {
          initialQuantities[String(product.id)] = 1;
        }
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductsByCategory();
  };

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      
      // Find the product to check stock limit
      const product = products.find(p => String(p.id) === productId);
      if (product && product.qty) {
        const maxStock = parseInt(product.qty.toString());
        if (newQty > maxStock) {
          Alert.alert('Maximum Stock', `Only ${maxStock} units available`);
          return prev;
        }
      }
      
      return { ...prev, [productId]: newQty };
    });
  };

  const addToCart = (product: Product) => {
    if (!product.id) return;
    
    const productId = String(product.id);
    const quantity = quantities[productId] || 1;
    
    // Check if product already in cart
    const existingItem = cartItems.find(item => String(item.product.id) === productId);
    
    if (existingItem) {
      // Update quantity if product already in cart
      setCartItems(prevItems => 
        prevItems.map(item => 
          String(item.product.id) === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Add new product to cart
      setCartItems(prevItems => [...prevItems, { product, quantity }]);
    }

    Alert.alert(
      'Added to Cart', 
      `${product.description || product.code} (x${quantity}) added to cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigateToCart() }
      ]
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.r_price?.toString() || '0');
      return sum + (price * item.quantity);
    }, 0);
  };

  const navigateToCart = () => {
    Alert.alert(
      'Cart Summary',
      `Total Items: ${getTotalItems()}\nTotal Price: RS. ${getTotalPrice().toFixed(2)}\n\nItems: ${cartItems.map(item => 
        `${item.product.description || item.product.code} x${item.quantity}`
      ).join('\n')}`
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    // Get category name from ID
    const categoryName = categoryService.getCategoryName(item.category_id);
    const productId = item.id ? String(item.id) : '';
    const quantity = productId ? (quantities[productId] || 1) : 1;
    const isInCart = cartItems.some(cartItem => String(cartItem.product.id) === productId);
    const maxStock = item.qty ? parseInt(item.qty.toString()) : 0;
    
    return (
      <View style={styles.productCard}>
        <TouchableOpacity 
          style={styles.productImageContainer}
          onPress={() => {}}
          activeOpacity={0.9}
        >
          {item.image_path ? (
            <Image 
              source={{ uri: `${API_BASE_URL}/../${item.image_path}` }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
          {isInCart && (
            <View style={styles.inCartBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.productInfo}>
          <Text style={styles.productCode} numberOfLines={1}>
            {item.code}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.description || item.code}
          </Text>
          <Text style={styles.productPrice}>
            RS. {parseFloat(item.r_price?.toString() || '0').toFixed(2)}
          </Text>
          
          <View style={styles.productMeta}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{categoryName}</Text>
            </View>
            {maxStock > 0 && (
              <View style={styles.stockTag}>
                <Text style={styles.stockTagText}>In Stock: {maxStock}</Text>
              </View>
            )}
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Qty:</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => productId && updateQuantity(productId, -1)}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={18} 
                  color={quantity <= 1 ? '#ccc' : '#DC2626'} 
                />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => productId && updateQuantity(productId, 1)}
                disabled={maxStock > 0 && quantity >= maxStock}
              >
                <Ionicons 
                  name="add" 
                  size={18} 
                  color={(maxStock > 0 && quantity >= maxStock) ? '#ccc' : '#DC2626'} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button - Full Width at Bottom */}
          <TouchableOpacity 
            style={[
              styles.addToCartButton, 
              isInCart && styles.addedToCartButton,
              maxStock === 0 && styles.outOfStockButton
            ]}
            onPress={() => addToCart(item)}
            disabled={maxStock === 0}
          >
            <Ionicons 
              name={isInCart ? "checkmark-circle" : "cart-outline"} 
              size={18} 
              color="#fff" 
            />
            <Text style={styles.addToCartText}>
              {maxStock === 0 ? 'Out of Stock' : isInCart ? 'Added to Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName}
        </Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={navigateToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#1a1a1a" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {products.length} products found
        </Text>
        {cartItems.length > 0 && (
          <Text style={styles.cartCountText}>
            {cartItems.length} items in cart
          </Text>
        )}
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubText}>
            No products available in {categoryName}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || item.code}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginHorizontal: 12,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  cartCountText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#F8F8F8',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  inCartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 4,
  },
  productInfo: {
    padding: 12,
  },
  productCode: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  stockTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockTagText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  addedToCartButton: {
    backgroundColor: '#22C55E',
  },
  outOfStockButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#DC2626',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});