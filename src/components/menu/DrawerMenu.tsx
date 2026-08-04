import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  onCategorySelect?: (categoryId: string, categoryTitle: string, data?: any) => void;
};

type Category = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subCategories: string[];
  isFetchable?: boolean;
};

// Define types for the fetched data
type BackCoverItem = {
  id: string;
  name: string;
  price: string;
  color: string;
};

type GlassItem = {
  id: string;
  name: string;
  price: string;
  hardness: string;
};

type CategoryData = BackCoverItem[] | GlassItem[];

const categories: Category[] = [
  {
    id: "chargers",
    title: "Chargers",
    icon: "flash-outline",
    subCategories: ["Charger", "CHARGIN PIN", "CHARGIN FLEX / PCB"],
  },
  {
    id: "powerbanks",
    title: "Power Banks",
    icon: "battery-full-outline",
    subCategories: ["POWER BANK"],
  },
  {
    id: "cables",
    title: "Cables",
    icon: "git-compare-outline",
    subCategories: ["CABLE"],
  },
  {
    id: "audio",
    title: "Audio",
    icon: "headset-outline",
    subCategories: ["HANDS FREE", "SPEAKER MIC", "MIC", "RINGER"],
  },
  {
    id: "backcovers",
    title: "Back Covers",
    icon: "phone-portrait-outline",
    subCategories: [
      "Plastic Back Covers",
      "Leather Back Covers",
      "Designer Back Covers",
      "Gold Back Covers",
      "Battery Back Covers",
      "Book Style Covers",
      "Mickey Mouse Covers",
    ],
    isFetchable: true,
  },
  {
    id: "glass",
    title: "Glass Protection",
    icon: "shield-checkmark-outline",
    subCategories: [
      "Standard Tempered Glass",
      "Gold Tempered Glass",
      "Full Tempered Glass",
      "5D Tempered Glass",
      "18D Tempered Glass",
      "100D Tempered Glass",
      "Matte Tempered Glass",
      "Super A+ Glass",
      "Privacy Glass",
      "OG Tempered Glass",
    ],
    isFetchable: true,
  },
  {
    id: "parts",
    title: "Phone Parts",
    icon: "construct-outline",
    subCategories: [
      "Housing",
      "Touch Screen",
      "Display",
      "Ribbon",
      "IC",
      "SIM Connector",
      "Switch",
      "OMS",
      "SIM Tray",
      "ON OFF Flex",
    ],
  },
  {
    id: "smart",
    title: "Smart Accessories",
    icon: "watch-outline",
    subCategories: ["Copy Touch", "AKEKIO", "ONESAM"],
  },
  {
    id: "memory",
    title: "Memory & Storage",
    icon: "save-outline",
    subCategories: ["PEN DRIVE", "MMC"],
  },
  {
    id: "computer",
    title: "Computer Accessories",
    icon: "laptop-outline",
    subCategories: ["TOOL"],
  },
  {
    id: "camera",
    title: "Camera & Selfie",
    icon: "camera-outline",
    subCategories: ["CCTV"],
  },
  {
    id: "battery",
    title: "Batteries",
    icon: "battery-half-outline",
    subCategories: ["Battery", "BATTERY PIN"],
  },
  {
    id: "others",
    title: "Others",
    icon: "grid-outline",
    subCategories: ["OTHERS"],
  },
];

