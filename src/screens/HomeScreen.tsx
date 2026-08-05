import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DrawerMenu from "../components/menu/DrawerMenu";

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Header with Hamburger Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={30} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.logo}>ZIGO</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Main Content - Welcome Message Only */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to ZIGO</Text>
          <Text style={styles.welcomeSubtitle}>
            Discover Premium Mobile Accessories
          </Text>
          <View style={styles.iconContainer}>
            <Ionicons name="phone-portrait-outline" size={80} color="#2563EB" />
          </View>
        </View>
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
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  welcomeContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },

  welcomeSubtitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },

  iconContainer: {
    marginTop: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
});