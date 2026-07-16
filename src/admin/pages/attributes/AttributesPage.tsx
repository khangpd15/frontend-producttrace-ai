import React, { useState, useMemo } from 'react';
import {
  Search, RotateCw, Tag, Edit3, Trash2, Plus,
  Save, XCircle, Loader2, AlertCircle, SlidersHorizontal,
  ChevronDown, Info, X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAttributesByCategory, useCreateAttribute, useUpdateAttribute, useDeleteAttribute } from '../../../features/attributes/hooks/useAttributes';
import { Attribute } from '../../../features/attributes/api/attribute.api';
import { useCategoryList } from '../../../features/categories/hooks/useCategory';
import { parseApiError } from '../../../api/axios';

export default function AttributesPage({ onNavigate }: { onNavigate?: (tabId: string) => void }) {
  const { data: categoryListResp, isLoading: isCatLoading, isError: isCatError, refetch: refetchCats } = useCategoryList({ limit: 200 });

  const categories = useMemo(() => {
    if (!categoryListResp?.data) return [];
    return categoryListResp.data.map((item: any) => ({
      id: item.id, name: item.name, code: item.code || '', parent_id: item.parent_id || null,
    }));
  }, [categoryListResp]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const selectedCategory = useMemo(() => categories.find(c => c.id === selectedCategoryId) ?? null, [categories, selectedCategoryId]);

  const { data: serverAttributes, isLoading: isAttrsLoading, isError: isAttrsError, error: attrsError, refetch: refetchAttrs } = useAttributesByCategory(selectedCategoryId || undefined);

  const createAttrMutation = useCreateAttribute();
  const updateAttrMutation = useUpdateAttribute();
  const deleteAttrMutation = useDeleteAttribute();
  const attributesList: Attribute[] = serverAttributes || [];

  const [searchTerm, setSearchTerm] = useState('');
  const filteredAttributes = useMemo(() => {
    if (!searchTerm.trim()) return attributesList;
    const q = searchTerm.toLowerCase();
    return attributesList.filter(a => a.code.toLowerCase().includes(q) || a.label.toLowerCase().includes(q));
  }, [attributesList, searchTerm]);

  const [newAttrCode, setNewAttrCode] = useState('');
  const [newAttrLabel, setNewAttrLabel] = useState('');
  const [addFormError, setAddFormError] = useState<string | null>(null);

  const handleAddAttribute = async () => {
    const code = newAttrCode.trim().toLowerCase().replace(/\s+/g, '_');
    const label = newAttrLabel.trim();
    setAddFormError(null);
    if (!selectedCategoryId) { setAddFormError('Vui long chon danh muc truoc.'); return; }
    if (!code || !label) { setAddFormError('Vui long nhap du Ma va Ten thuoc tinh.'); return; }
    if (attributesList.some(a => a.code.toLowerCase() === code)) { setAddFormError('Ma thuoc tinh nay da ton tai.'); return; }
    try {
      await createAttrMutation.mutateAsync({ category_id: selectedCategoryId, code, label });
      setNewAttrCode(''); setNewAttrLabel('');
    } catch (err: any) { setAddFormError(parseApiError(err)); }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleStartEdit = (attr: Attribute) => { setEditingId(attr.id); setEditCode(attr.code); setEditLabel(attr.label); setEditError(null); setAddFormError(null); };
  const handleCancelEdit = () => { setEditingId(null); setEditCode(''); setEditLabel(''); setEditError(null); };

  const handleSaveEdit = async () => {
    const code = editCode.trim().toLowerCase().replace(/\s+/g, '_');
    const label = editLabel.trim();
    setEditError(null);
    if (!code || !label) { setEditError('Vui long nhap du Ma va Ten.'); return; }
    if (attributesList.some(a => a.code.toLowerCase() === code && a.id !== editingId)) { setEditError('Ma da ton tai.'); return; }
    if (!editingId) return;
    try { await updateAttrMutation.mutateAsync({ id: editingId, payload: { code, label } }); handleCancelEdit(); }
    catch (err: any) { setEditError(parseApiError(err)); }
  };

  const handleDelete = async (attr: Attribute) => {
    if (!confirm(`Xoa thuoc tinh "${attr.label}" (${attr.code})?`)) return;
    try { await deleteAttrMutation.mutateAsync(attr.id); if (editingId === attr.id) handleCancelEdit(); }
    catch { }
  };

  const renderSkeleton = () => (
    <div className="divide-y divide-slate-100">
      {[1,2,3,4].map(n => (
        <div key={n} className="grid grid-cols-[2fr_3fr_auto] gap-3 items-center px-4 py-3.5 animate-pulse">
          <div className="h-3.5 bg-slate-100 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-7 w-14 bg-slate-100 rounded-lg" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Attribute Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase tracking-wider">Role: Admin / Manager</span>
          </h1>
          <p className="text-sm text-slate-500">Quan ly thuoc tinh (attributes) theo tung danh muc san pham trong he thong ProductTrace-AI.</p>
        </div>
        <button onClick={() => { refetchCats(); if (selectedCategoryId) refetchAttrs(); }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer bg-white" title="Tai lai du lieu">
          <RotateCw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tong danh muc</span>
            <div className="p-1.5 rounded-lg bg-blue-50"><SlidersHorizontal size={14} className="text-blue-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2.5">{isCatLoading ? '–' : categories.length}</div>
          <p className="text-[10px] text-slate-400 mt-1">Danh muc san pham trong he thong</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dang xem</span>
            <div className="p-1.5 rounded-lg bg-violet-50"><Tag size={14} className="text-violet-600" /></div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-2.5 truncate">{selectedCategory ? selectedCategory.name : '–'}</div>
          <p className="text-[10px] text-slate-400 mt-1">Danh muc dang duoc chon</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">So thuoc tinh</span>
            <div className="p-1.5 rounded-lg bg-emerald-50"><Tag size={14} className="text-emerald-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2.5">{selectedCategoryId ? (isAttrsLoading ? '–' : attributesList.length) : '–'}</div>
          <p className="text-[10px] text-slate-400 mt-1">Thuoc tinh cua danh muc hien tai</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
              <SlidersHorizontal size={13} className="text-slate-400" />
              Danh muc
            </label>
            <div className="relative flex-1">
              {isCatLoading ? (
                <div className="w-full h-9 bg-slate-100 rounded-xl animate-pulse" />
              ) : isCatError ? (
                <span className="text-xs text-red-500 font-medium">Khong tai duoc danh muc</span>
              ) : (
                <>
                  <select value={selectedCategoryId} onChange={e => { setSelectedCategoryId(e.target.value); setSearchTerm(''); handleCancelEdit(); setAddFormError(null); }} className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-900 text-white border border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <option value="">-- Chon danh muc --</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}{cat.parent_id ? '' : ' (Goc)'}</option>))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </>
              )}
            </div>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tim ma hoac ten thuoc tinh..." disabled={!selectedCategoryId} className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/50 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
            {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><X size={14} /></button>)}
          </div>
          {selectedCategoryId && !isAttrsLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm flex-shrink-0">
              <Tag size={12} />{attributesList.length} thuoc tinh
            </span>
          )}
        </div>

        <div className="p-5">
          {!selectedCategoryId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4"><SlidersHorizontal size={28} className="text-slate-300" /></div>
              <h3 className="text-base font-bold text-slate-800">Chon danh muc de quan ly thuoc tinh</h3>
              <p className="mt-1.5 text-sm text-slate-400 max-w-sm">Moi danh muc co bo thuoc tinh rieng. Chon danh muc tu dropdown phia tren.</p>
            </div>
          ) : isAttrsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3 border border-red-100"><AlertCircle size={20} /></div>
              <h3 className="text-sm font-bold text-slate-900">Khong the tai thuoc tinh</h3>
              <p className="mt-1 text-xs text-slate-500">{attrsError ? parseApiError(attrsError) : 'Da xay ra loi.'}</p>
              <Button onClick={() => refetchAttrs()} className="mt-4 rounded-xl px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">Thu lai</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(addFormError || editError) && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{addFormError || editError}</span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[2fr_3fr_auto] gap-0 text-[11px] text-slate-400 uppercase font-bold tracking-wider bg-slate-50/75 border-b border-slate-200 px-4 py-3">
                  <span>Ma (code)</span>
                  <span>Ten hien thi (label)</span>
                  <span className="text-right pr-1">Thao tac</span>
                </div>

                {isAttrsLoading ? renderSkeleton() : filteredAttributes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3"><Tag size={20} className="text-slate-300" /></div>
                    <h4 className="text-sm font-bold text-slate-700">{searchTerm ? 'Khong tim thay thuoc tinh nao' : 'Chua co thuoc tinh nao'}</h4>
                    <p className="mt-1 text-xs text-slate-400">{searchTerm ? 'Thu tu khoa khac.' : 'Su dung form ben duoi de them thuoc tinh dau tien.'}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredAttributes.map(attr => {
                      const isRowEditing = editingId === attr.id;
                      if (isRowEditing) {
                        return (
                          <div key={attr.id} className="grid grid-cols-[2fr_3fr_auto] gap-3 items-center px-4 py-3 bg-blue-50/40 border-l-2 border-blue-400">
                            <input type="text" value={editCode} autoFocus onChange={e => setEditCode(e.target.value.toLowerCase().replace(/\s+/g,'_'))} onKeyDown={e => { if(e.key==='Enter') handleSaveEdit(); if(e.key==='Escape') handleCancelEdit(); }} className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} onKeyDown={e => { if(e.key==='Enter') handleSaveEdit(); if(e.key==='Escape') handleCancelEdit(); }} className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={handleSaveEdit} disabled={updateAttrMutation.isPending} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 border-none bg-transparent cursor-pointer disabled:opacity-50 transition-colors" title="Luu (Enter)">{updateAttrMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}</button>
                              <button onClick={handleCancelEdit} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition-colors" title="Huy (Esc)"><XCircle size={15} /></button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={attr.id} className="grid grid-cols-[2fr_3fr_auto] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors group">
                          <span className="text-xs font-mono font-semibold text-slate-500">{attr.code}</span>
                          <span className="text-sm font-semibold text-slate-800">{attr.label}</span>
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEdit(attr)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-none bg-transparent cursor-pointer transition-colors" title="Chinh sua"><Edit3 size={15} /></button>
                            <button onClick={() => handleDelete(attr)} disabled={deleteAttrMutation.isPending} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer disabled:opacity-50 transition-colors" title="Xoa"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isAttrsLoading && (
                  <div className="border-t border-dashed border-slate-200 bg-slate-50/40">
                    <div className="grid grid-cols-[2fr_3fr_auto] gap-3 items-center px-4 py-3">
                      <input type="text" value={newAttrCode} onChange={e => { setAddFormError(null); setNewAttrCode(e.target.value.toLowerCase().replace(/\s+/g,'_')); }} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();handleAddAttribute();} }} disabled={!selectedCategoryId} placeholder="vd: brand" className="px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50" />
                      <input type="text" value={newAttrLabel} onChange={e => { setAddFormError(null); setNewAttrLabel(e.target.value); }} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();handleAddAttribute();} }} disabled={!selectedCategoryId} placeholder="vd: Thuong hieu" className="px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50" />
                      <button onClick={handleAddAttribute} disabled={!selectedCategoryId || createAttrMutation.isPending} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm whitespace-nowrap">
                        {createAttrMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                        Them
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isAttrsLoading && selectedCategoryId && (
                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                  <Info size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Thuoc tinh cua danh muc <strong>{selectedCategory?.name}</strong> dung de mo ta dac diem san pham. Thay doi co hieu luc ngay lap tuc.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
