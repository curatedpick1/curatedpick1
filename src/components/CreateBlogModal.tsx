import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Check,
  Calendar,
  Clock,
  User,
  Plus,
} from 'lucide-react';
import { BlogPost, UserProfile } from '../types';

interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBlog: (newBlog: BlogPost) => void;
  userProfile?: UserProfile;
}

const PRESET_BLOG_IMAGES = [
  {
    name: 'Camera & Tech Gear',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo8ufpWMNbcnDkFY4KZK9g7h0_cVHYd9ERokJjxZ5Tf5PVUa6efkSnelcp0nUQQSXTU40Mlz7m1odyt1q9mpMsaOKsvFVIy59f1cE5TIeeSjeSBdStiOvyoNNRIoZPi8PoeeZpSY2uaVqRH1orbI1NmJfGT5iaU_vGFPG7Ibds-tSlKmuR2MEykpg3RDule2752HrHvRDoBWB5JcTAWx8RLbBCAWG9vjOFlppcHTaNGU0sP0x9J9_P',
  },
  {
    name: 'Desk Setup & Workspace',
    url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Wireless Audio & Headphones',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY2Iev_EsAXM3AQ7C3Duyiqfl-qx2Tk-NOmqN71byZTg4QC-vhF-4IggsdujmFEd5Xi5koZL9gtYO2XvJfpiEHuPqjIXyg2jfBWERD7oMAR8gAbniCrG81YqPLX3Cfsw-AYeyhAKiEmA06K_WZ6dXa2K5LjyFuVEc_F5dqT7GfCM85HoSnj1f0HkXkIwb_5mYvca2NfJOGNhucY66qALhaQnigs7T-nBD0FY88-JwmRLP8IRj5cGvI',
  },
  {
    name: 'Smartwatch & Fitness',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwGVMGT-6U2Nz5DoANkEbsPwt_TZBD9_ho6dtqEEOXZigIUvedBe6gsNGVlJeox7KiXi289H4kFyGh7SHI7GHizPsVXzKQO8osU7md5edjZFafAfIDKQdjv0u7ZHhvxN3ZjmEPhvCds5SE01b6pYj3yGUMgSkvtattT1F7O6n0KEiPmwe3sXhIFrcFTXKIlu17oiJxsc7xvOxZVoQx-IFDI3i-mBvI6mznFhpbSAxE5jz9SnbRecwj',
  },
  {
    name: 'Espresso & Kitchen',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyX7DcTCRpN5GwTDEOUpKylwGqh8JUWXdUFd3PNBY_bc1cF7W1KA_M_xVlIp1bJby6Uxfh-isetz167PwCAJRqmq7XQ3OuWgh22qmW6qewAQhg6rytm0owme8XJDPqvHCW5VbdVsT2zDn9lMUTXJzxDI8PQe2fxmDosTPsAOWz33wHyAPwFwPQFrWbeuZRRP1IeJmMtNzekj0Oy0NT1x-tKCin710tRTaSopbrgiX7XbSoT3RvdbBo',
  },
];

