import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Calendar,
  User,
  ArrowRight,
  X,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { BlogPost } from '../types';

interface BlogViewProps {
  blogs: BlogPost[];
  onToggleLikeBlog?: (blogId: string) => void;
  likedBlogIds?: string[];
}

export const BlogView: React.FC<BlogViewProps> = ({
  blogs,
  onToggleLikeBlog,
  likedBlogIds,
}) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Search & Category Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'quick'>('latest');

  // Local fallback storage for liked blogs if not supplied by parent
  const [internalLikedBlogIds, setInternalLikedBlogIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curated_liked_blog_ids');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const activeLikedIds = likedBlogIds ?? internalLikedBlogIds;

  // Extract unique categories dynamically from blogs
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category?.trim()) {
        cats.add(b.category.trim());
      }
    });
    return ['All', ...Array.from(cats)];
  }, [blogs]);

  // Precompute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: blogs.length };
    blogs.forEach((b) => {
      const cat = b.category?.trim() || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [blogs]);

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = blogs.filter((blog) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' ||
        blog.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      // Text query match across title, excerpt, category, author, and paragraphs
      if (!query) return true;

      const inTitle = blog.title.toLowerCase().includes(query);
      const inExcerpt = blog.excerpt.toLowerCase().includes(query);
      const inCategory = blog.category.toLowerCase().includes(query);
      const inAuthor = blog.author.toLowerCase().includes(query);
      const inContent = blog.content?.some((p) => p.toLowerCase().includes(query));

      return inTitle || inExcerpt || inCategory || inAuthor || inContent;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'popular') {
        const likesA = a.likes ?? 0;
        const likesB = b.likes ?? 0;
        return likesB - likesA;
      }
      if (sortBy === 'quick') {
        const parseReadMinutes = (str: string) => parseInt(str, 10) || 5;
        return parseReadMinutes(a.readTime) - parseReadMinutes(b.readTime);
      }
      // default: latest (preserve original array or order)
      return 0;
    });
  }, [blogs, searchQuery, selectedCategory, sortBy]);

  const isFilteringActive = searchQuery.trim() !== '' || selectedCategory !== 'All' || sortBy !== 'latest';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('latest');
  };

  const handleToggleLike = (blogId: string) => {
    if (onToggleLikeBlog) {
      onToggleLikeBlog(blogId);
    } else {
      setInternalLikedBlogIds((prev) => {
        const isAlready = prev.includes(blogId);
        const next = isAlready ? prev.filter((id) => id !== blogId) : [...prev, blogId];
        try {
          localStorage.setItem('curated_liked_blog_ids', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // Keep selected modal blog in sync with latest like status and count
    if (selectedBlog && selectedBlog.id === blogId) {
      const isAlready = activeLikedIds.includes(blogId);
      const currLikes = selectedBlog.likes ?? 0;
      setSelectedBlog((prev) =>
        prev
          ? {
              ...prev,
              likes: isAlready ? Math.max(0, currLikes - 1) : currLikes + 1,
            }
          : null
      );
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Editorial header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Buying Guides & Insights
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000c1b] dark:text-white mt-2 tracking-tight">
            Curated Editorial Articles
          </h1>
          <p className="text-sm sm:text-base text-[#43474d] dark:text-slate-300 mt-1 max-w-2xl">
            Deep-dive buyer guides, setup inspirations, and technological breakdowns written to make your purchasing decisions effortless.
          </p>
        </div>

      </div>

      {/* Blog Search & Category Filter Section */}
      <div className="bg-white dark:bg-[#0e1c2e] rounded-2xl p-4 sm:p-5 border border-[#c3c6ce]/30 dark:border-slate-800 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#74777e] dark:text-slate-400" />
            <input
              id="input-blog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, topic, product or keywords..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#13273e] focus:bg-white dark:focus:bg-[#112338] text-sm text-[#000c1b] dark:text-white placeholder:text-[#74777e] dark:placeholder:text-slate-400 rounded-xl border border-transparent focus:border-[#006b5b] dark:focus:border-[#26fedc] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                id="btn-clear-blog-search"
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-[#74777e] dark:text-slate-400 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              id="select-blog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular' | 'quick')}
              className="text-xs font-semibold bg-[#eff4ff]/70 dark:bg-[#112338] text-[#000c1b] dark:text-white border border-[#c3c6ce]/40 dark:border-slate-700 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-hidden focus:border-[#006b5b] dark:focus:border-[#26fedc]"
            >
              <option value="latest">Latest First</option>
              <option value="popular">Most Liked ❤️</option>
              <option value="quick">Quickest Read ⏱️</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="mt-3.5 pt-3 border-t border-[#eff4ff] dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#74777e] dark:text-slate-400 uppercase tracking-wider">
              Filter by Category:
            </span>
            {isFilteringActive && (
              <button
                id="btn-reset-blog-filters"
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#006b5b] dark:text-[#26fedc] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  id={`filter-blog-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-xs'
                      : 'bg-[#eff4ff]/60 dark:bg-[#112338] hover:bg-[#eff4ff] dark:hover:bg-[#193250] text-[#43474d] dark:text-slate-300 hover:text-[#000c1b] dark:hover:text-white border border-[#c3c6ce]/30 dark:border-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      isSelected
                        ? 'bg-[#26fedc]/20 dark:bg-[#000c1b]/20 text-[#26fedc] dark:text-[#000c1b]'
                        : 'bg-black/5 dark:bg-white/10 text-[#74777e] dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Summary Bar */}
        {(searchQuery.trim() || selectedCategory !== 'All') && (
          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-[#43474d] dark:text-slate-300">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Found <strong className="text-[#000c1b] dark:text-white">{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? 'article' : 'articles'}</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc] font-bold px-2 py-0.5 rounded-md">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-black dark:hover:text-white ml-0.5 cursor-pointer"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 bg-[#eff4ff] dark:bg-slate-800 text-[#000c1b] dark:text-slate-200 font-medium px-2 py-0.5 rounded-md">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-[#93000a] ml-0.5 cursor-pointer"
                    title="Remove search query"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0e1c2e] rounded-2xl border border-[#c3c6ce]/30 dark:border-slate-800 p-8 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#74777e] dark:text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#000c1b] dark:text-white">No articles published yet</h3>
          <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-300 mt-1 mb-4 max-w-md mx-auto">
            Check back for product recommendations, comparisons, and buying guides.
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        /* Empty State for Search/Filter */
        <div className="text-center py-14 bg-white dark:bg-[#0e1c2e] rounded-2xl border border-[#c3c6ce]/30 dark:border-slate-800 p-8 shadow-xs">
          <Search className="w-10 h-10 text-[#74777e] dark:text-slate-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-white">No matching articles found</h3>
          <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-300 mt-1 mb-4 max-w-md mx-auto">
            We couldn't find any guides matching your search criteria {selectedCategory !== 'All' ? `in category "${selectedCategory}"` : ''}.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              id="btn-empty-clear-filters"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search & Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="bg-white dark:bg-[#0e1c2e] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,12,27,0.05)] hover:shadow-[0_10px_30px_rgba(0,12,27,0.09)] border border-[#c3c6ce]/30 dark:border-slate-800 cursor-pointer group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative"
            >
              <div>
                <div className="h-44 w-full bg-[#e5eeff] dark:bg-slate-800 overflow-hidden relative">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(blog.category);
                      }}
                      className="bg-[#000c1b] hover:bg-[#081a2f] text-[#26fedc] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs transition-all hover:scale-105"
                      title={`Filter by ${blog.category}`}
                    >
                      {blog.category}
                    </button>
                    {blog.id.startsWith('blog-user-') && (
                      <span className="bg-[#26fedc] text-[#000c1b] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                        NEW
                      </span>
                    )}
                  </div>

                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 text-[11px] text-[#74777e] dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {blog.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {blog.readTime}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-white group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc] transition-colors leading-snug line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-3.5 pt-2 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-[#006b5b] dark:text-[#26fedc]">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

                <button
                  id={`btn-like-blog-${blog.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(blog.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeLikedIds.includes(blog.id)
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900 shadow-2xs'
                      : 'bg-[#eff4ff]/60 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#74777e] dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200/60'
                  }`}
                  title={activeLikedIds.includes(blog.id) ? 'Unlike this article' : 'Like this article'}
                  aria-label={`${activeLikedIds.includes(blog.id) ? 'Unlike' : 'Like'} ${blog.title}`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-all ${
                      activeLikedIds.includes(blog.id)
                        ? 'fill-rose-500 text-rose-500 scale-110'
                        : 'text-[#74777e] dark:text-slate-400'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold">
                    {blog.likes ?? 0}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Blog Article Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000c1b]/70 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-white dark:bg-[#0e1c2e] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#c3c6ce]/30 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#eff4ff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-[#081322]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-2.5 py-0.5 rounded-full">
                {selectedBlog.category} Guide
              </span>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-7 space-y-4">
              <div className="h-56 sm:h-64 rounded-xl overflow-hidden bg-[#e5eeff] dark:bg-slate-800">
                <img
                  src={selectedBlog.imageUrl}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#74777e] dark:text-slate-400 pb-1">
                <div className="flex items-center gap-2.5">
                  <span>
                    By <strong className="text-[#000c1b] dark:text-white">{selectedBlog.author}</strong>
                  </span>
                  <span>•</span>
                  <span>{selectedBlog.date}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime}</span>
                </div>

                <button
                  id={`btn-like-modal-${selectedBlog.id}`}
                  type="button"
                  onClick={() => handleToggleLike(selectedBlog.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLikedIds.includes(selectedBlog.id)
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs'
                      : 'bg-[#eff4ff] dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#43474d] dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-[#c3c6ce]/40 dark:border-slate-700'
                  }`}
                  title={activeLikedIds.includes(selectedBlog.id) ? 'Unlike this article' : 'Like this article'}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      activeLikedIds.includes(selectedBlog.id)
                        ? 'fill-rose-500 text-rose-500 scale-110'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{activeLikedIds.includes(selectedBlog.id) ? 'Liked' : 'Like Article'}</span>
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-xs font-bold">
                    {selectedBlog.likes ?? 0}
                  </span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#000c1b] dark:text-white leading-tight">
                {selectedBlog.title}
              </h1>

              <div className="space-y-4 text-sm sm:text-base text-[#43474d] dark:text-slate-300 leading-relaxed pt-2 border-t border-[#eff4ff] dark:border-slate-800">
                {selectedBlog.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#eff4ff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-[#081322] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleLike(selectedBlog.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeLikedIds.includes(selectedBlog.id)
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#43474d] dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-[#c3c6ce]/50 dark:border-slate-700'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    activeLikedIds.includes(selectedBlog.id)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{activeLikedIds.includes(selectedBlog.id) ? 'You liked this' : 'Like this article'}</span>
                <span className="font-mono ml-0.5 font-bold">({selectedBlog.likes ?? 0})</span>
              </button>

              <button
                onClick={() => setSelectedBlog(null)}
                className="bg-[#26fedc] text-[#000c1b] font-bold px-5 py-2.5 rounded-xl text-sm hover:scale-105 transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
