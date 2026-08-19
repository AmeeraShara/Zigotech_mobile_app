// src/screens/ProductsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
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
  TextInput,
  Keyboard,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { categoryService, Product, PaginatedProducts } from '../services/CategoryService';

// API Configuration - Hardcoded
const API_BASE_URL = 'http://localhost:8002/index.php';
const API_KEY = '2044def760224bac37860a5fab48052b1076b05865d8dfedf281155fce5ce48f';

const ITEMS_PER_PAGE = 10;
const { width, height } = Dimensions.get('window');

export default function ProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params as { 
    categoryId: string; 
    categoryName: string;
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate a unique key for each product - FIXED to prevent duplicate keys
  const getProductKey = (product: Product, index: number): string => {
    const id = product.id || 'no-id';
    const code = product.code || 'no-code';
    return `product-${id}-${code}-${index}`;
  };

  // Deduplicate products function
  const deduplicateProducts = (productsList: Product[]): Product[] => {
    const seen = new Map();
    return productsList.filter(product => {
      const key = product.id ? String(product.id) : (product.code || '');
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    });
  };

  useEffect(() => {
    // Reset states when category changes
    setProducts([]);
    setFilteredProducts([]);
    setAllProducts([]);
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalPages(0);
    setTotalItems(0);
    fetchProductsByCategory(1, true);
  }, [categoryId]);

  const fetchProductsByCategory = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const result: PaginatedProducts = await categoryService.getProductsByCategory(
        categoryId, 
        page, 
        ITEMS_PER_PAGE
      );
      
      const { products: newProducts, total, pages, hasMore: more } = result;
      
      setTotalPages(pages);
      setHasMore(more);
      setTotalItems(total);
      
      const dedupedNewProducts = deduplicateProducts(newProducts);
      
      if (reset) {
        const dedupedAllProducts = deduplicateProducts(dedupedNewProducts);
        setAllProducts(dedupedAllProducts);
        setProducts(dedupedAllProducts);
        setFilteredProducts(dedupedAllProducts);
        
        const initialQuantities: {[key: string]: number} = {};
        dedupedAllProducts.forEach((product: Product) => {
          if (product.id) {
            initialQuantities[String(product.id)] = 1;
          }
        });
        setQuantities(initialQuantities);
      } else {
        const combinedProducts = [...allProducts, ...dedupedNewProducts];
        const dedupedCombined = deduplicateProducts(combinedProducts);
        setAllProducts(dedupedCombined);
        setProducts(dedupedCombined);
        
        if (!searchQuery.trim()) {
          setFilteredProducts(dedupedCombined);
        }
        
        const newQuantities = { ...quantities };
        dedupedCombined.forEach((product: Product) => {
          if (product.id && !newQuantities[String(product.id)]) {
            newQuantities[String(product.id)] = 1;
          }
        });
        setQuantities(newQuantities);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setAllProducts([]);
    setProducts([]);
    setFilteredProducts([]);
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalPages(0);
    fetchProductsByCategory(1, true);
  };

  // Load more products with "View More" button
  const loadMoreProducts = () => {
    if (!loadingMore && hasMore && !searchQuery.trim()) {
      const nextPage = currentPage + 1;
      fetchProductsByCategory(nextPage, false);
    }
  };

  // Search across ALL products from API
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setFilteredProducts(allProducts);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    
    try {
      const params = new URLSearchParams({
        components: 'api',
        action: 'fetch_inventory_items',
        api_key: API_KEY,
        page: '1',
        limit: '1000',
        type: '1',
        category: categoryId,
        store: 'all',
        sub_system: '0'
      });

      const url = `${API_BASE_URL}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        const allApiProducts = data.data;
        const searchTerm = query.toLowerCase().trim();
        const filtered = allApiProducts.filter((product: Product) => {
          const code = product.code?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const category = categoryService.getCategoryName(product.category_id)?.toLowerCase() || '';
          
          return code.includes(searchTerm) || 
                 description.includes(searchTerm) || 
                 category.includes(searchTerm);
        });

        const dedupedFiltered = deduplicateProducts(filtered);
        setSearchResults(dedupedFiltered);
        setFilteredProducts(dedupedFiltered);
        
        const suggestionList = dedupedFiltered.slice(0, 5);
        setSuggestions(suggestionList);
        setShowSuggestions(query.length > 0 && suggestionList.length > 0);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim() === '') {
      setSearchResults([]);
      setFilteredProducts(allProducts);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(query);
    }, 500);
  };

  const handleSuggestionPress = (product: Product) => {
    setSearchQuery(product.code || product.description || '');
    setFilteredProducts([product]);
    setSearchResults([product]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilteredProducts(allProducts);
    setSuggestions([]);
    setShowSuggestions(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      
      const product = allProducts.find((p: Product) => String(p.id) === productId);
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

  // Add to cart from modal
  const addToCartFromModal = () => {
    if (!selectedProduct || !selectedProduct.id) return;
    
    const productId = String(selectedProduct.id);
    const quantity = modalQuantity;
    
    const existingItem = cartItems.find((item: {product: Product, quantity: number}) => 
      String(item.product.id) === productId
    );
    
    if (existingItem) {
      setCartItems(prevItems => 
        prevItems.map((item: {product: Product, quantity: number}) => 
          String(item.product.id) === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems(prevItems => [...prevItems, { product: selectedProduct, quantity }]);
    }

    // Update quantity in product list
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));

    setIsModalVisible(false);
    Alert.alert(
      'Added to Cart', 
      `${selectedProduct.description || selectedProduct.code} (x${quantity}) added to cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigateToCart() }
      ]
    );
  };

  const addToCart = (product: Product) => {
    if (!product.id) return;
    
    const productId = String(product.id);
    const quantity = quantities[productId] || 1;
    
    const existingItem = cartItems.find((item: {product: Product, quantity: number}) => 
      String(item.product.id) === productId
    );
    
    if (existingItem) {
      setCartItems(prevItems => 
        prevItems.map((item: {product: Product, quantity: number}) => 
          String(item.product.id) === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
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
    return cartItems.reduce((sum: number, item: {product: Product, quantity: number}) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum: number, item: {product: Product, quantity: number}) => {
      const price = parseFloat(item.product.r_price?.toString() || '0');
      return sum + (price * item.quantity);
    }, 0);
  };

  const navigateToCart = () => {
    Alert.alert(
      'Cart Summary',
      `Total Items: ${getTotalItems()}\nTotal Price: RS. ${getTotalPrice().toFixed(2)}\n\nItems: ${cartItems.map((item: {product: Product, quantity: number}) => 
        `${item.product.description || item.product.code} x${item.quantity}`
      ).join('\n')}`
    );
  };

  // Open product details modal
  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    const productId = product.id ? String(product.id) : '';
    const currentQty = productId ? (quantities[productId] || 1) : 1;
    setModalQuantity(currentQty);
    setIsModalVisible(true);
  };

  // Close product details modal
  const closeProductDetails = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  // Update quantity in modal
  const updateModalQuantity = (change: number) => {
    if (!selectedProduct) return;
    const maxStock = selectedProduct.qty ? parseInt(selectedProduct.qty.toString()) : 0;
    const newQty = Math.max(1, modalQuantity + change);
    if (maxStock > 0 && newQty > maxStock) {
      Alert.alert('Maximum Stock', `Only ${maxStock} units available`);
      return;
    }
    setModalQuantity(newQty);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const categoryName = categoryService.getCategoryName(item.category_id);
    const productId = item.id ? String(item.id) : '';
    const quantity = productId ? (quantities[productId] || 1) : 1;
    const isInCart = cartItems.some((cartItem: {product: Product, quantity: number}) => 
      String(cartItem.product.id) === productId
    );
    const maxStock = item.qty ? parseInt(item.qty.toString()) : 0;
    
    return (
      <View style={styles.productCard}>
        <TouchableOpacity 
          style={styles.productImageContainer}
          onPress={() => openProductDetails(item)}
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

  const renderSuggestion = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="search-outline" size={18} color="#666" style={styles.suggestionIcon} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionCode}>{item.code}</Text>
        <Text style={styles.suggestionDescription} numberOfLines={1}>
          {item.description || item.code}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (searchQuery.trim()) {
      return null;
    }

    if (loadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.footerText}>Loading more products...</Text>
        </View>
      );
    }

    if (hasMore) {
      return (
        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={loadMoreProducts}
          activeOpacity={0.8}
        >
          <View style={styles.viewMoreContent}>
            <Ionicons name="chevron-down-circle" size={24} color="#DC2626" />
            <Text style={styles.viewMoreText}>
              View More 
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (totalItems > 0) {
      return (
        <View style={styles.footerContainer}>
          <View style={styles.allLoadedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
            <Text style={styles.allLoadedText}>
              All {totalItems} products loaded
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (loading && products.length === 0) {
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search products by code or description..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => {
              setIsSearching(true);
              if (searchQuery.length > 0 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 300);
            }}
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#DC2626" style={styles.searchLoader} />
          )}
          {searchQuery.length > 0 && !searchLoading && (
            <TouchableOpacity 
              onPress={clearSearch} 
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={22} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => getProductKey(item, index)}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="always"
            />
            {filteredProducts.length > 5 && (
              <TouchableOpacity 
                style={styles.viewAllSuggestions}
                onPress={() => {
                  setShowSuggestions(false);
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.viewAllText}>
                  View all {filteredProducts.length} results
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredProducts.length} products found
        </Text>
        {searchQuery.length > 0 && (
          <Text style={styles.searchResultText}>
            Showing results for "{searchQuery}"
          </Text>
        )}
        {cartItems.length > 0 && (
          <Text style={styles.cartCountText}>
            {cartItems.length} items in cart
          </Text>
        )}
        {!searchQuery.trim() && totalPages > 0 && (
          <Text style={styles.pageInfo}>
            Page {currentPage} 
          </Text>
        )}
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0 ? 'No products found' : 'No products available'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchQuery.length > 0 
              ? `No results matching "${searchQuery}" in ${categoryName}` 
              : `No products available in ${categoryName}`}
          </Text>
          {searchQuery.length > 0 ? (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={clearSearch}
            >
              <Text style={styles.retryButtonText}>Clear Search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item, index) => getProductKey(item, index)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderFooter}
          ListFooterComponentStyle={styles.footerContainer}
        />
      )}

      {/* Product Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeProductDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeProductDetails} style={styles.modalCloseButton}>
                <Ionicons name="close" size={28} color="#1a1a1a" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Product Details</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
                {/* Product Image */}
                <View style={styles.modalImageContainer}>
                  {selectedProduct.image_path ? (
                    <Image 
                      source={{ uri: `${API_BASE_URL}/../${selectedProduct.image_path}` }} 
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.modalImagePlaceholder}>
                      <Ionicons name="image-outline" size={80} color="#ddd" />
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.modalProductInfo}>
                  <Text style={styles.modalProductCode}>{selectedProduct.code}</Text>
                  <Text style={styles.modalProductName}>
                    {selectedProduct.description || selectedProduct.code}
                  </Text>
                  
                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalProductPrice}>
                      RS. {parseFloat(selectedProduct.r_price?.toString() || '0').toFixed(2)}
                    </Text>
                    <View style={styles.modalCategoryTag}>
                      <Text style={styles.modalCategoryTagText}>
                        {categoryService.getCategoryName(selectedProduct.category_id)}
                      </Text>
                    </View>
                  </View>

                  {/* Stock Info */}
                  <View style={styles.modalStockContainer}>
                    <Ionicons 
                      name={parseInt(selectedProduct.qty?.toString() || '0') > 0 ? "checkmark-circle" : "warning"} 
                      size={20} 
                      color={parseInt(selectedProduct.qty?.toString() || '0') > 0 ? "#22C55E" : "#EF4444"} 
                    />
                    <Text style={[
                      styles.modalStockText,
                      parseInt(selectedProduct.qty?.toString() || '0') > 0 ? styles.inStock : styles.outOfStock
                    ]}>
                      {parseInt(selectedProduct.qty?.toString() || '0') > 0 
                        ? `In Stock (${selectedProduct.qty} units available)` 
                        : 'Out of Stock'}
                    </Text>
                  </View>

                  {/* Quantity Selector */}
                  <View style={styles.modalQuantitySection}>
                    <Text style={styles.modalQuantityLabel}>Quantity:</Text>
                    <View style={styles.modalQuantityContainer}>
                      <TouchableOpacity 
                        style={styles.modalQuantityButton}
                        onPress={() => updateModalQuantity(-1)}
                        disabled={modalQuantity <= 1}
                      >
                        <Ionicons 
                          name="remove" 
                          size={24} 
                          color={modalQuantity <= 1 ? '#ccc' : '#DC2626'} 
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.modalQuantityText}>{modalQuantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.modalQuantityButton}
                        onPress={() => updateModalQuantity(1)}
                        disabled={
                          parseInt(selectedProduct.qty?.toString() || '0') > 0 && 
                          modalQuantity >= parseInt(selectedProduct.qty?.toString() || '0')
                        }
                      >
                        <Ionicons 
                          name="add" 
                          size={24} 
                          color={
                            (parseInt(selectedProduct.qty?.toString() || '0') > 0 && 
                            modalQuantity >= parseInt(selectedProduct.qty?.toString() || '0')) 
                              ? '#ccc' 
                              : '#DC2626'
                          } 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Additional Info - Using any type assertion for optional properties */}
                  {selectedProduct && (selectedProduct as any).rack && (
                    <View style={styles.modalAdditionalInfo}>
                      <Text style={styles.modalAdditionalLabel}>Rack Location:</Text>
                      <Text style={styles.modalAdditionalValue}>{(selectedProduct as any).rack}</Text>
                    </View>
                  )}
                  
                  {selectedProduct && (selectedProduct as any).status && (
                    <View style={styles.modalAdditionalInfo}>
                      <Text style={styles.modalAdditionalLabel}>Status:</Text>
                      <Text style={styles.modalAdditionalValue}>{(selectedProduct as any).status}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.modalActionContainer}>
                    <TouchableOpacity 
                      style={[styles.modalCancelButton]}
                      onPress={closeProductDetails}
                    >
                      <Text style={styles.modalCancelButtonText}>Close</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.modalAddToCartButton,
                        parseInt(selectedProduct.qty?.toString() || '0') === 0 && styles.modalOutOfStockButton
                      ]}
                      onPress={addToCartFromModal}
                      disabled={parseInt(selectedProduct.qty?.toString() || '0') === 0}
                    >
                      <Ionicons 
                        name={parseInt(selectedProduct.qty?.toString() || '0') === 0 ? "ban" : "cart-outline"} 
                        size={20} 
                        color="#fff" 
                      />
                      <Text style={styles.modalAddToCartText}>
                        {parseInt(selectedProduct.qty?.toString() || '0') === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
    zIndex: 999,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  searchLoader: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 300,
    zIndex: 1000,
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewAllSuggestions: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  viewAllText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexWrap: 'wrap',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  searchResultText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  cartCountText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    paddingBottom: 20,
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
    textAlign: 'center',
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
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  viewMoreButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginVertical: 8,
  },
  viewMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  viewMoreSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  allLoadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  allLoadedText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalHeaderSpacer: {
    width: 36,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  modalProductInfo: {
    paddingBottom: 24,
  },
  modalProductCode: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalProductPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  modalCategoryTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalCategoryTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  modalStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  modalStockText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  inStock: {
    color: '#22C55E',
  },
  outOfStock: {
    color: '#EF4444',
  },
  modalQuantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  modalQuantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  modalQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalQuantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 40,
    textAlign: 'center',
  },
  modalAdditionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalAdditionalLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalAdditionalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  modalActionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalAddToCartButton: {
    flex: 2,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalOutOfStockButton: {
    backgroundColor: '#9CA3AF',
  },
  modalAddToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});