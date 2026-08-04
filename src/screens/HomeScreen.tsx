import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DrawerMenu from "../components/menu/DrawerMenu";

// Types
type CategoryItem = {
  id: number;
  name: string;
  parent: string;
  status: number;
};

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  image?: string;
  description?: string;
};

type PopularCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

// All categories from SQL data
const ALL_CATEGORIES: CategoryItem[] = [
  { id: 1, name: "Housing", parent: "protection", status: 1 },
  { id: 2, name: "Battery", parent: "battery", status: 1 },
  { id: 3, name: "Touch", parent: "protection", status: 1 },
  { id: 4, name: "Display", parent: "protection", status: 1 },
  { id: 5, name: "Ribbon", parent: "parts", status: 1 },
  { id: 6, name: "Charger", parent: "chargers", status: 1 },
  { id: 9, name: "Tempered GLASS", parent: "protection", status: 1 },
  { id: 10, name: "BACK COVERS", parent: "protection", status: 1 },
  { id: 11, name: "BOOK POUCH", parent: "protection", status: 1 },
  { id: 12, name: "POWER BANK", parent: "powerbanks", status: 1 },
  { id: 13, name: "HANDS FREE", parent: "audio", status: 1 },
  { id: 15, name: "OTHERS", parent: "others", status: 1 },
  { id: 16, name: "PEN DRIVE", parent: "memory", status: 1 },
  { id: 17, name: "CABLE", parent: "cables", status: 1 },
  { id: 18, name: "CCTV", parent: "camera", status: 1 },
  { id: 19, name: "TOOL", parent: "computer", status: 1 },
  { id: 20, name: "GOLD BACK COVER", parent: "protection", status: 1 },
  { id: 21, name: "BACK COVER DESIGN", parent: "protection", status: 1 },
  { id: 22, name: "CHARGIN PIN", parent: "chargers", status: 1 },
  { id: 23, name: "IC", parent: "parts", status: 1 },
  { id: 24, name: "SPEAKER MIC", parent: "audio", status: 1 },
  { id: 25, name: "BATTERY PIN", parent: "battery", status: 1 },
  { id: 26, name: "MIC", parent: "audio", status: 1 },
  { id: 27, name: "RINGER", parent: "audio", status: 1 },
  { id: 28, name: "SIM CONECTOR", parent: "parts", status: 1 },
  { id: 29, name: "MMC", parent: "memory", status: 1 },
  { id: 30, name: "SWITCH", parent: "parts", status: 1 },
  { id: 31, name: "GOLD TEMPED GLASS", parent: "protection", status: 1 },
  { id: 32, name: "OMS", parent: "parts", status: 1 },
  { id: 33, name: "COPY TOUCH", parent: "smart", status: 1 },
  { id: 34, name: "MICKY MOUSE BC", parent: "protection", status: 1 },
  { id: 35, name: "FULL TEMPED GLASS", parent: "protection", status: 1 },
  { id: 36, name: "5D TEMPED GLASS", parent: "protection", status: 1 },
  { id: 37, name: "AKEKIO", parent: "protection", status: 1 },
  { id: 38, name: "PRIVACY GLASS", parent: "protection", status: 1 },
  { id: 39, name: "ONESAM", parent: "protection", status: 1 },
  { id: 40, name: "OG TEMPED GLASS", parent: "protection", status: 1 },
  { id: 41, name: "SIM TRAY", parent: "parts", status: 1 },
  { id: 42, name: "ON OFF FLEX", parent: "parts", status: 1 },
  { id: 43, name: "CHARGIN FLEX / PCB", parent: "chargers", status: 1 },
  { id: 44, name: "18D TEMPED GLASS", parent: "protection", status: 1 },
  { id: 45, name: "100D TEMPED GLASS", parent: "protection", status: 1 },
  { id: 46, name: "BATTERY BACKCOVER", parent: "protection", status: 1 },
  { id: 47, name: "MATTE TEMPED GLASS", parent: "protection", status: 1 },
  { id: 48, name: "SUPER A+ GLASS", parent: "protection", status: 1 },
];