export default function DrawerMenu({
  visible,
  onClose,
  onCategorySelect,
}: DrawerMenuProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [shopExpanded, setShopExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
    // Clear subcategory selection when collapsing
    if (expandedCategory === id) {
      setSelectedSubCategory(null);
    }
  };

  // Handle category press
  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category.id);
    setSelectedSubCategory(null); // Clear subcategory selection
    if (category.isFetchable) {
      fetchCategoryData(category);
    } else {
      toggleCategory(category.id);
    }
  };

  // Handle subcategory press
  const handleSubCategoryPress = (subCategory: string, categoryId: string) => {
    setSelectedSubCategory(subCategory);
    setSelectedCategory(categoryId);
    onClose();
  };

  // Function to fetch category data with proper typing
  const fetchCategoryData = async (category: Category) => {
    setLoadingCategory(category.id);
    try {
      let mockData: CategoryData = [];

      if (category.id === 'backcovers') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const backCoversData: BackCoverItem[] = [
          { id: '1', name: 'Silicone Back Cover', price: '$10', color: 'Black' },
          { id: '2', name: 'Hard Shell Back Cover', price: '$15', color: 'Blue' },
          { id: '3', name: 'Clear Transparent Cover', price: '$8', color: 'Clear' },
          { id: '4', name: 'Carbon Fiber Cover', price: '$20', color: 'Carbon' },
          { id: '5', name: 'Leather Flip Cover', price: '$25', color: 'Brown' },
          { id: '6', name: 'Rugged Armor Cover', price: '$18', color: 'Black' },
          { id: '7', name: 'Glitter Back Cover', price: '$12', color: 'Pink' },
        ];
        mockData = backCoversData;
      } else if (category.id === 'glass') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const glassData: GlassItem[] = [
          { id: '1', name: 'Standard Tempered Glass', price: '$5', hardness: '9H' },
          { id: '2', name: 'Gold Tempered Glass', price: '$8', hardness: '9H' },
          { id: '3', name: 'Full Tempered Glass', price: '$7', hardness: '9H' },
          { id: '4', name: '5D Tempered Glass', price: '$12', hardness: '9H+' },
          { id: '5', name: '18D Tempered Glass', price: '$15', hardness: '9H+' },
          { id: '6', name: '100D Tempered Glass', price: '$18', hardness: '9H+' },
          { id: '7', name: 'Matte Tempered Glass', price: '$10', hardness: '9H' },
          { id: '8', name: 'Super A+ Glass', price: '$14', hardness: '9H+' },
          { id: '9', name: 'Privacy Glass', price: '$16', hardness: '9H' },
          { id: '10', name: 'OG Tempered Glass', price: '$20', hardness: '9H+' },
        ];
        mockData = glassData;
      }

      if (onCategorySelect) {
        onCategorySelect(category.id, category.title, mockData);
      }

      onClose();
    } catch (error) {
      console.error(`Error fetching ${category.title}:`, error);
    } finally {
      setLoadingCategory(null);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.overlay} onPress={onClose} />

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.logo}>ZIGO</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShopExpanded(!shopExpanded)}
            >
              <View style={styles.left}>
                <Ionicons
                  name="storefront-outline"
                  size={22}
                  color="#fff"
                />

                <Text style={styles.menuText}>Shop</Text>
              </View>

              <Ionicons
                name={shopExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

            {shopExpanded &&
              categories.map((category) => (
                <View key={category.id}>
                  <TouchableOpacity
                    style={[
                      styles.category,
                      selectedCategory === category.id && styles.selectedCategory,
                      loadingCategory === category.id && styles.loadingCategory
                    ]}
                    onPress={() => handleCategoryPress(category)}
                    disabled={loadingCategory === category.id}
                  >
                    <View style={styles.left}>
                      <Ionicons
                        name={category.icon}
                        size={20}
                        color="#fff"
                      />

                      <Text style={styles.categoryText}>
                        {category.title}
                        {loadingCategory === category.id && '...'}
                      </Text>
                    </View>

                    {!category.isFetchable ? (
                      <Ionicons
                        name={
                          expandedCategory === category.id
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={18}
                        color="#fff"
                      />
                    ) : (
                      loadingCategory === category.id ? (
                        <Ionicons
                          name="reload-outline"
                          size={18}
                          color="#fff"
                        />
                      ) : (
                        <Ionicons
                          name="arrow-forward-outline"
                          size={18}
                          color="#fff"
                        />
                      )
                    )}
                  </TouchableOpacity>

                  {!category.isFetchable && 
                    expandedCategory === category.id &&
                    category.subCategories.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.subCategory,
                          selectedSubCategory === item && styles.selectedSubCategory
                        ]}
                        onPress={() => handleSubCategoryPress(item, category.id)}
                      >
                        <Text style={[
                          styles.subText,
                          selectedSubCategory === item && styles.selectedSubText
                        ]}>
                          • {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
          </ScrollView>

          <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.bottomMenuItem}>
              <Ionicons name="heart-outline" size={22} color="#fff" />
              <Text style={styles.bottomMenuText}>Wishlist</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomMenuItem}>
              <Ionicons name="cart-outline" size={22} color="#fff" />
              <Text style={styles.bottomMenuText}>Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomMenuItem}>
              <Ionicons name="person-outline" size={22} color="#fff" />
              <Text style={styles.bottomMenuText}>Account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: "row",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingTop: 15,
    elevation: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  logo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "600",
  },

  category: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingLeft: 18,
    borderRadius: 8,
    marginVertical: 2,
  },

  selectedCategory: {
    backgroundColor: "#DC2626", // Red background for selected category
  },

  loadingCategory: {
    opacity: 0.7,
  },

  categoryText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },

  subCategory: {
    paddingLeft: 58,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 1,
  },

  selectedSubCategory: {
    backgroundColor: "#DC2626", // Red background for selected subcategory
  },

  subText: {
    color: "#C7C7C7",
    fontSize: 14,
  },

  selectedSubText: {
    color: "#FFFFFF", // White text for selected subcategory
    fontWeight: "600",
  },

  bottomMenu: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },

  bottomMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  bottomMenuText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
});