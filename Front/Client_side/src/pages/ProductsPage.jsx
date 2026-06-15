import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useCategories } from "../hooks/useCategories";
import { ProductsHero } from "../components/products/ProductsHero";
import { ProductsCategoryStrip } from "../components/products/ProductsCategoryStrip";
import { ProductsCatalog } from "../components/products/ProductsCatalog";
import { ProductsQualitySection } from "../components/products/ProductsQualitySection";
import { ProductsGlobalSection } from "../components/products/ProductsGlobalSection";
import { ProductsTrustBar } from "../components/products/ProductsTrustBar";
import { cachedApiGet } from "../utils/catalogCache";
import {
  categoryParamForUrl,
  isResolvableCategoryFilter,
  resolveCategoryParam,
} from "../utils/categoryFilter";
import "../assets/css/pp-styles.css";
import "../assets/css/ProductsPage.css";

function normalizeProduct(p) {
  return { ...p, SKU: p.sku ?? p.SKU, id: String(p.id) };
}

export function ProductsPage() {
  const reduce = useReduceMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const { categories, loading: categoriesLoading } = useCategories({ withCounts: true });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!urlCategory || urlCategory === "All") {
      setCategoryFilter("All");
      return;
    }
    if (categoriesLoading) return;
    const resolved = resolveCategoryParam(urlCategory, categories);
    setCategoryFilter(resolved ?? "All");
  }, [urlCategory, categories, categoriesLoading]);

  const handleCategoryChange = useCallback(
    (id) => {
      const nextId = id === "All" ? "All" : String(id);
      setCategoryFilter(nextId);
      const params = new URLSearchParams(searchParams);
      if (nextId === "All") {
        params.delete("category");
      } else {
        params.set("category", categoryParamForUrl(nextId, categories) ?? nextId);
      }
      setSearchParams(params, { replace: true });
      document.getElementById("pp-catalog")?.scrollIntoView({ behavior: "smooth" });
    },
    [categories, searchParams, setSearchParams]
  );

  useEffect(() => {
    let cancelled = false;
    cachedApiGet("products")
      .then((res) => {
        if (!cancelled) setAllProducts((res.data || []).map(normalizeProduct));
      })
      .catch(() => {
        if (!cancelled) setAllProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (categoriesLoading) return;
    if (categoryFilter !== "All" && !isResolvableCategoryFilter(categoryFilter, categories)) {
      return;
    }

    const resolvedId =
      categoryFilter === "All" ? undefined : resolveCategoryParam(categoryFilter, categories);

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const productsRes = await cachedApiGet("products", {
          category_id: resolvedId && resolvedId !== "All" ? resolvedId : undefined,
          search: search || undefined,
        });
        if (cancelled) return;
        setProducts((productsRes.data || []).map(normalizeProduct));
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryFilter, search, categories, categoriesLoading]);

  return (
    <div className="products-page">
      <ProductsHero reduce={reduce} />
      <ProductsCategoryStrip
        reduce={reduce}
        categories={categories}
        categoriesLoading={categoriesLoading}
        activeCategory={categoryFilter}
        onCategorySelect={handleCategoryChange}
      />
      {error && (
        <div className="pp-alert" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="pp-loading">Loading products…</div>
      ) : (
        <ProductsCatalog
          reduce={reduce}
          products={products}
          categories={categories}
          categoryFilter={categoryFilter}
          search={search}
          onCategoryChange={handleCategoryChange}
          onSearchChange={setSearch}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}
      <ProductsQualitySection reduce={reduce} />
      <ProductsGlobalSection reduce={reduce} productCount={allProducts.length} />
      <ProductsTrustBar />
    </div>
  );
}