// Popular categories configuration
const POPULAR_CATEGORIES: PopularCategory[] = [
  { id: "chargers", name: "Chargers", icon: "flash-outline", color: "#2563EB" },
  { id: "powerbanks", name: "Power Banks", icon: "battery-full-outline", color: "#10B981" },
  { id: "cables", name: "Cables", icon: "git-compare-outline", color: "#F59E0B" },
  { id: "audio", name: "Audio", icon: "headset-outline", color: "#8B5CF6" },
  { id: "protection", name: "Protection", icon: "shield-checkmark-outline", color: "#EF4444" },
  { id: "battery", name: "Batteries", icon: "battery-half-outline", color: "#06B6D4" },
  { id: "memory", name: "Storage", icon: "save-outline", color: "#F472B6" },
  { id: "parts", name: "Phone Parts", icon: "construct-outline", color: "#F97316" },
  { id: "smart", name: "Smart Accessories", icon: "watch-outline", color: "#6366F1" },
  { id: "camera", name: "Camera", icon: "camera-outline", color: "#EC4899" },
  { id: "computer", name: "Computer", icon: "laptop-outline", color: "#14B8A6" },
  { id: "others", name: "Others", icon: "grid-outline", color: "#8B8B8B" },
];

// Helper functions
const getCategoriesByParent = (parent: string) => {
  return ALL_CATEGORIES.filter(cat => cat.parent === parent && cat.status === 1);
};

const getCategoryCount = (parent: string) => {
  return getCategoriesByParent(parent).length;
};

const getCategoryDisplayName = (parentId: string) => {
  const found = POPULAR_CATEGORIES.find(c => c.id === parentId);
  return found ? found.name : parentId;
};

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products - Replace with your actual API call
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('YOUR_API_URL/products');
      // const data = await response.json();
      // setProducts(data);
      
      // For now, set empty array to remove dummy data
      setProducts([]);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? 
      product.category.toLowerCase().includes(selectedCategory.toLowerCase()) : 
      true;
    return matchesSearch && matchesCategory;
  });

  // Render category item
  const renderCategoryItem = ({ item }: { item: PopularCategory }) => {
    const count = getCategoryCount(item.id);
    const isActive = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          isActive && styles.categoryCardActive
        ]}
        onPress={() => setSelectedCategory(isActive ? null : item.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.categoryCount}>{count} items</Text>
      </TouchableOpacity>
    );
  };

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => {
    // Find category color
    const categoryConfig = POPULAR_CATEGORIES.find(c => 
      item.category.toLowerCase().includes(c.id.toLowerCase())
    );
    const categoryColor = categoryConfig ? categoryConfig.color : "#2563EB";
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productImage}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImageStyle} />
          ) : (
            <Ionicons name="image-outline" size={45} color="#888" />
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                {item.category}
              </Text>
            </View>
          </View>

          <Text style={styles.productPrice}>
            {item.price}
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={60} color="#CBD5E1" />
      <Text style={styles.emptyStateText}>
        {searchQuery ? "No products found" : "No products available"}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery ? "Try adjusting your search" : "Check back later for new products"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={30} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.logo}>ZIGO</Text>

        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={34} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />

          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Welcome Message - Without Background */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to ZIGO</Text>
          <Text style={styles.welcomeSubtitle}>
            Discover Premium Mobile Accessories
          </Text>
        </View>

        {/* Popular Categories - Commented Out */}
        {/*
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={POPULAR_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          style={styles.categoriesScroll}
        />
        */}

        {/* Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? 
              `${getCategoryDisplayName(selectedCategory)} Products` : 
              "All Products"
            }
          </Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilter}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
          />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    height: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  searchContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 2,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#000",
  },

  // Welcome message styles - without background
  welcomeContainer: {
    marginTop: 20,
    paddingVertical: 10,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  welcomeSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  seeAll: {
    color: "#2563EB",
    fontWeight: "600",
  },

  clearFilter: {
    color: "#EF4444",
    fontWeight: "600",
  },

  categoriesScroll: {
    marginBottom: 5,
  },

  categoriesList: {
    paddingRight: 20,
  },

  categoryCard: {
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    elevation: 2,
  },

  categoryCardActive: {
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
    color: "#111827",
  },

  categoryCount: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  productsList: {
    paddingBottom: 10,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 16,
    flexDirection: "row",
    padding: 15,
    elevation: 2,
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  productImageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  productInfo: {
    flex: 1,
  },

  productHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 8,
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  productPrice: {
    marginTop: 6,
    fontSize: 17,
    color: "#2563EB",
    fontWeight: "700",
  },

  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#888",
  },

  emptyState: {
    padding: 40,
    alignItems: "center",
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});