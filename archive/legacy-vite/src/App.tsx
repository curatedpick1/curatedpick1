/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { TrendingSection } from './components/TrendingSection';
import { EditorsChoiceSection } from './components/EditorsChoiceSection';
import { CategoryChips } from './components/CategoryChips';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { CompareModal } from './components/CompareModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { BackToTopButton } from './components/BackToTopButton';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { ReviewsView } from './components/ReviewsView';
import { DealsView } from './components/DealsView';
import { SavedView } from './components/SavedView';
import { BlogView } from './components/BlogView';
import { Drawer } from './components/Drawer';
import { Footer } from './components/Footer';
import { DisclosureModal } from './components/DisclosureModal';
import { MyActivityModal } from './components/MyActivityModal';
import { SettingsModal } from './components/SettingsModal';
import { OptionalLoginModal } from './components/OptionalLoginModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AiFloatingButton } from './components/AiFloatingButton';
import { PriceTrendBadge } from './components/PriceTrendBadge';
import { ProductShareButton } from './components/ProductShareButton';
import {
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_DEALS,
  INITIAL_BLOGS,
} from './data/initialData';
import { Product, ReviewItem, DealItem, BlogPost, NavigationTab, PriceAlertConfig, UserProfile } from './types';
import { Sparkles, ArrowRight, Star, ShoppingCart, Tag, Filter, Heart, BellRing, Scale, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Tech', 'Home', 'Fitness', 'Beauty', 'Outdoors', 'Books'];

export default function App() {
  // State initialization with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => {
          if (!p.priceTrend30d) {
            const init = INITIAL_PRODUCTS.find((item) => item.id === p.id);
            if (init?.priceTrend30d) {
              return { ...p, priceTrend30d: init.priceTrend30d };
            }
          }
          return p;
        });
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_PRODUCTS;
  });

  // Wishlist product IDs stored in localStorage
  const [savedProductIds, setSavedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_wishlist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return ['prod-1', 'prod-3']; // initial sample saved items for discovery
  });

  // Price alerts stored in localStorage
  const [priceAlerts, setPriceAlerts] = useState<Record<string, PriceAlertConfig>>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_price_alerts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // initial sample alert on prod-2
    return {
      'prod-2': {
        productId: 'prod-2',
        enabled: true,
        targetPrice: 179,
        notifyOnAnyDrop: true,
        createdAt: new Date().toISOString(),
      },
    };
  });

  // Compare products state (max 3)
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_compared');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return ['prod-1', 'prod-2']; // initial sample compared items
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  const [reviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [deals] = useState<DealItem[]>(INITIAL_DEALS);
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_blogs');
      if (saved) {
        const parsed: BlogPost[] = JSON.parse(saved);
        return parsed.map((b) => {
          const init = INITIAL_BLOGS.find((item) => item.id === b.id);
          return {
            ...b,
            likes: typeof b.likes === 'number' ? b.likes : (init?.likes ?? 0),
          };
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_BLOGS;
  });

  const [likedBlogIds, setLikedBlogIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curated_liked_blog_ids');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceAlertProduct, setPriceAlertProduct] = useState<Product | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [disclosureType, setDisclosureType] = useState<
    'disclosure' | 'privacy' | 'terms' | 'contact' | null
  >(null);

  // User Profile state with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curated_pick_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Local profiles are preferences, never an authorization source.
        delete parsed.role;
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      name: 'Guest',
      email: '',
      isLoggedIn: false,
      memberSince: 'August 2026',
      currency: 'USD',
      notifications: {
        priceDrops: true,
        weeklyDigest: true,
        reviewReplies: true,
      },
    };
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityInitialTab, setActivityInitialTab] = useState<
    'overview' | 'saved' | 'alerts' | 'reviews'
  >('overview');
  const [reviewsUpdateTrigger, setReviewsUpdateTrigger] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [userToast, setUserToast] = useState<string | null>(null);

  // Ensure permanent clean light mode across all sessions
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.removeItem('curated_pick_theme');
    } catch {
      // ignore
    }
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'curated_pick_user_profile',
        JSON.stringify(userProfile)
      );
    } catch (e) {
      console.warn('Could not save user profile to localStorage', e);
    }
  }, [userProfile]);

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem('curated_pick_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Could not save products to localStorage', e);
    }
  }, [products]);

  // Sync wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        'curated_pick_wishlist',
        JSON.stringify(savedProductIds)
      );
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [savedProductIds]);

  // Sync price alerts to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        'curated_pick_price_alerts',
        JSON.stringify(priceAlerts)
      );
    } catch (e) {
      console.warn('Could not save price alerts to localStorage', e);
    }
  }, [priceAlerts]);

  // Sync compare items to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        'curated_pick_compared',
        JSON.stringify(compareProductIds)
      );
    } catch (e) {
      console.warn('Could not save compared items to localStorage', e);
    }
  }, [compareProductIds]);

  // Sync blogs to local storage
  useEffect(() => {
    try {
      localStorage.setItem('curated_pick_blogs', JSON.stringify(blogs));
    } catch (e) {
      console.warn('Could not save blogs to localStorage', e);
    }
  }, [blogs]);

  const handleToggleWishlist = (productId: string) => {
    setSavedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleLikeBlog = (blogId: string) => {
    const isCurrentlyLiked = likedBlogIds.includes(blogId);
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id !== blogId) return b;
        const currentLikes = typeof b.likes === 'number' ? b.likes : 0;
        const newLikes = isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        return { ...b, likes: newLikes };
      })
    );
    setLikedBlogIds((prev) => {
      const next = isCurrentlyLiked ? prev.filter((id) => id !== blogId) : [...prev, blogId];
      try {
        localStorage.setItem('curated_liked_blog_ids', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save liked blog ids', e);
      }
      return next;
    });
  };

  const handleClearAllWishlist = () => {
    setSavedProductIds([]);
  };

  const handleToggleCompare = (productId: string) => {
    if (compareProductIds.includes(productId)) {
      setCompareProductIds((prev) => prev.filter((id) => id !== productId));
    } else {
      if (compareProductIds.length >= 3) {
        setCompareToast('You can compare up to 3 products at a time.');
        setTimeout(() => setCompareToast(null), 3000);
        return;
      }
      setCompareProductIds((prev) => [...prev, productId]);
    }
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearCompare = () => {
    setCompareProductIds([]);
  };

  const handleSavePriceAlert = (config: PriceAlertConfig) => {
    setPriceAlerts((prev) => ({
      ...prev,
      [config.productId]: config,
    }));

    // Also update product flag on the product object
    setProducts((prev) =>
      prev.map((p) =>
        p.id === config.productId
          ? {
              ...p,
              hasPriceAlert: true,
              priceAlertTarget: config.targetPrice,
              priceAlertEmail: config.email,
            }
          : p
      )
    );

    // If modal product is open, update it
    if (selectedProduct && selectedProduct.id === config.productId) {
      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              hasPriceAlert: true,
              priceAlertTarget: config.targetPrice,
              priceAlertEmail: config.email,
            }
          : null
      );
    }
  };

  const handleRemovePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              hasPriceAlert: false,
              priceAlertTarget: undefined,
              priceAlertEmail: undefined,
            }
          : p
      )
    );

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              hasPriceAlert: false,
              priceAlertTarget: undefined,
              priceAlertEmail: undefined,
            }
          : null
      );
    }
  };

  const handleTrackClick = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, clicks: (p.clicks || 0) + 1 } : p))
    );
  };

  const handleOpenSearch = () => {
    setCurrentTab('home');
    setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleLogout = () => {
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
    setUserToast('Signed out. You are now browsing freely in Guest mode.');
    setTimeout(() => setUserToast(null), 3500);
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSubmit = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updated,
      isLoggedIn: true,
    }));

    setIsLoginModalOpen(false);
    setUserToast(`Welcome back, ${updated.name || userProfile.name}!`);
    setTimeout(() => setUserToast(null), 3500);
  };

  const handleContinueGuest = () => {
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
    setIsLoginModalOpen(false);
    setUserToast('Continuing in Guest Mode — all features are 100% accessible!');
    setTimeout(() => setUserToast(null), 3500);
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    setUserToast('Preferences updated successfully.');
    setTimeout(() => setUserToast(null), 3500);
  };

  const handleResetData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSavedProductIds(['prod-1', 'prod-3']);
    setPriceAlerts({
      'prod-2': {
        productId: 'prod-2',
        enabled: true,
        targetPrice: 179,
        notifyOnAnyDrop: true,
        createdAt: new Date().toISOString(),
      },
    });
    setCompareProductIds(['prod-1', 'prod-2']);
    setUserToast('Reset local app state to default.');
    setTimeout(() => setUserToast(null), 3500);
  };

  // Handle when a review is submitted in the product modal
  const handleReviewSubmitted = () => {
    setReviewsUpdateTrigger((prev) => prev + 1);
    setUserToast('Review published and saved to My Activity!');
    setTimeout(() => setUserToast(null), 4000);
  };

  // Count reviews for user profile badge
  const userReviewsCount = React.useMemo(() => {
    let count = 0;
    products.forEach((p) => {
      try {
        const stored = localStorage.getItem(`curated_pick_user_reviews_${p.id}`);
        if (stored) {
          const list = JSON.parse(stored);
          count += list.length;
        }
      } catch {
        // ignore
      }
    });
    return count;
  }, [products, isActivityModalOpen, reviewsUpdateTrigger]);

  // Filter products based on search & category
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Get saved products list
  const savedProductsList = products.filter((p) =>
    savedProductIds.includes(p.id)
  );

  // Get compared products list
  const comparedProductsList = products.filter((p) =>
    compareProductIds.includes(p.id)
  );

  const featuredReview =
    reviews.find((r) => r.productId === 'prod-4') || reviews[0];

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#070e17] text-[#0b1c30] dark:text-[#e4ebf5] flex flex-col font-sans selection:bg-[#26fedc] selection:text-[#000c1b] transition-colors duration-200">
      {/* Top Header */}
      <Header
        savedCount={savedProductIds.length}
        alertsCount={Object.keys(priceAlerts).length}
        reviewsCount={userReviewsCount}
        user={userProfile}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSearch={handleOpenSearch}
        onNavigateToSaved={() => setCurrentTab('saved')}
        onNavigateHome={() => {
          setCurrentTab('home');
          setSelectedCategory('All');
          setSearchQuery('');
        }}
        onOpenActivity={() => setIsActivityModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
        onLogin={handleOpenLogin}
      />

      {/* Main App Body */}
      <main className="flex-1 pt-16">
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              inputRef={searchInputRef}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={(e) => {
                e.preventDefault();
              }}
            />

            {/* If searching or filtering, show results banner */}
            {(searchQuery.trim() || selectedCategory !== 'All') && (
              <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
                <div className="bg-white dark:bg-[#0e1d30] p-4 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] uppercase tracking-wider">
                      Search & Filter Results
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-white">
                      Found {filteredProducts.length} product
                      {filteredProducts.length === 1 ? '' : 's'}
                      {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                      {searchQuery ? ` for "${searchQuery}"` : ''}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-xs text-[#006b5b] dark:text-[#26fedc] font-bold hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0e1d30] rounded-2xl border border-[#c3c6ce]/30 dark:border-slate-800 mt-4">
                    <p className="text-[#43474d] dark:text-slate-300 text-base font-medium">
                      No matching products found.
                    </p>
                    <p className="text-xs text-[#74777e] dark:text-slate-400 mt-1">
                      Try adjusting your search query or select another category.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-4 bg-[#26fedc] text-[#000c1b] font-bold px-4 py-2 rounded-xl text-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {filteredProducts.map((product) => {
                      const isSaved = savedProductIds.includes(product.id);
                      const isCompared = compareProductIds.includes(product.id);

                      return (
                        <div
                          key={product.id}
                          id={`search-card-${product.id}`}
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white dark:bg-[#112338] rounded-xl p-3.5 shadow-xs hover:shadow-md border border-[#c3c6ce]/30 dark:border-slate-800 flex flex-col justify-between cursor-pointer group transition-all relative"
                        >
                          <div>
                            <div className="w-full h-40 bg-[#e5eeff] dark:bg-slate-800 rounded-lg mb-2.5 overflow-hidden relative">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {product.tag && (
                                <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#26fedc] text-[#006b5b]">
                                  {product.tag}
                                </div>
                              )}
                              
                              {/* Top action buttons: Share & Wishlist */}
                              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                <ProductShareButton
                                  product={product}
                                  variant="overlay"
                                  onNotify={(msg) => setUserToast(msg)}
                                />
                                <button
                                  id={`btn-search-save-${product.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWishlist(product.id);
                                  }}
                                  className={`p-1.5 rounded-full backdrop-blur-xs transition-all duration-200 shadow-xs ${
                                    isSaved
                                      ? 'bg-white text-[#93000a] scale-110 shadow-md'
                                      : 'bg-white/80 hover:bg-white text-[#74777e] hover:text-[#93000a] opacity-85 group-hover:opacity-100 hover:scale-110'
                                  }`}
                                  title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                                  aria-label="Save to wishlist"
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      isSaved ? 'fill-[#93000a] text-[#93000a]' : 'text-current'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] font-semibold text-[#74777e] dark:text-slate-400 uppercase">
                              {product.category}
                            </div>
                            <h3 className="text-sm font-bold text-[#000c1b] dark:text-white group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc] truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-xs text-[#43474d] dark:text-slate-300">
                              <Star className="w-3.5 h-3.5 fill-[#006b5b] text-[#006b5b]" />
                              <span>
                                {product.rating} ({product.reviewCount})
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-3 mt-3 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-base font-bold text-[#000c1b] dark:text-white">
                                  ${product.price}
                                </span>
                                <PriceTrendBadge product={product} />
                              </div>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs text-[#74777e] dark:text-slate-400 line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {/* Quick Share Button */}
                              <ProductShareButton
                                product={product}
                                variant="footer"
                                onNotify={(msg) => setUserToast(msg)}
                              />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                }}
                                className="bg-[#006b5b]/10 dark:bg-[#26fedc]/15 text-[#006b5b] dark:text-[#26fedc] hover:bg-[#26fedc] hover:text-[#000c1b] dark:hover:bg-[#26fedc] dark:hover:text-[#000c1b] rounded-full p-2 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Trending Section */}
            <TrendingSection
              products={products}
              savedProductIds={savedProductIds}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onToggleWishlist={handleToggleWishlist}
              onNotify={(msg) => setUserToast(msg)}
              onViewAll={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />

            {/* Editor's Choice Section */}
            <EditorsChoiceSection
              featuredReview={featuredReview}
              onReadReview={(r) => setSelectedReview(r)}
            />

            {/* Category Chips Section */}
            <CategoryChips
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
              }}
            />
          </div>
        )}

        {currentTab === 'saved' && (
          <SavedView
            savedProducts={savedProductsList}
            priceAlerts={priceAlerts}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onToggleWishlist={handleToggleWishlist}
            onOpenPriceAlert={(p) => setPriceAlertProduct(p)}
            onNavigateHome={() => setCurrentTab('home')}
            onClearAllSaved={handleClearAllWishlist}
            onNotify={(msg) => setUserToast(msg)}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            onSelectReview={(r) => setSelectedReview(r)}
          />
        )}

        {currentTab === 'deals' && <DealsView deals={deals} />}

        {currentTab === 'blog' && (
          <BlogView
            blogs={blogs}
            likedBlogIds={likedBlogIds}
            onToggleLikeBlog={handleToggleLikeBlog}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenDisclosure={() => setDisclosureType('disclosure')}
        onOpenPolicy={(type) => setDisclosureType(type)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        savedCount={savedProductIds.length}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-out Drawer Menu */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        savedCount={savedProductIds.length}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenDisclosure={() => setDisclosureType('disclosure')}
        user={userProfile}
        onOpenActivity={() => setIsActivityModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogin={handleOpenLogin}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isSaved={selectedProduct ? savedProductIds.includes(selectedProduct.id) : false}
        hasPriceAlert={
          selectedProduct ? Boolean(priceAlerts[selectedProduct.id]?.enabled) : false
        }
        priceAlertConfig={selectedProduct ? priceAlerts[selectedProduct.id] || null : null}
        onToggleWishlist={handleToggleWishlist}
        onOpenPriceAlert={(p) => setPriceAlertProduct(p)}
        onClose={() => setSelectedProduct(null)}
        onProductClickTrack={handleTrackClick}
        userProfile={userProfile}
        onReviewSubmitted={handleReviewSubmitted}
        onOpenActivity={() => {
          setSelectedProduct(null);
          setActivityInitialTab('reviews');
          setIsActivityModalOpen(true);
        }}
      />

      {/* Price Alert Configuration Modal */}
      <PriceAlertModal
        product={priceAlertProduct}
        isOpen={Boolean(priceAlertProduct)}
        onClose={() => setPriceAlertProduct(null)}
        existingAlert={
          priceAlertProduct ? priceAlerts[priceAlertProduct.id] || null : null
        }
        onSaveAlert={handleSavePriceAlert}
        onRemoveAlert={handleRemovePriceAlert}
      />

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />

      {/* FTC Disclosure & Policies Modal */}
      <DisclosureModal
        type={disclosureType}
        onClose={() => setDisclosureType(null)}
      />

      {/* Compare Modal */}
      <CompareModal
        products={comparedProductsList}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearCompare}
        onSelectProductDetails={(product) => {
          setSelectedProduct(product);
          setIsCompareModalOpen(false);
        }}
        onProductClickTrack={handleTrackClick}
      />

      {/* Persistent Compare Floating Bar */}
      <CompareFloatingBar
        comparedProducts={comparedProductsList}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearCompare}
      />

      {/* My Activity Modal */}
      <MyActivityModal
        isOpen={isActivityModalOpen}
        initialTab={activityInitialTab}
        onClose={() => {
          setIsActivityModalOpen(false);
          setActivityInitialTab('overview');
        }}
        user={userProfile}
        savedProducts={savedProductsList}
        onRemoveSaved={handleToggleWishlist}
        onViewProduct={(prod) => setSelectedProduct(prod)}
        priceAlerts={priceAlerts}
        allProducts={products}
        onRemovePriceAlert={handleRemovePriceAlert}
        comparedProductIds={compareProductIds}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onOpenSettings={() => {
          setIsActivityModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
        reviewsUpdateTrigger={reviewsUpdateTrigger}
        onReviewsUpdated={() => setReviewsUpdateTrigger((prev) => prev + 1)}
      />

      {/* User Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={userProfile}
        onUpdateUser={handleUpdateUser}
        onResetData={handleResetData}
      />

      {/* Optional Login & Guest Access Modal (No force for login) */}
      <OptionalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={userProfile}
        onLoginSubmit={handleLoginSubmit}
        onContinueGuest={handleContinueGuest}
      />

      {/* AI Q&A Assistant Modal (Amazon, Pinterest, Deals & Site Guide) */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        products={products}
        currentUser={userProfile}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          setIsAiAssistantOpen(false);
        }}
      />

      {/* Floating AI Assistant Trigger Button */}
      <AiFloatingButton onOpen={() => setIsAiAssistantOpen(true)} />

      {/* Compare Limit Toast Notification */}
      {compareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#000c1b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[#26fedc]/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <AlertCircle className="w-4 h-4 text-[#26fedc]" />
          <span>{compareToast}</span>
        </div>
      )}

      {/* User Session & Status Notification Toast */}
      {userToast && (
        <div className="fixed top-20 right-4 md:right-8 z-50 bg-[#000c1b] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-[#26fedc]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#26fedc] shrink-0" />
          <span>{userToast}</span>
        </div>
      )}

      {/* Floating Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}

