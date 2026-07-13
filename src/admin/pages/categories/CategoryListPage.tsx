import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, RotateCw, ChevronRight, ChevronDown, 
  Filter, Eye, Edit3, Smartphone, Laptop, Tv, WashingMachine, 
  Info, X, Upload, Check, AlertCircle, ArrowUpRight, 
  HelpCircle, Folder, FileText, BarChart2, Download, CheckSquare, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

// Types for Category
import { AdminCategory as Category } from '@shared/types/domain';
import {
  useCategoryList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../../features/categories/hooks/useCategory';

// Map icon string to React component
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  Tv: Tv,
  WashingMachine: WashingMachine,
  Folder: Folder,
  FileText: FileText,
};

export default function CategoryListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  // Real Backend Integration
  const { data: categoryListResp, isLoading, isError, refetch } = useCategoryList({ limit: 1000 });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = useMemo<Category[]>(() => {
    if (!categoryListResp?.data) return [];
    return categoryListResp.data.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code || '',
      slug: item.code ? item.code.toLowerCase() : '',
      parentId: item.parent_id || null,
      description: item.description || '',
      status: item.is_active ? 'ACTIVE' : 'INACTIVE',
      icon: item.parent_id ? 'Laptop' : 'Folder', // Dynamically style child vs root categories
      createdAt: item.created_at ? new Date(item.created_at).toISOString().substring(0, 10) : '',
      updatedAt: item.updated_at ? new Date(item.updated_at).toISOString().replace('T', ' ').substring(0, 16) : ''
    }));
  }, [categoryListResp]);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    parentId: '',
    description: '',
    icon: 'Folder',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ROOT' | 'CHILD'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');
  const [selectedTreeCategory, setSelectedTreeCategory] = useState<string | null>(null);

  // Tree Expand/Collapse state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // KPI card selection filter
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'ROOT' | 'CHILD'>('ALL');

  // Tooltip descriptions for KPI cards
  const [hoveredKpi, setHoveredKpi] = useState<string | null>(null);

  // Handle open create drawer
  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setFormData({
      name: '',
      code: '',
      slug: '',
      parentId: selectedTreeCategory || '',
      description: '',
      icon: 'Folder',
      status: 'ACTIVE'
    });
    setIconFile(null);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  // Handle open edit drawer
  const handleOpenEdit = (category: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('EDIT');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      slug: category.slug,
      parentId: category.parentId || '',
      description: category.description,
      icon: category.icon,
      status: category.status
    });
    setIconFile(category.icon !== 'Folder' ? 'custom-icon.png' : null);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  // Handle open view drawer (detail)
  const handleOpenView = (category: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('VIEW');
    setSelectedCategory(category);
    setIsDrawerOpen(true);
  };

  // Handle status toggle (Kích hoạt / Vô hiệu hóa)
  const handleToggleStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          status: nextStatus
        }
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái.');
    }
  };

  // Form submission (Create / Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setFormError('Tên danh mục là bắt buộc.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Mã danh mục là bắt buộc.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug danh mục là bắt buộc.');
      return;
    }

    // Slug unique validation (except itself if editing)
    const isSlugDuplicate = categories.some(cat => 
      cat.slug.toLowerCase() === formData.slug.toLowerCase() && 
      (drawerMode === 'CREATE' || cat.id !== selectedCategory?.id)
    );
    if (isSlugDuplicate) {
      setFormError('Slug danh mục này đã tồn tại, vui lòng nhập slug khác.');
      return;
    }

    // Code unique validation
    const isCodeDuplicate = categories.some(cat => 
      cat.code.toUpperCase() === formData.code.toUpperCase() && 
      (drawerMode === 'CREATE' || cat.id !== selectedCategory?.id)
    );
    if (isCodeDuplicate) {
      setFormError('Mã danh mục này đã tồn tại, vui lòng nhập mã khác.');
      return;
    }

    const parentIdValue = formData.parentId === '' ? null : formData.parentId;

    try {
      if (drawerMode === 'CREATE') {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          parent_id: parentIdValue,
          description: formData.description.trim(),
          status: formData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
        });
      } else if (drawerMode === 'EDIT' && selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          payload: {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            parent_id: parentIdValue,
            description: formData.description.trim(),
            status: formData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
          }
        });
      }
      setIsDrawerOpen(false);
      setFormError(null);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setFormError(errMsg);
    }
  };

  // Generate automatically slug based on Name
  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      name: nameVal,
      slug: slugVal
    }));
  };

  // Handle file upload click simulation
  const handleSimulateUpload = () => {
    setIconFile('uploaded_icon_' + Math.floor(Math.random() * 100) + '.png');
    setFormData(prev => ({ ...prev, icon: 'Smartphone' }));
  };

  // Clear filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterRole('ALL');
    setFilterStatus('ALL');
    setSortBy('NEWEST');
    setSelectedTreeCategory(null);
    setActiveKpiFilter('ALL');
  };

  // Toggle tree node expansion
  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Recursive Tree Node Rendering helper
  const renderTreeNode = (category: Category, level: number = 0) => {
    const children = categories.filter(c => c.parentId === category.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[category.id];
    const isSelected = selectedTreeCategory === category.id;

    return (
      <div key={category.id} className="select-none">
        <div 
          onClick={() => setSelectedTreeCategory(isSelected ? null : category.id)}
          className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
            isSelected 
              ? 'bg-blue-50 text-blue-600 font-semibold' 
              : 'hover:bg-slate-50 text-slate-700'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {hasChildren ? (
              <button 
                onClick={(e) => toggleNode(category.id, e)} 
                className="p-0.5 rounded hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 font-normal border-none bg-transparent flex items-center justify-center cursor-pointer"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ml-1.5 mr-1"></div>
            )}
          </div>
          
          {/* Custom or mapped icon */}
          <span className="text-slate-400">
            {React.createElement(ICON_MAP[category.icon] || Folder, { size: 16, className: isSelected ? 'text-blue-500' : 'text-slate-400' })}
          </span>

          <span className="text-sm truncate flex-1 ml-1">{category.name}</span>
          {hasChildren && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-normal">
              {children.length}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get only root nodes for tree
  const rootCategories = useMemo(() => {
    return categories.filter(c => c.parentId === null);
  }, [categories]);

  // Combined Search and Filter Logic
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      // 1. Search Box
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = cat.name.toLowerCase().includes(query);
        const matchCode = cat.code.toLowerCase().includes(query);
        const matchSlug = cat.slug.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchSlug) return false;
      }

      // 2. Filter Role (Root vs Child)
      if (filterRole === 'ROOT' && cat.parentId !== null) return false;
      if (filterRole === 'CHILD' && cat.parentId === null) return false;

      // 3. Status Filter
      if (filterStatus !== 'ALL' && cat.status !== filterStatus) return false;

      // 4. KPI Filter selection
      if (activeKpiFilter === 'ACTIVE' && cat.status !== 'ACTIVE') return false;
      if (activeKpiFilter === 'ROOT' && cat.parentId !== null) return false;
      if (activeKpiFilter === 'CHILD' && cat.parentId === null) return false;

      // 5. Selected tree node (and all its sub-tree descendants)
      if (selectedTreeCategory !== null) {
        // Must match either the selected node itself or have it in parent hierarchy
        const isDescendant = (node: Category): boolean => {
          if (node.id === selectedTreeCategory) return true;
          if (!node.parentId) return false;
          const parent = categories.find(c => c.id === node.parentId);
          if (!parent) return false;
          return isDescendant(parent);
        };
        if (!isDescendant(cat)) return false;
      }

      return true;
    }).sort((a, b) => {
      // 6. Sorting
      if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z-A') return b.name.localeCompare(a.name);
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // DEFAULT: NEWEST
    });
  }, [categories, searchTerm, filterRole, filterStatus, sortBy, selectedTreeCategory, activeKpiFilter]);

  // Parent Category Helper
  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  // Render Status Badge
  const renderStatusBadge = (status: 'ACTIVE' | 'INACTIVE' | 'PENDING') => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Hoạt động
        </span>
      );
    }
    if (status === 'INACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Ngừng hoạt động
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        Đang xử lý
      </span>
    );
  };

  // Dynamic statistics displayed on KPI Cards
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.status === 'ACTIVE').length;
    const root = categories.filter(c => c.parentId === null).length;
    const child = categories.filter(c => c.parentId !== null).length;

    return {
      total,
      active,
      root,
      child,
    };
  }, [categories]);

  // Loading Skeleton rendering helper
  const renderSkeleton = () => {
    return (
      <div className="space-y-6">
        {/* KPI skeleton */}
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm animate-pulse h-96 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2 pt-2">
              <div className="h-6 bg-slate-100 rounded w-full"></div>
              <div className="h-6 bg-slate-100 rounded w-5/6"></div>
              <div className="h-6 bg-slate-100 rounded w-4/5"></div>
              <div className="h-6 bg-slate-100 rounded w-full"></div>
            </div>
          </div>
          <div className="col-span-3 bg-white p-5 rounded-xl border border-slate-100 shadow-sm animate-pulse h-96 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-full"></div>
            <div className="space-y-4 pt-2">
              <div className="h-10 bg-slate-100 rounded w-full"></div>
              <div className="h-10 bg-slate-100 rounded w-full"></div>
              <div className="h-10 bg-slate-100 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Category Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase tracking-wider">
              Role: Admin / Manager
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý danh mục sản phẩm và cấu trúc phân loại trong hệ thống ProductTrace-AI.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Action: Bulk Update (Coming soon) */}
          <button 
            disabled 
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed flex items-center gap-1.5"
            title="Bulk Update Category — Sắp mở rộng"
          >
            <CheckSquare size={14} /> Bulk Update
          </button>

          {/* Action: Import/Export (Coming soon) */}
          <button 
            disabled 
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed flex items-center gap-1.5"
            title="Category Import/Export — Sắp mở rộng"
          >
            <Download size={14} /> Import/Export
          </button>

          {/* Action: Analytics (Coming soon) */}
          <button 
            disabled 
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-400 bg-slate-50 cursor-not-allowed flex items-center gap-1.5"
            title="Category Analytics — Sắp mở rộng"
          >
            <BarChart2 size={14} /> Analytics
          </button>

          <Button 
            onClick={handleOpenCreate} 
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Tạo danh mục
          </Button>
        </div>
      </div>

      {/* Render error state if selected */}
      {isError ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu danh mục</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Đã xảy ra lỗi khi tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => refetch()} className="rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white">
              Thử lại
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Section 1: Category Overview Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: 'ALL', label: 'Tổng danh mục', value: stats.total, tooltip: 'Tổng số danh mục sản phẩm (bao gồm cả gốc và con)' },
              { id: 'ACTIVE', label: 'Đang hoạt động', value: stats.active, tooltip: 'Số lượng danh mục đang hoạt động bình thường' },
              { id: 'ROOT', label: 'Category gốc', value: stats.root, tooltip: 'Danh mục cao nhất, không có danh mục cha' },
              { id: 'CHILD', label: 'Category con', value: stats.child, tooltip: 'Danh mục phụ thuộc phân cấp bên dưới danh mục cha' },
            ].map((stat) => (
              <div 
                key={stat.id}
                onClick={() => {
                  setActiveKpiFilter(activeKpiFilter === stat.id ? 'ALL' : stat.id as any);
                  // Reset other filters to avoid confusion
                  setSelectedTreeCategory(null);
                }}
                onMouseEnter={() => setHoveredKpi(stat.id)}
                onMouseLeave={() => setHoveredKpi(null)}
                className={`relative p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeKpiFilter === stat.id 
                    ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-100 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                  <HelpCircle size={14} className="text-slate-300 hover:text-slate-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mt-2.5">
                  {stat.value}
                </div>

                {/* Tooltip implementation */}
                {hoveredKpi === stat.id && (
                  <div className="absolute z-20 left-4 -bottom-10 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-md max-w-xs animate-fade-in pointer-events-none">
                    {stat.tooltip}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Section 2: Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã danh mục..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Role (Gốc / Con) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Loại:</span>
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ROOT">Category gốc</option>
                  <option value="CHILD">Category con</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                  <option value="PENDING">Đang xử lý</option>
                </select>
              </div>

              {/* Sort filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sắp xếp:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="OLDEST">Cũ nhất</option>
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL' || sortBy !== 'NEWEST' || selectedTreeCategory || activeKpiFilter !== 'ALL') && (
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Xoá bộ lọc
                </button>
              )}

              <button 
                onClick={() => {
                  refetch();
                }}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer bg-white"
                title="Tải lại dữ liệu"
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>

          {/* Main Content Area: Tree Panel (Left) & Table List (Right) */}
          <div className="grid grid-cols-4 gap-6 items-start">
            
            {/* Section 3: Category Tree Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col min-h-[480px]">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-bold text-slate-800">Cấu trúc cây</h3>
                {selectedTreeCategory && (
                  <button 
                    onClick={() => setSelectedTreeCategory(null)}
                    className="text-[10px] text-blue-600 hover:underline font-semibold border-none bg-transparent cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>

              {rootCategories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                  <p className="text-xs font-medium">Chưa có danh mục.</p>
                </div>
              ) : (
                <div className="space-y-1 overflow-y-auto flex-1 max-h-[500px] pr-1">
                  {rootCategories.map(rootCat => renderTreeNode(rootCat, 0))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 mt-4 bg-slate-50 p-2.5 rounded-lg">
                <h4 className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Info size={12} className="text-slate-400" /> Hướng dẫn
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Nhấp vào tên danh mục ở trên để lọc danh mục đó và tất cả các danh mục con phụ thuộc của nó trong bảng bên phải.
                </p>
              </div>
            </div>

            {/* Section 4: Category List Table */}
            <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[480px]">
              {filteredCategories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white">
                  <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-100 mx-auto">
                    <Folder size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Chưa có danh mục nào</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                    {searchTerm || selectedTreeCategory || filterStatus !== 'ALL' || filterRole !== 'ALL' || activeKpiFilter !== 'ALL'
                      ? 'Không tìm thấy danh mục nào khớp với bộ lọc tìm kiếm hiện tại.'
                      : 'Hãy tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm trong hệ thống.'}
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    {(searchTerm || selectedTreeCategory || filterStatus !== 'ALL' || filterRole !== 'ALL' || activeKpiFilter !== 'ALL') ? (
                      <Button variant="secondary" onClick={handleResetFilters} className="rounded-xl px-4 text-sm font-semibold cursor-pointer">
                        Xoá bộ lọc
                      </Button>
                    ) : (
                      <Button onClick={handleOpenCreate} className="rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer">
                        <Plus size={14} /> Tạo danh mục
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse table-fixed">
                      <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 pl-5 font-bold tracking-wider w-[22%]">Danh mục</th>
                          <th className="p-3.5 font-bold tracking-wider w-[14%]">Mã</th>
                          <th className="p-3.5 font-bold tracking-wider w-[16%]">Slug</th>
                          <th className="p-3.5 font-bold tracking-wider w-[12%]">Cha</th>
                          <th className="p-3.5 font-bold tracking-wider w-[14%]">Mô tả</th>
                          <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">Trạng thái</th>
                          <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Cập nhật</th>
                          <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCategories.map((cat) => {
                          const IconComp = ICON_MAP[cat.icon] || Folder;
                          return (
                            <tr 
                              key={cat.id} 
                              className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                              onClick={() => handleOpenView(cat)}
                            >
                              <td className="p-3.5 pl-5 font-medium text-slate-900 truncate">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex-shrink-0">
                                    <IconComp size={16} />
                                  </div>
                                  <span className="truncate">{cat.name}</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-xs text-slate-500 font-mono font-semibold truncate">{cat.code}</td>
                              <td className="p-3.5 text-xs text-slate-500 truncate" title={cat.slug}>{cat.slug}</td>
                              <td className="p-3.5 text-slate-600 truncate">
                                {cat.parentId ? (
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                    {getParentName(cat.parentId)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Gốc</span>
                                )}
                              </td>
                              <td className="p-3.5 text-slate-500 text-xs truncate" title={cat.description}>
                                {cat.description || <span className="text-slate-300 italic">Không có mô tả</span>}
                              </td>
                              <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col items-center gap-1.5 justify-center">
                                  {renderStatusBadge(cat.status)}
                                  
                                  {/* Interactive Toggle Switch */}
                                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                                    <input 
                                      type="checkbox" 
                                      checked={cat.status === 'ACTIVE'}
                                      onChange={() => handleToggleStatus(cat.id, cat.status)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                  </label>
                                </div>
                              </td>
                              <td className="p-3.5 text-center text-xs text-slate-400 font-medium">{cat.updatedAt.split(' ')[0]}</td>
                              <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-1">
                                  {/* Navigate to Products */}
                                  <button 
                                    onClick={() => onNavigate('products')}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                                    title="Xem sản phẩm thuộc danh mục"
                                  >
                                    <ArrowUpRight size={15} />
                                  </button>

                                  {/* Edit Category */}
                                  <button 
                                    onClick={(e) => handleOpenEdit(cat, e)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
                                    title="Chỉnh sửa danh mục"
                                  >
                                    <Edit3 size={15} />
                                  </button>

                                  {/* View Detail */}
                                  <button 
                                    onClick={(e) => handleOpenView(cat, e)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  {/* Delete Category */}
                                  <button 
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm(`Bạn có chắc chắn muốn xóa danh mục ${cat.name}?`)) {
                                        try {
                                          await deleteMutation.mutateAsync(cat.id);
                                        } catch (err: any) {
                                          alert(err?.response?.data?.message || err?.message || 'Không thể xóa danh mục.');
                                        }
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                    title="Xóa danh mục"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/50">
                    <span>
                      Hiển thị <strong>{filteredCategories.length}</strong> trên <strong>{stats.total}</strong> danh mục
                    </span>
                    <div className="flex gap-1.5">
                      <button disabled className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg disabled:opacity-50 text-slate-400 cursor-not-allowed">
                        Trước
                      </button>
                      <button className="px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg font-semibold text-xs cursor-pointer">
                        1
                      </button>
                      <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 font-semibold text-xs cursor-pointer">
                        2
                      </button>
                      <button className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer">
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* Right Drawer Form */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          
          <div className="relative bg-white w-[500px] max-h-[90vh] shadow-2xl flex flex-col justify-between z-10 rounded-2xl overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Tạo danh mục mới' : drawerMode === 'EDIT' ? 'Chỉnh sửa danh mục' : 'Chi tiết danh mục'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {drawerMode === 'CREATE' ? 'Thêm phân loại mới cho hệ thống' : drawerMode === 'EDIT' ? 'Cập nhật thông tin và phân cấp danh mục' : 'Xem thông tin chi tiết danh mục'}
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Tên danh mục */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') handleNameChange(e.target.value);
                    }}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="Ví dụ: Thiết bị gia dụng" 
                  />
                </div>

                {/* Mã danh mục */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mã danh mục <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') setFormData({ ...formData, code: e.target.value.toUpperCase() });
                    }}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="Ví dụ: THIETBIGIADUNG" 
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                    }}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="thiet-bi-gia-dung" 
                  />
                </div>

                {/* Danh mục cha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Danh mục cha</label>
                  <select 
                    value={formData.parentId || ''} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') setFormData({ ...formData, parentId: e.target.value });
                    }}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Không có (Danh mục gốc) --</option>
                    {categories
                      .filter(cat => drawerMode === 'CREATE' || cat.id !== selectedCategory?.id) // Prevent selecting itself as parent
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.code})
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Trạng thái */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Trạng thái</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') setFormData({ ...formData, status: e.target.value as any });
                    }}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    <option value="PENDING">Đang xử lý</option>
                  </select>
                </div>

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mô tả danh mục</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => {
                      if (drawerMode !== 'VIEW') setFormData({ ...formData, description: e.target.value });
                    }}
                    disabled={drawerMode === 'VIEW'}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
                    placeholder="Mô tả ngắn gọn về phạm vi và loại mặt hàng trong danh mục này..." 
                  />
                </div>

                {/* Icon Selection & Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Biểu tượng (Icon)</label>
                  {drawerMode === 'VIEW' ? (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 w-fit">
                      {React.createElement(ICON_MAP[formData.icon] || Folder, { size: 18 })}
                      <span className="text-xs font-medium">{formData.icon}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-2">
                        {['Folder', 'Smartphone', 'Laptop', 'Tv', 'WashingMachine'].map(iconName => {
                          const IconElem = ICON_MAP[iconName] || Folder;
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                formData.icon === iconName 
                                  ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-semibold' 
                                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <IconElem size={18} />
                              <span className="text-[10px]">{iconName}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Mock upload area */}
                      <div 
                        onClick={handleSimulateUpload}
                        className="border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-colors"
                      >
                        {iconFile ? (
                          <div className="flex items-center gap-2 text-green-600 justify-center">
                            <Check size={16} className="bg-green-100 p-0.5 rounded-full" />
                            <span className="text-xs font-semibold">{iconFile}</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-400 mb-1 mx-auto" />
                            <span className="text-[11px] font-semibold text-slate-700">Tải lên Icon tùy chỉnh</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ SVG, PNG (Tối đa 2MB)</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              {drawerMode === 'VIEW' ? (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-xl px-4 text-xs font-semibold w-full cursor-pointer"
                  >
                    Đóng
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="secondary" 
                      onClick={() => {
                        // Simulate draft save
                        setIsDrawerOpen(false);
                        alert('Đã lưu danh mục nháp thành công!');
                      }}
                      className="rounded-xl px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                    >
                      Lưu nháp
                    </Button>
                    
                    <Button 
                      onClick={handleSubmitForm}
                      className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                    >
                      {drawerMode === 'CREATE' ? 'Tạo danh mục' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
