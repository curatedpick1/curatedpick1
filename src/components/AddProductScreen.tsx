import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Link as LinkIcon,
  DollarSign,
  UploadCloud,
  PlusCircle,
  Image as ImageIcon,
  Check,
  Sparkles,
  Tag,
  Star,
  ShieldCheck,
  Truck,
  Store,
  Plus,
  Trash2,
  Layers,
  Award,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Product } from '../types';

interface AddProductScreenProps {
  onBack: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const SAMPLE_PRESET_IMAGES = [
  {
    name: 'Headphones',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY2Iev_EsAXM3AQ7C3Duyiqfl-qx2Tk-NOmqN71byZTg4QC-vhF-4IggsdujmFEd5Xi5koZL9gtYO2XvJfpiEHuPqjIXyg2jfBWERD7oMAR8gAbniCrG81YqPLX3Cfsw-AYeyhAKiEmA06K_WZ6dXa2K5LjyFuVEc_F5dqT7GfCM85HoSnj1f0HkXkIwb_5mYvca2NfJOGNhucY66qALhaQnigs7T-nBD0FY88-JwmRLP8IRj5cGvI',
  },
  {
    name: 'Smartwatch',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwGVMGT-6U2Nz5DoANkEbsPwt_TZBD9_ho6dtqEEOXZigIUvedBe6gsNGVlJeox7KiXi289H4kFyGh7SHI7GHizPsVXzKQO8osU7md5edjZFafAfIDKQdjv0u7ZHhvxN3ZjmEPhvCds5SE01b6pYj3yGUMgSkvtattT1F7O6n0KEiPmwe3sXhIFrcFTXKIlu17oiJxsc7xvOxZVoQx-IFDI3i-mBvI6mznFhpbSAxE5jz9SnbRecwj',
  },
  {
    name: 'Espresso Maker',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyX7DcTCRpN5GwTDEOUpKylwGqh8JUWXdUFd3PNBY_bc1cF7W1KA_M_xVlIp1bJby6Uxfh-isetz167PwCAJRqmq7XQ3OuWgh22qmW6qewAQhg6rytm0owme8XJDPqvHCW5VbdVsT2zDn9lMUTXJzxDI8PQe2fxmDosTPsAOWz33wHyAPwFwPQFrWbeuZRRP1IeJmMtNzekj0Oy0NT1x-tKCin710tRTaSopbrgiX7XbSoT3RvdbBo',
  },
  {
    name: 'Pro Camera',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo8ufpWMNbcnDkFY4KZK9g7h0_cVHYd9ERokJjxZ5Tf5PVUa6efkSnelcp0nUQQSXTU40Mlz7m1odyt1q9mpMsaOKsvFVIy59f1cE5TIeeSjeSBdStiOvyoNNRIoZPi8PoeeZpSY2uaVqRH1orbI1NmJfGT5iaU_vGFPG7Ibds-tSlKmuR2MEykpg3RDule2752HrHvRDoBWB5JcTAWx8RLbBCAWG9vjOFlppcHTaNGU0sP0x9J9_P',
  },
  {
    name: 'Ergonomic Chair',
    url: 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Smart Speaker',
    url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fitness Sneakers',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Air Purifier',
    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
  },
];

const PRESET_BRANDS = [
  'Sony',
  'Apple',
  'Samsung',
  'Bose',
  'Dyson',
  'Anker',
  'Breville',
  'Logitech',
  'Nike',
  'Ninja',
];

const PRESET_BADGES = [
  { label: 'Editor\'s Choice', type: 'editor' as const },
  { label: 'Top Rated', type: 'top-rated' as const },
  { label: 'Best Deal', type: 'deal' as const },
  { label: 'Trending', type: 'custom' as const },
  { label: 'Staff Pick', type: 'editor' as const },
  { label: 'New Arrival', type: 'custom' as const },
];

const POPULAR_PROS = [
  'Industry-leading sound quality',
  'Exceptional battery life (30+ hours)',
  'Comfortable ergonomic build',
  'Premium sustainable materials',
  'Fast USB-C quick charging',
  'Easy multi-device Bluetooth pairing',
];

const POPULAR_CONS = [
  'Premium price point',
  'Carrying case is slightly bulky',
  'Touch controls require short learning curve',
  'Limited initial color options',
];

export const AddProductScreen: React.FC<AddProductScreenProps> = ({
  onBack,
  onAddProduct,
}) => {
  // Core Info
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');

  // Pricing & Discounts
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  // Badges & Status
  const [tag, setTag] = useState('');
  const [tagType, setTagType] = useState<'top-rated' | 'deal' | 'editor' | 'custom'>('custom');
  const [isFeatured, setIsFeatured] = useState(false);

  // Ratings & Editorial
  const [rating, setRating] = useState<number>(4.8);
  const [reviewCount, setReviewCount] = useState<number>(128);

  // Retailer & Delivery
  const [retailer, setRetailer] = useState('Amazon');
  const [availability, setAvailability] = useState<'In Stock' | 'Limited Stock' | 'Pre-Order'>('In Stock');
  const [warranty, setWarranty] = useState('1-Year Manufacturer Warranty');
  const [shippingInfo, setShippingInfo] = useState('Free 2-Day Prime Delivery');

  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  // Highlights (Pros & Cons)
  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');

  // Custom Specs (Key-value pairs)
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([
    { label: 'Connectivity', value: 'Bluetooth 5.2 / 3.5mm' },
    { label: 'Battery Life', value: 'Up to 30 Hours' },
  ]);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setSpecs((prev) => [...prev, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]);
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProPreset = (pro: string) => {
    setProsText((prev) => (prev ? `${prev}\n${pro}` : pro));
  };

  const handleAddConPreset = (con: string) => {
    setConsText((prev) => (prev ? `${prev}\n${con}` : con));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg('Please enter a product name.');
      return;
    }
    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }
    if (!affiliateLink.trim()) {
      setErrorMsg('Please provide an affiliate URL or product link.');
      return;
    }