const CATEGORIES = [
  'Tech',
  'Audio',
  'Fitness',
  'Home',
  'Kitchen',
  'Gaming',
  'Workspace',
  'Lifestyle',
];

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
  isOpen,
  onClose,
  onSaveBlog,
  userProfile,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tech');
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState(userProfile?.name || 'Editorial Team');
  const [readTime, setReadTime] = useState('4 min read');
  const [excerpt, setExcerpt] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_BLOG_IMAGES[0].url);
  const [imageInputMode, setImageInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [imagePreview, setImagePreview] = useState<string | null>(PRESET_BLOG_IMAGES[0].url);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageUrl(result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (val: string) => {
    setContentBody(val);
    // Auto-calculate read time estimate
    const words = val.trim().split(/\s+/).filter(Boolean).length;
    if (words > 0) {
      const mins = Math.max(1, Math.ceil(words / 180));
      setReadTime(`${mins} min read`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter an article title');
      return;
    }

    if (!excerpt.trim()) {
      setErrorMsg('Please provide a brief excerpt or summary for the article preview');
      return;
    }

    if (!contentBody.trim()) {
      setErrorMsg('Please write some content paragraphs for your article');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'General') : category;
    const finalImage = imageUrl.trim() || PRESET_BLOG_IMAGES[0].url;

    // Split content into clean paragraphs
    const paragraphs = contentBody
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const todayStr = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    const newBlog: BlogPost = {
      id: `blog-user-${Date.now()}`,
      title: title.trim(),
      category: finalCategory,
      readTime: readTime || '4 min read',
      date: todayStr,
      author: author.trim() || 'Curated Editorial',
      excerpt: excerpt.trim(),
      content: paragraphs.length > 0 ? paragraphs : [contentBody.trim()],
      imageUrl: finalImage,
      likes: 0,
    };

    onSaveBlog(newBlog);
    onClose();
  };

  return (
    <div
      id="create-blog-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#000c1b]/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="create-blog-modal-container"
        className="bg-white dark:bg-[#0e1c2e] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#c3c6ce]/40 dark:border-slate-800 my-6 flex flex-col max-h-[92vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#eff4ff] dark:border-slate-800 bg-gradient-to-r from-[#f8f9ff] to-[#eff4ff] dark:from-[#091524] dark:to-[#0e1c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#000c1b] dark:text-white tracking-tight">
                Create New Article & Guide
              </h2>
              <p className="text-xs text-[#74777e] dark:text-slate-400">
                Publish a buying guide, product comparison, or curated review breakdown
              </p>
            </div>
          </div>
          <button
            id="btn-close-create-blog-modal"
            type="button"
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] dark:bg-[#410002] text-[#93000a] dark:text-[#ffb4ab] text-xs font-semibold rounded-xl flex items-center gap-2 border border-[#93000a]/20">
              <X className="w-4 h-4 shrink-0 cursor-pointer" onClick={() => setErrorMsg('')} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
              Article Title <span className="text-[#93000a] dark:text-rose-400">*</span>
            </label>
            <input
              id="input-blog-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 Best Wireless ANC Headphones for Commuters in 2026"
              className="w-full px-3.5 py-2.5 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] focus:ring-2 focus:ring-[#26fedc]/40 outline-hidden text-sm font-semibold text-[#000c1b] dark:text-white placeholder:text-[#74777e]/70 dark:placeholder:text-slate-500 transition-all"
              required
            />
          </div>

          {/* Category & Read Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
                Category
              </label>
              <select
                id="select-blog-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] outline-hidden text-xs font-semibold text-[#000c1b] dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  placeholder="Custom Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-[#112338] text-[#000c1b] dark:text-white rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
                Author Name
              </label>
              <input
                id="input-blog-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author Name"
                className="w-full px-3 py-2 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] outline-hidden text-xs font-medium text-[#000c1b] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
                Estimated Read Time
              </label>
              <input
                id="input-blog-readtime"
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full px-3 py-2 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] outline-hidden text-xs font-medium text-[#000c1b] dark:text-white"
              />
            </div>
          </div>

          {/* Featured Image Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
              Featured Banner Image
            </label>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageInputMode('preset')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  imageInputMode === 'preset'
                    ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b]'
                    : 'bg-[#eff4ff] dark:bg-slate-800 text-[#43474d] dark:text-slate-300 hover:bg-[#e2ebfa] dark:hover:bg-slate-700'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  imageInputMode === 'upload'
                    ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b]'
                    : 'bg-[#eff4ff] dark:bg-slate-800 text-[#43474d] dark:text-slate-300 hover:bg-[#e2ebfa] dark:hover:bg-slate-700'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  imageInputMode === 'url'
                    ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b]'
                    : 'bg-[#eff4ff] dark:bg-slate-800 text-[#43474d] dark:text-slate-300 hover:bg-[#e2ebfa] dark:hover:bg-slate-700'
                }`}
              >
                Custom URL
              </button>
            </div>

            {/* Presets Gallery */}
            {imageInputMode === 'preset' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRESET_BLOG_IMAGES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(item.url);
                      setImagePreview(item.url);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 text-left transition-all aspect-video cursor-pointer ${
                      imageUrl === item.url
                        ? 'border-[#006b5b] dark:border-[#26fedc] ring-2 ring-[#26fedc]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] px-1 py-0.5 font-medium truncate">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Upload Mode */}
            {imageInputMode === 'upload' && (
              <div className="border-2 border-dashed border-[#c3c6ce]/60 dark:border-slate-700 hover:border-[#006b5b] dark:hover:border-[#26fedc] rounded-xl p-4 text-center bg-[#eff4ff]/30 dark:bg-slate-800/30 transition-colors">
                <input
                  type="file"
                  id="file-upload-blog-image"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload-blog-image"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-6 h-6 text-[#006b5b] dark:text-[#26fedc]" />
                  <span className="text-xs font-bold text-[#000c1b] dark:text-white">
                    Click or drag to upload article image
                  </span>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                </label>
              </div>
            )}

            {/* URL Mode */}
            {imageInputMode === 'url' && (
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                className="w-full px-3.5 py-2 bg-[#eff4ff]/60 dark:bg-[#112338] text-[#000c1b] dark:text-white rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 text-xs font-mono"
              />
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2 relative rounded-xl overflow-hidden h-36 bg-slate-100 dark:bg-slate-800 border border-[#c3c6ce]/40 dark:border-slate-700 max-w-sm">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(null)}
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                  Banner Preview
                </span>
              </div>
            )}
          </div>

          {/* Excerpt / Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200 mb-1.5">
              Short Excerpt / Teaser <span className="text-[#93000a] dark:text-rose-400">*</span>
            </label>
            <textarea
              id="input-blog-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary that appears on the card (1-2 sentences)..."
              className="w-full px-3.5 py-2 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] outline-hidden text-xs text-[#000c1b] dark:text-white placeholder:text-[#74777e]/70 dark:placeholder:text-slate-500 leading-relaxed"
              required
            />
          </div>

          {/* Full Article Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#000c1b] dark:text-slate-200">
                Article Body Content <span className="text-[#93000a] dark:text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-[#74777e] dark:text-slate-400">Separate paragraphs with a blank line</span>
            </div>
            <textarea
              id="input-blog-content"
              rows={6}
              value={contentBody}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your article here...&#10;&#10;Introduce the products, highlight key features, explain real-world testing results, and give your final verdict."
              className="w-full px-3.5 py-3 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] outline-hidden text-xs sm:text-sm text-[#000c1b] dark:text-white placeholder:text-[#74777e]/70 dark:placeholder:text-slate-500 leading-relaxed font-sans"
              required
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#eff4ff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-[#081322] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-submit-publish-blog"
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};
