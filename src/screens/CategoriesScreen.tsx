// src/screens/CategoriesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { categoryService, Category } from '../services/CategoryService';

const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 12;
const padding = 16;
const itemWidth = (width - (padding * 2) - (gap * (numColumns - 1))) / numColumns;

type RootStackParamList = {
  Categories: undefined;
  Products: { categoryId: string; categoryName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      // Initialize categories from the service
      const cats = categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Products', { 
      categoryId: category.id.toString(), 
      categoryName: category.name 
    });
  };

  const getIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Housing': 'phone-portrait-outline',
      'Battery': 'battery-full-outline',
      'Touch': 'hand-left-outline',
      'Display': 'desktop-outline',
      'Ribbon': 'ribbon-outline',
      'Charger': 'flash-outline',
      'Tempered GLASS': 'shield-checkmark-outline',
      'BACK COVERS': 'phone-portrait-outline',
      'BOOK POUCH': 'book-outline',
      'POWER BANK': 'battery-full-outline',
      'HANDS FREE': 'headset-outline',
      'OTHERS': 'grid-outline',
      'PEN DRIVE': 'save-outline',
      'CABLE': 'git-compare-outline',
      'CCTV': 'camera-outline',
      'TOOL': 'construct-outline',
      'GOLD BACK COVER': 'star-outline',
      'BACK COVER DESIGN': 'color-palette-outline',
      'CHARGIN PIN': 'flash-outline',
      'IC': 'hardware-chip-outline',
      'SPEAKER MIC': 'volume-high-outline',
      'BATTERY PIN': 'battery-half-outline',
      'MIC': 'mic-outline',
      'RINGER': 'notifications-outline',
      'SIM CONECTOR': 'cellular-outline',
      'MMC': 'save-outline',
      'SWITCH': 'swap-horizontal-outline',
      'GOLD TEMPED GLASS': 'shield-checkmark-outline',
      'OMS': 'options-outline',
      'COPY TOUCH': 'copy-outline',
      'MICKY MOUSE BC': 'happy-outline',
      'FULL TEMPED GLASS': 'shield-checkmark-outline',
      '5D TEMPED GLASS': 'shield-checkmark-outline',
      'AKEKIO': 'phone-portrait-outline',
      'PRIVACY GLASS': 'eye-off-outline',
      'ONESAM': 'phone-portrait-outline',
      'OG TEMPED GLASS': 'shield-checkmark-outline',
      'SIM TRAY': 'phone-portrait-outline',
      'ON OFF FLEX': 'power-outline',
      'CHARGIN FLEX / PCB': 'flash-outline',
      '18D TEMPED GLASS': 'shield-checkmark-outline',
      '100D TEMPED GLASS': 'shield-checkmark-outline',
      'BATTERY BACKCOVER': 'battery-full-outline',
      'MATTE TEMPED GLASS': 'shield-checkmark-outline',
      'SUPER A+ GLASS': 'shield-checkmark-outline',
    };
    return iconMap[name] || 'apps-outline';
  };

  const renderCategory = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon(item.name)} size={32} color="#DC2626" />
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward-circle" size={20} color="#DC2626" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    padding: padding,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: gap,
  },
  categoryCard: {
    width: itemWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  arrowContainer: {
    marginTop: 4,
  },
});