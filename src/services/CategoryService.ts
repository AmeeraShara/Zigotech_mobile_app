// src/services/CategoryService.ts

export type Category = {
  id: number;
  name: string;
  type: string;
  status: number;
};

export type Product = {
  id: number | string;
  code: string;
  description: string;
  category_id: string;  
  category_name: string;
  cost: string | number;
  w_price: string | number;
  r_price: string | number;
  qty: string | number;
  color: string;
  store_name: string;
  drawer_no: string;
  image_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ApiResponse = {
  success: boolean;
  count?: number;
  data?: Product[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  has_more?: boolean;
};

// API Configuration - Hardcoded
const API_BASE_URL = 'http://localhost:8001/index.php';
const API_KEY = '2044def760224bac37860a5fab48052b1076b05865d8dfedf281155fce5ce48f';

class CategoryService {
  private static instance: CategoryService;
  private categories: Category[] = [];
  private categoryMap: Map<string, Category> = new Map();

  private constructor() {}

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Initialize categories from your SQL data
   */
  public initializeCategories(): void {
    this.categories = [
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

    this.categories.forEach(cat => {
      this.categoryMap.set(cat.id.toString(), cat);
    });
  }

  /**
   * Get all categories
   */
  public getCategories(): Category[] {
    if (this.categories.length === 0) {
      this.initializeCategories();
    }
    return this.categories;
  }

  /**
   * Get category name by ID
   */
  public getCategoryName(categoryId: string): string {
    const category = this.categoryMap.get(categoryId);
    return category ? category.name : `Category ${categoryId}`;
  }

  /**
   * Get category by ID
   */
  public getCategory(categoryId: string): Category | undefined {
    return this.categoryMap.get(categoryId);
  }

  /**
   * Get products by category ID - FIXED to use category_id
   */
  public filterProductsByCategory(products: Product[], categoryId: string): Product[] {
    return products.filter(product => {
      const productCategoryId = product.category_id?.toString() || '';
      return productCategoryId === categoryId;
    });
  }

  /**
   * Fetch products from API
   */
  public async fetchProducts(): Promise<Product[]> {
    try {
      const params = new URLSearchParams({
        components: 'api',
        action: 'fetch_inventory_items',
        api_key: API_KEY,
        page: '1',
        limit: '100',
        type: '1',
        category: 'all',
        store: 'all',
        sub_system: '0'
      });

      const url = `${API_BASE_URL}?${params.toString()}`;

      const response = await fetch(url);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Get products by category ID from API
   */
// In CategoryService.ts - add this method
public async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
        // First try to fetch from billing system API
        const params = new URLSearchParams({
            components: 'api',
            action: 'fetch_inventory_items',
            api_key: API_KEY,
            page: '1',
            limit: '1000', // Increased limit to get all products
            type: '1',
            category: categoryId, // Pass the actual category ID
            store: 'all',
            sub_system: '0'
        });

        const url = `${API_BASE_URL}?${params.toString()}`;

        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        if (data.success && data.data) {
            return data.data;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching products from billing system:', error);
        return [];
    }
}
}

export const categoryService = CategoryService.getInstance();