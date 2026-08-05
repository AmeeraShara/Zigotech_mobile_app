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

const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 12; // Increased gap for better spacing
const padding = 16;
const itemWidth = (width - (padding * 2) - (gap * (numColumns - 1))) / numColumns;

type Category = {
  id: number;
  name: string;
  type: string;
  status: number;
};

type RootStackParamList = {
  Categories: undefined;
  Products: { categoryId: number; categoryName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const mockCategories: Category[] = [
        { id: 1, name: 'Housing', type: 'all', status: 1 },
        { id: 2, name: 'Battery', type: 'all', status: 1 },
        { id: 3, name: 'Touch', type: 'all', status: 1 },
        { id: 4, name: 'Display', type: 'all', status: 1 },
        { id: 5, name: 'Ribbon', type: 'all', status: 1 },
        { id: 6, name: 'Charger', type: 'all', status: 1 },
        { id: 9, name: 'Tempered GLASS', type: 'all', status: 1 },
        { id: 10, name: 'BACK COVERS', type: 'all', status: 1 },
        { id: 11, name: 'BOOK POUCH', type: 'all', status: 1 },
        { id: 12, name: 'POWER BANK', type: 'all', status: 1 },
        { id: 13, name: 'HANDS FREE', type: 'all', status: 1 },
        { id: 15, name: 'OTHERS', type: 'all', status: 1 },
        { id: 16, name: 'PEN DRIVE', type: 'all', status: 1 },
        { id: 17, name: 'CABLE', type: 'all', status: 1 },
        { id: 18, name: 'CCTV', type: 'all', status: 1 },
        { id: 19, name: 'TOOL', type: 'all', status: 1 },
        { id: 20, name: 'GOLD BACK COVER', type: 'all', status: 1 },
        { id: 21, name: 'BACK COVER DESIGN', type: 'all', status: 1 },
        { id: 22, name: 'CHARGIN PIN', type: 'all', status: 1 },
        { id: 23, name: 'IC', type: 'all', status: 1 },
        { id: 24, name: 'SPEAKER MIC', type: 'all', status: 1 },
        { id: 25, name: 'BATTERY PIN', type: 'all', status: 1 },
        { id: 26, name: 'MIC', type: 'all', status: 1 },
        { id: 27, name: 'RINGER', type: 'all', status: 1 },
        { id: 28, name: 'SIM CONECTOR', type: 'all', status: 1 },
        { id: 29, name: 'MMC', type: 'all', status: 1 },
        { id: 30, name: 'SWITCH', type: 'all', status: 1 },
        { id: 31, name: 'GOLD TEMPED GLASS', type: 'all', status: 1 },
        { id: 32, name: 'OMS', type: 'all', status: 1 },
        { id: 33, name: 'COPY TOUCH', type: 'all', status: 1 },
        { id: 34, name: 'MICKY MOUSE BC', type: 'all', status: 1 },
        { id: 35, name: 'FULL TEMPED GLASS', type: 'all', status: 1 },
        { id: 36, name: '5D TEMPED GLASS', type: 'all', status: 1 },
        { id: 37, name: 'AKEKIO', type: 'all', status: 1 },
        { id: 38, name: 'PRIVACY GLASS', type: 'all', status: 1 },
        { id: 39, name: 'ONESAM', type: 'all', status: 1 },
        { id: 40, name: 'OG TEMPED GLASS', type: 'all', status: 1 },
        { id: 41, name: 'SIM TRAY', type: 'all', status: 1 },
        { id: 42, name: 'ON OFF FLEX', type: 'all', status: 1 },
        { id: 43, name: 'CHARGIN FLEX / PCB', type: 'all', status: 1 },
        { id: 44, name: '18D TEMPED GLASS', type: 'all', status: 1 },
        { id: 45, name: '100D TEMPED GLASS', type: 'all', status: 1 },
        { id: 46, name: 'BATTERY BACKCOVER', type: 'all', status: 1 },
        { id: 47, name: 'MATTE TEMPED GLASS', type: 'all', status: 1 },
        { id: 48, name: 'SUPER A+ GLASS', type: 'all', status: 1 },
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Products', { 
      categoryId: category.id, 
      categoryName: category.name 
    });
  };

  const getIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Battery': 'battery-full-outline',
      'Charger': 'flash-outline',
      'Display': 'desktop-outline',
      'Touch': 'hand-left-outline',
      'Housing': 'phone-portrait-outline',
      'CABLE': 'git-compare-outline',
      'POWER BANK': 'battery-full-outline',
      'HANDS FREE': 'headset-outline',
      'BACK COVERS': 'phone-portrait-outline',
      'Tempered GLASS': 'shield-checkmark-outline',
      'CCTV': 'camera-outline',
      'PEN DRIVE': 'save-outline',
      'TOOL': 'construct-outline',
      'IC': 'hardware-chip-outline',
      'SIM TRAY': 'phone-portrait-outline',
      'OTHERS': 'grid-outline',
      'BOOK POUCH': 'book-outline',
      'GOLD BACK COVER': 'star-outline',
      'BACK COVER DESIGN': 'color-palette-outline',
      'CHARGIN PIN': 'flash-outline',
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
      'ON OFF FLEX': 'power-outline',
      'CHARGIN FLEX / PCB': 'flash-outline',
      '18D TEMPED GLASS': 'shield-checkmark-outline',
      '100D TEMPED GLASS': 'shield-checkmark-outline',
      'BATTERY BACKCOVER': 'battery-full-outline',
      'MATTE TEMPED GLASS': 'shield-checkmark-outline',
      'SUPER A+ GLASS': 'shield-checkmark-outline',
      'Ribbon': 'ribbon-outline',
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
      
      {/* Header */}
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