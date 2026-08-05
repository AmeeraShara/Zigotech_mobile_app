// src/components/menu/DrawerMenu.tsx
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
import { useNavigation } from "@react-navigation/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function DrawerMenu({
  visible,
  onClose,
}: DrawerMenuProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const navigation = useNavigation();

  const [shopExpanded, setShopExpanded] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Handle Shop toggle - expand/collapse shop items
  const toggleShop = () => {
    setShopExpanded(!shopExpanded);
  };

  // Handle Categories press - Navigate to Categories screen
  const handleCategoriesPress = () => {
    setShopExpanded(false); // Collapse the shop section
    onClose(); // Close the drawer
    navigation.navigate("Categories" as never); // Navigate to Categories screen
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
            {/* Shop Menu Item with expand/collapse */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={toggleShop}
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

            {/* Show Categories when Shop is expanded */}
            {shopExpanded && (
              <View style={styles.shopSubMenu}>
                {/* Categories option - Navigates to Categories Screen */}
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={handleCategoriesPress}
                >
                  <View style={styles.left}>
                    <Ionicons
                      name="grid-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.categoryText}>Categories</Text>
                  </View>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Other Menu Items */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.left}>
                <Ionicons name="heart-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Wishlist</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.left}>
                <Ionicons name="cart-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Cart</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.left}>
                <Ionicons name="person-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Account</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.left}>
                <Ionicons name="settings-outline" size={22} color="#fff" />
                <Text style={styles.menuText}>Settings</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
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

  shopSubMenu: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#1f2937",
    paddingLeft: 12,
    marginBottom: 8,
  },

  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },

  categoryText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 15,
  },
});