    const finalImage =
      imageUrl.trim() ||
      imagePreview ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

    const parsedPrice = parseFloat(price) || 99;
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;

    const pros = prosText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    const cons = consText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    onAddProduct({
      name: productName.trim(),
      brand: brand.trim() || undefined,
      category,
      description: description.trim() || 'Curated high-performance product.',
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      affiliateUrl: affiliateLink.trim(),
      imageUrl: finalImage,
      rating: Number(rating) || 4.8,
      reviewCount: Number(reviewCount) || 128,
      isFeatured,
      tag: tag.trim() || (isFeatured ? 'Featured' : undefined),
      tagType,
      qrCodeValue: affiliateLink.trim() || undefined,
      retailer: retailer.trim() || 'Amazon',
      availability,
      warranty: warranty.trim() || undefined,
      shippingInfo: shippingInfo.trim() || undefined,
      specs: specs.length ? specs : undefined,
      pros: pros.length ? pros : ['High build quality', 'Reliable performance', 'Curated recommendation'],
      cons: cons.length ? cons : ['High market demand'],
      clicks: 0,
      dateAdded: new Date().toISOString(),
      priceTrend30d: parsedOriginalPrice && parsedOriginalPrice > parsedPrice
        ? {
            direction: 'down',
            changeAmount: Math.round(parsedOriginalPrice - parsedPrice),
            changePercentage: Number(
              (((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100).toFixed(1)
            ),
            previousPrice: parsedOriginalPrice,
            timeframe: '30 days',
          }
        : {
            direction: 'down',
            changeAmount: Math.round(parsedPrice * 0.08),
            changePercentage: 8.0,
            previousPrice: Math.round(parsedPrice * 1.08),
            timeframe: '30 days',
          },
    });

    setSuccessToast(true);
    setTimeout(() => {
      onBack();
    }, 800);
  };

  const parsedCurrent = parseFloat(price);
  const parsedOriginal = parseFloat(originalPrice);
  const hasDiscount = !isNaN(parsedCurrent) && !isNaN(parsedOriginal) && parsedOriginal > parsedCurrent;
  const discountPercent = hasDiscount ? Math.round(((parsedOriginal - parsedCurrent) / parsedOriginal) * 100) : 0;
  const savingsAmount = hasDiscount ? (parsedOriginal - parsedCurrent).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans pb-28 md:pb-16 transition-colors">
      {/* TopAppBar */}
      <header className="bg-[#f8f9ff]/95 backdrop-blur-md border-b border-[#c3c6ce]/40 shadow-xs fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-add-product"
            onClick={onBack}
            aria-label="Go back"
            className="text-[#43474d] hover:text-[#006b5b] p-2 rounded-full hover:bg-[#e5eeff] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-[#000c1b]">
              Add New Product
            </h1>
            <p className="text-xs text-[#74777e] hidden sm:block">
              Create and publish a verified product recommendation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-cancel-top"
            type="button"
            onClick={onBack}
            className="text-xs font-semibold px-3 py-2 text-[#43474d] hover:text-[#000c1b] hover:bg-[#e5eeff] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-header"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-[#26fedc] text-[#000c1b] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm hover:scale-102 hover:shadow-md transition-all cursor-pointer"
            title="Save Product"
          >
            <Save className="w-4 h-4" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-grow pt-20 md:pt-24 px-4 md:px-8 max-w-4xl mx-auto w-full">
        {successToast && (
          <div className="mb-4 p-4 bg-[#26fedc]/30 border border-[#006b5b] text-[#006b5b] rounded-xl flex items-center gap-2 font-semibold text-sm animate-fadeIn">
            <Check className="w-5 h-5 text-[#006b5b]" />
            Product saved successfully! Returning to catalog...
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-5 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,12,27,0.04)] border border-[#c3c6ce]/40"
        >
          {/* SECTION 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#006b5b]" />
                <span>1. Basic Product Details</span>
              </h2>
              <span className="text-[11px] font-semibold text-[#74777e] uppercase tracking-wider">
                Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="productName"
                >
                  Product Name *
                </label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Sony WH-1000XM5 Wireless Headphones"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm font-medium"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="brand"
                >
                  Brand / Manufacturer
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Sony, Apple"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm font-medium"
                />
              </div>
            </div>

            {/* Quick Brand Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-[#74777e] font-semibold mr-1">
                Suggested Brands:
              </span>
              {PRESET_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                    brand === b
                      ? 'bg-[#000c1b] text-[#26fedc]'
                      : 'bg-[#eff4ff] text-[#43474d] hover:bg-[#dce9ff]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="category"
                >
                  Category *
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] appearance-none focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm pr-10"
                  >
                    <option value="">Select a category</option>
                    <option value="Tech">Tech / Electronics</option>
                    <option value="Home">Home & Kitchen</option>
                    <option value="Fitness">Fitness & Wellness</option>
                    <option value="Beauty">Beauty & Grooming</option>
                    <option value="Outdoors">Outdoors & Travel</option>
                    <option value="Audio">Audio & Entertainment</option>
                    <option value="Office">Office & Productivity</option>
                    <option value="Books">Books & Learning</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777e] pointer-events-none text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="retailer"
                >
                  Retailer / Partner
                </label>
                <select
                  id="retailer"
                  name="retailer"
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Best Buy">Best Buy</option>
                  <option value="Walmart">Walmart</option>
                  <option value="Apple Store">Apple Store</option>
                  <option value="Target">Target</option>
                  <option value="Official Brand Store">Official Brand Store</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                htmlFor="description"
              >
                Editorial Overview & Summary
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key capabilities, real-world experience, and who this product is best suited for..."
                className="w-full p-3.5 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all resize-y text-[#0b1c30] text-sm"
              />
            </div>
          </div>

          {/* SECTION 2: Pricing, MSRP & Affiliate Link */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#006b5b]" />
                <span>2. Pricing & Affiliate Setup</span>
              </h2>
              {hasDiscount && (
                <span className="text-xs font-bold text-[#93000a] bg-[#ffdad6] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {discountPercent}% OFF Deal
                </span>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                htmlFor="affiliateLink"
              >
                Affiliate or Direct Purchase Link *
              </label>
              <div className="flex rounded-lg border border-[#c3c6ce] overflow-hidden focus-within:border-[#000c1b] focus-within:ring-2 focus-within:ring-[#000c1b]/15 transition-all bg-[#f8f9ff]">
                <span className="flex items-center px-4 bg-[#eff4ff] text-[#43474d] border-r border-[#c3c6ce]">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <input
                  id="affiliateLink"
                  name="affiliateLink"
                  type="url"
                  required
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  placeholder="https://amzn.to/... or https://brand.com/item"
                  className="flex-1 h-11 px-4 border-none bg-transparent outline-hidden text-[#0b1c30] text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="price"
                >
                  Current / Deal Price ($)
                </label>
                <div className="flex rounded-lg border border-[#c3c6ce] overflow-hidden focus-within:border-[#000c1b] focus-within:ring-2 focus-within:ring-[#000c1b]/15 transition-all bg-[#f8f9ff]">
                  <span className="flex items-center px-3.5 bg-[#eff4ff] text-[#43474d] border-r border-[#c3c6ce] font-bold text-sm">
                    $
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="349.99"
                    className="flex-1 h-11 px-4 border-none bg-transparent outline-hidden text-[#0b1c30] text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="originalPrice"
                >
                  Original Price / MSRP ($)
                </label>
                <div className="flex rounded-lg border border-[#c3c6ce] overflow-hidden focus-within:border-[#000c1b] focus-within:ring-2 focus-within:ring-[#000c1b]/15 transition-all bg-[#f8f9ff]">
                  <span className="flex items-center px-3.5 bg-[#eff4ff] text-[#43474d] border-r border-[#c3c6ce] font-bold text-sm">
                    $
                  </span>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="399.99"
                    className="flex-1 h-11 px-4 border-none bg-transparent outline-hidden text-[#0b1c30] text-sm"
                  />
                </div>
              </div>
            </div>

            {hasDiscount && (
              <div className="p-3 bg-[#e5eeff] rounded-xl border border-[#c3c6ce]/40 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#006b5b]">
                  Live Discount Calculation:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#43474d]">
                    Saves <strong>${savingsAmount}</strong>
                  </span>
                  <span className="bg-[#006b5b] text-white font-bold px-2 py-0.5 rounded-full text-[11px]">
                    -{discountPercent}% OFF
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Badges, Rating & Stock Status */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#006b5b]" />
                <span>3. Editorial Badges & Score</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="tag"
                >
                  Ribbon Badge Tag
                </label>
                <input
                  id="tag"
                  name="tag"
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g., Editor's Choice, Top Rated, Best Value"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="tagType"
                >
                  Badge Visual Style
                </label>
                <select
                  id="tagType"
                  name="tagType"
                  value={tagType}
                  onChange={(e) => setTagType(e.target.value as any)}
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden transition-all text-[#0b1c30] text-sm"
                >
                  <option value="editor">Editor Highlight (Teal Accent)</option>
                  <option value="top-rated">Top Rated (Dark Shield)</option>
                  <option value="deal">Deal / Discount (Rose Pill)</option>
                  <option value="custom">Standard Minimal</option>
                </select>
              </div>
            </div>

            {/* Quick Preset Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#74777e] font-semibold mr-1">
                Badge Presets:
              </span>
              {PRESET_BADGES.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => {
                    setTag(b.label);
                    setTagType(b.type);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    tag === b.label
                      ? 'bg-[#26fedc] text-[#000c1b] font-bold shadow-xs ring-1 ring-[#006b5b]'
                      : 'bg-[#eff4ff] text-[#43474d] hover:bg-[#dce9ff]'
                  }`}
                >
                  + {b.label}
                </button>
              ))}
            </div>

            {/* Rating & Review Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="rating"
                >
                  Editorial Score (1.0 - 5.0)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="w-24 h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-[#0b1c30] text-sm font-bold"
                  />
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(rating)
                            ? 'fill-[#006b5b] text-[#006b5b]'
                            : 'text-[#c3c6ce]'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-[#000c1b] ml-1">
                      {rating} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="reviewCount"
                >
                  Verified Reviews Count
                </label>
                <input
                  id="reviewCount"
                  name="reviewCount"
                  type="number"
                  min="0"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-[#0b1c30] text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Shipping, Warranty & Availability */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#006b5b]" />
                <span>4. Warranty, Shipping & Availability</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="availability"
                >
                  Stock Status
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-sm text-[#0b1c30]"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Limited Stock">Limited Stock</option>
                  <option value="Pre-Order">Pre-Order</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="warranty"
                >
                  Warranty & Guarantee
                </label>
                <input
                  id="warranty"
                  name="warranty"
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g., 2-Year Official Warranty"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-sm text-[#0b1c30]"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-[#43474d] mb-1.5 uppercase tracking-wide"
                  htmlFor="shippingInfo"
                >
                  Shipping Information
                </label>
                <input
                  id="shippingInfo"
                  name="shippingInfo"
                  type="text"
                  value={shippingInfo}
                  onChange={(e) => setShippingInfo(e.target.value)}
                  placeholder="e.g., Free 2-Day Prime Shipping"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-sm text-[#0b1c30]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Key Highlights (Pros & Cons) */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#006b5b]" />
                  <span>5. Product Highlights: Pros & Cons</span>
                </h2>
                <p className="text-xs text-[#74777e]">
                  Enter each point on a new line. These appear prominently in the comparison and detail view.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pros */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#006b5b] uppercase tracking-wide flex items-center gap-1"
                    htmlFor="prosText"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Why We Recommend It (Pros)
                  </label>
                </div>
                <textarea
                  id="prosText"
                  name="prosText"
                  rows={4}
                  value={prosText}
                  onChange={(e) => setProsText(e.target.value)}
                  placeholder="Superior Active Noise Cancellation&#10;Up to 30-hour battery life&#10;Featherlight ergonomic fit"
                  className="w-full p-3 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-xs sm:text-sm font-medium focus:border-[#006b5b] outline-hidden leading-relaxed"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-[#74777e] font-semibold block w-full">
                    Click to add sample pro:
                  </span>
                  {POPULAR_PROS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAddProPreset(p)}
                      className="text-[10px] bg-[#eff4ff] hover:bg-[#26fedc] text-[#000c1b] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#93000a] uppercase tracking-wide flex items-center gap-1"
                    htmlFor="consText"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Consider Before Buying (Cons)
                  </label>
                </div>
                <textarea
                  id="consText"
                  name="consText"
                  rows={4}
                  value={consText}
                  onChange={(e) => setConsText(e.target.value)}
                  placeholder="Premium price point&#10;Carrying case is slightly large"
                  className="w-full p-3 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-xs sm:text-sm font-medium focus:border-[#ba1a1a] outline-hidden leading-relaxed"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-[#74777e] font-semibold block w-full">
                    Click to add sample con:
                  </span>
                  {POPULAR_CONS.slice(0, 3).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleAddConPreset(c)}
                      className="text-[10px] bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      + {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Key Specifications */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#006b5b]" />
                  <span>6. Technical Specifications</span>
                </h2>
                <p className="text-xs text-[#74777e]">
                  Add key hardware specifications (e.g. Battery, Weight, Connectivity)
                </p>
              </div>
            </div>

            {/* Existing Specs */}
            <div className="space-y-2">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#f8f9ff] rounded-lg border border-[#c3c6ce]/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#000c1b]">{spec.label}:</span>
                    <span className="text-[#43474d]">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-[#93000a] hover:bg-[#ffdad6] p-1 rounded-md transition-colors cursor-pointer"
                    title="Remove spec"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Spec Row */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                placeholder="Spec Name (e.g. Battery, Weight)"
                className="h-10 px-3 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-xs font-semibold flex-1"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Spec Value (e.g. 30 Hours, 250g)"
                className="h-10 px-3 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="h-10 px-4 bg-[#eff4ff] hover:bg-[#000c1b] hover:text-[#26fedc] text-[#000c1b] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec</span>
              </button>
            </div>
          </div>

          {/* SECTION 7: Product Image & Media */}
          <div className="space-y-4 pt-4 border-t border-[#c3c6ce]/30">
            <div className="flex items-center justify-between border-b border-[#c3c6ce]/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#006b5b]" />
                <span>7. Product Photography & Media</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                      : 'bg-[#eff4ff] text-[#43474d]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    imageInputMode === 'url'
                      ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                      : 'bg-[#eff4ff] text-[#43474d]'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <label
                htmlFor="file-upload-input"
                className="border-2 border-dashed border-[#c3c6ce] rounded-xl p-6 flex flex-col items-center justify-center bg-[#e5eeff]/40 hover:bg-[#e5eeff] transition-colors cursor-pointer group relative"
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-36 object-contain rounded-lg mb-2 shadow-xs bg-white p-2"
                    />
                    <span className="text-xs font-bold text-[#006b5b]">
                      Click to change uploaded image
                    </span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-[#74777e] mb-2 group-hover:text-[#000c1b] transition-colors" />
                    <p className="text-sm font-medium text-[#43474d] text-center">
                      Drag and drop high-res product photo, or click to browse
                    </p>
                    <p className="text-xs text-[#74777e] mt-1 font-medium">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </>
                )}
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... or product image link"
                  className="w-full h-11 px-4 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] focus:border-[#000c1b] focus:ring-2 focus:ring-[#000c1b]/15 outline-hidden text-[#0b1c30] text-sm font-mono"
                />
                {imageUrl && (
                  <div className="h-36 bg-[#e5eeff] rounded-lg overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-full object-contain"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="pt-1">
              <span className="text-xs text-[#74777e] font-semibold block mb-2">
                Or select from curated high-res sample presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImagePreview(preset.url);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'border-[#006b5b] bg-[#26fedc]/15 ring-1 ring-[#006b5b]'
                        : 'border-[#c3c6ce]/50 bg-[#f8f9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-9 h-9 object-contain rounded-md bg-white p-0.5 shrink-0"
                    />
                    <span className="text-xs font-semibold text-[#000c1b] truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 8: Featured Toggle & Publishing */}
          <div className="pt-4 border-t border-[#c3c6ce]/30 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/40">
              <div>
                <h3 className="text-base font-bold text-[#000c1b] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#006b5b]" />
                  <span>Featured Hero Showcase</span>
                </h3>
                <p className="text-xs text-[#43474d]">
                  Promote this product prominently on the home page and featured discovery carousel.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="featured-toggle"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c3c6ce] peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-[#26fedc] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c3c6ce] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b5b]" />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                id="btn-add-product-submit"
                type="submit"
                className="w-full sm:flex-1 bg-[#26fedc] text-[#000c1b] font-bold text-sm sm:text-base h-12 rounded-xl shadow-xs hover:scale-[1.01] hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 fill-[#000c1b] text-[#26fedc]" />
                <span>Publish Product to Catalog</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-6 h-12 rounded-xl border border-[#c3c6ce] text-xs sm:text-sm font-semibold text-[#43474d] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              >
                Discard & Back
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
