import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Search, Eye, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import newsApi from '../api/newsApi';
import newsCategoryApi from '../api/newsCategoryApi';
import MainLayout from '../layout/MainLayout';

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);

  const LIMIT = 12;

  const loadCategories = async () => {
    try {
      const data = await newsCategoryApi.getNewsCategories();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh mục:', error);
    }
  };

  const fetchNews = async (page = 1, category = '', query = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: LIMIT,
        status: 'published',
      };
      if (category) params.article_category_id = category;
      if (query) params.q = query;

      const response = await newsApi.getNews(params);
      setNews(Array.isArray(response?.data) ? response?.data : []);
      setTotalPages(response?.meta?.total ? Math.ceil(response.meta.total / LIMIT) : 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Lỗi lấy danh sách bài viết:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchNews(currentPage, selectedCategory, searchQuery);
  }, [currentPage, selectedCategory, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
    setSearchParams({ category: selectedCategory, q: tempSearchQuery });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setSearchParams({ category: categoryId, q: searchQuery });
  };

  const ArticleCard = ({ article }) => {
    const excerpt = article.excerpt || article.content || '';
    const text = (excerpt).replace(/<[^>]*>/g, '').substring(0, 150);
    const imageUrl = article.thumbnail_url || '/placeholder-news.jpg';

    return (
      <Link 
        to={`/news/${article.slug}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 flex flex-col h-full border border-gray-100"
      >
        {/* Thumbnail Container */}
        <div className="relative h-64 overflow-hidden bg-gray-50">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deeper/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <span className="p-6 text-brand-accent font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Đọc tiếp <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          {/* View Count */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-brand-dark px-3 py-1.5 rounded-full shadow-sm text-xs font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>{article.view_count || 0}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
          {/* Meta */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider text-brand-accent uppercase bg-gold-50 px-3 py-1 rounded-full">
              {article.category?.category_name || 'Tin tức'}
            </span>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {dayjs(article.published_at).format('DD/MM/YYYY')}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading text-xl font-bold text-brand-dark mb-3 line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
            {text}...
          </p>
        </div>
      </Link>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-brand-light pb-20">
        
        {/* Luxury Header Banner */}
        <div className="relative bg-brand-deeper text-white py-24 px-4 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-gold-500/30"></div>
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-brand-accent/20 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-brand-accent mb-6 backdrop-blur-sm border border-white/10">
               <BookOpen className="w-8 h-8" />
             </div>
             <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 tracking-tight text-white">
               Tạp chí <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-gold-300">Trang sức</span>
             </h1>
             <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
               Khám phá những câu chuyện truyền cảm hứng, xu hướng thời trang mới nhất và kiến thức chuyên sâu về thế giới kim hoàn cao cấp.
             </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Integrated Search Bar */}
          <div className="relative max-w-3xl mx-auto -mt-8 mb-12 z-20">
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white rounded-full shadow-elegant p-2 pr-2.5 border border-gray-100"
            >
              <Search className="w-5 h-5 text-gray-400 ml-5 mr-3 hidden sm:block" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, xu hướng, kiến thức..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                className="w-full px-4 py-3 outline-none text-brand-dark bg-transparent font-medium placeholder-gray-400"
              />
              <button 
                type="submit"
                className="bg-brand-deeper hover:bg-brand-dark text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="mb-12 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex justify-center min-w-max gap-3 mx-auto px-4">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  selectedCategory === ''
                    ? 'bg-brand-deeper text-white border-brand-deeper shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                Tất cả phần mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.article_category_id}
                  onClick={() => handleCategoryChange(String(cat.article_category_id))}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    selectedCategory === String(cat.article_category_id)
                      ? 'bg-brand-deeper text-white border-brand-deeper shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent hover:text-brand-accent'
                  }`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-accent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium animate-pulse">Đang tải tạp chí...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && news.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-heading font-bold text-brand-dark mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé.</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-2">
              {news.map((article) => (
                <div key={article.article_id} className="h-full animate-fade-in-up">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 mb-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-deeper hover:text-white hover:border-brand-deeper transition-colors duration-300"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-brand-deeper text-white shadow-md cursor-default'
                      : 'border border-gray-200 text-gray-600 hover:border-brand-accent hover:text-brand-accent'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-deeper hover:text-white hover:border-brand-deeper transition-colors duration-300"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Dynamic CSS styles for scrolling hide */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </MainLayout>
  );
};

export default News;
