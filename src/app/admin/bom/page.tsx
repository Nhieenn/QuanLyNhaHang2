"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Settings2,
  Save,
  Trash2,
  Coffee,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
}

interface BOMItem {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity_used: number;
}

export default function BOMPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [bomRecipes, setBOMRecipes] = useState<BOMItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase.from('menu_items').select('id, name, category');
    const { data: ingData } = await supabase.from('ingredients').select('id, name, unit');
    const { data: bomData } = await supabase.from('bom_recipe').select('*');
    
    if (prodData) setProducts(prodData);
    if (ingData) setIngredients(ingData);
    if (bomData) setBOMRecipes(bomData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addIngredientToRecipe = async (ingredientId: string) => {
    if (!selectedProductId) return;
    
    const exists = bomRecipes.some(b => b.product_id === selectedProductId && b.ingredient_id === ingredientId);
    if (exists) return;

    await supabase.from('bom_recipe').insert([{
      product_id: selectedProductId,
      ingredient_id: ingredientId,
      quantity_used: 1
    }]);
    fetchData();
  };

  const updateQuantity = async (id: string, qty: number) => {
    await supabase.from('bom_recipe').update({ quantity_used: qty }).eq('id', id);
    fetchData();
  };

  const deleteBOMItem = async (id: string) => {
    await supabase.from('bom_recipe').delete().eq('id', id);
    fetchData();
  };

  const currentRecipe = bomRecipes.filter(b => b.product_id === selectedProductId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <h2 className="text-4xl font-black text-on-surface tracking-tight">Định mức món ăn (BOM)</h2>
        <p className="text-outline mt-1 font-bold">Thiết lập công thức nguyên liệu cho từng sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Product List */}
        <div className="lg:col-span-4 bg-white rounded-[40px] border border-surface-container-low shadow-ambient overflow-hidden flex flex-col h-[700px]">
          <div className="p-8 border-b border-surface-container-low bg-surface-container-lowest">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
              <input 
                type="text"
                placeholder="Tìm món ăn..."
                className="w-full bg-white border border-surface-container-high rounded-full py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={cn(
                  "w-full flex flex-col p-5 rounded-[24px] text-left transition-all group",
                  selectedProductId === product.id 
                    ? "bg-brand-teal text-white shadow-lg" 
                    : "hover:bg-surface-container-low text-on-surface"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-sm tracking-tight">{product.name}</span>
                  <Coffee size={14} className={cn(selectedProductId === product.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  selectedProductId === product.id ? "text-white/70" : "text-outline"
                )}>{product.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Recipe Editor */}
        <div className="lg:col-span-8 space-y-10">
          {selectedProduct ? (
            <div className="grid grid-cols-1 gap-10">
              {/* Recipe Table */}
              <div className="bg-white rounded-[40px] border border-surface-container-low shadow-ambient overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-10 border-b border-surface-container-low flex justify-between items-center bg-surface-container-lowest">
                   <div>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight">Công thức: {selectedProduct.name}</h3>
                      <p className="text-[10px] font-black text-outline uppercase tracking-[0.25em] mt-1">Danh sách nguyên liệu khấu trừ</p>
                   </div>
                </div>

                <div className="p-6">
                  {currentRecipe.length > 0 ? (
                    <div className="space-y-4">
                      {currentRecipe.map((recipe) => {
                        const ing = ingredients.find(i => i.id === recipe.ingredient_id);
                        return (
                          <div key={recipe.id} className="flex items-center gap-6 p-6 bg-surface-container-low rounded-3xl group border border-transparent hover:border-brand-teal/20 transition-all">
                            <div className="flex-1">
                              <p className="text-lg font-black text-on-surface">{ing?.name}</p>
                              <p className="text-[10px] font-black text-outline uppercase tracking-widest">{ing?.id}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                               <input 
                                 type="number"
                                 step="0.1"
                                 value={recipe.quantity_used}
                                 onChange={(e) => updateQuantity(recipe.id, Number(e.target.value))}
                                 className="w-24 bg-white border border-surface-container-high rounded-xl py-3 px-4 text-center font-black text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
                               />
                               <span className="text-[10px] font-black text-outline uppercase tracking-widest w-10">{ing?.unit}</span>
                            </div>

                            <button 
                              onClick={() => deleteBOMItem(recipe.id)}
                              className="p-3 text-outline hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-outline opacity-20">
                      <ClipboardList size={60} className="mb-4" />
                      <p className="font-black uppercase tracking-widest">Chưa có công thức</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Ingredients Grid */}
              <div className="bg-surface-container-lowest/50 rounded-[40px] p-10 border border-surface-container-low border-dashed">
                <h4 className="text-sm font-black text-outline uppercase tracking-[0.2em] mb-8">Thêm nguyên liệu vào món</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ingredients.filter(ing => !currentRecipe.some(r => r.ingredient_id === ing.id)).map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => addIngredientToRecipe(ing.id)}
                      className="flex items-center justify-between p-5 bg-white rounded-2xl border border-surface-container-low shadow-sm hover:border-brand-teal/50 hover:shadow-md transition-all group"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold text-on-surface">{ing.name}</p>
                        <p className="text-[9px] font-black text-outline uppercase tracking-tight">{ing.unit}</p>
                      </div>
                      <Plus size={16} className="text-outline group-hover:text-brand-teal transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[40px] border border-surface-container-low border-dashed flex flex-col items-center justify-center py-40 text-outline opacity-20 animate-in fade-in duration-700">
              <Settings2 size={80} className="mb-6" />
              <h3 className="text-3xl font-black uppercase tracking-tighter">Chọn một món ăn</h3>
              <p className="font-bold">Để bắt đầu thiết lập công thức khấu trừ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
