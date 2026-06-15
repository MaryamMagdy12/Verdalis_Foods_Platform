import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeDown, fadeUp, sectionEntrance } from "../../animations/motionPresets";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { apiGet } from "../../api/client";
import oilsImg from "../../assets/images/home-category-oils.png";
import olivesImg from "../../assets/images/home-category-olives.png";
import grainsImg from "../../assets/images/home-category-grains.png";
import packagedImg from "../../assets/images/home-category-packaged.png";
import spicesImg from "../../assets/images/home-category-spices.png";

/** Slots 0–1 and 4: full-bleed photos; slots 2–3: logo / contain (reference layout). */
const IMAGE_FIT_BY_INDEX = ["cover", "cover", "contain", "contain", "cover"];

const fallbackCategories = [
  { id: "oils", title: "Olive Oil", subtitle: "Cold-pressed & refined for every kitchen.", image: oilsImg, imageFit: "cover" },
  { id: "olives", title: "Olives", subtitle: "Table & specialty olives from trusted origins.", image: olivesImg, imageFit: "cover" },
  { id: "rice", title: "Rice", subtitle: "Long-grain, basmati, and specialty rice.", image: grainsImg, imageFit: "contain" },
  { id: "frozen", title: "Frozen Foods", subtitle: "Quality frozen lines for retail & food service.", image: packagedImg, imageFit: "contain" },
  { id: "spices", title: "Herbs & Spices", subtitle: "Aromatic herbs and bold spice blends.", image: spicesImg, imageFit: "cover" },
];

function mapCatalogFromApi(rows) {
  return rows.map((row, index) => ({
    id: String(row.slug ?? row.category_id ?? row.id),
    title: row.title,
    subtitle: row.subtitle || "",
    image: row.image,
    imageFit: IMAGE_FIT_BY_INDEX[index] ?? "cover",
  }));
}

function ProductCategoryCard({ item, reduce }) {
  const imgClass = item.imageFit === "contain" ? "hp-product-img-contain" : undefined;

  return (
    <motion.article className="hp-product-card" variants={reduce ? undefined : fadeUp}>
      <Link to={`/products?category=${encodeURIComponent(item.id)}`}>
        <motion.div className="hp-product-media" variants={reduce ? undefined : fadeUp}>
          {item.image ? (
            <img src={item.image} alt="" className={imgClass} loading="lazy" />
          ) : (
            <div className="hp-product-media-placeholder" aria-hidden="true" />
          )}
        </motion.div>
        <motion.div className="hp-product-body">
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          <span className="hp-product-go" aria-hidden="true">
            <i className="fa-solid fa-arrow-right" />
          </span>
        </motion.div>
      </Link>
    </motion.article>
  );
}

export function HomeProductCategories({ reduce }) {
  const [ref, isInView] = useScrollReveal();
  const show = reduce || isInView;
  const [tab, setTab] = useState("all");
  const [categories, setCategories] = useState(fallbackCategories);
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalogRes, categoriesRes] = await Promise.all([
          apiGet("products/home-catalog", { limit: 5 }),
          apiGet("categories"),
        ]);
        if (cancelled) return;

        const catalogRows = catalogRes.data || [];
        if (catalogRows.length > 0) {
          setCategories(mapCatalogFromApi(catalogRows));
        }

        const cats = categoriesRes.data || [];
        setApiCategories(cats);
      } catch (_) {
        if (!cancelled) {
          setCategories(fallbackCategories);
          setApiCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = useMemo(() => {
    const fromDb = apiCategories.map((c) => ({ id: String(c.id), label: c.name }));
    if (fromDb.length === 0) {
      return [
        { id: "all", label: "All Products" },
        { id: "oils", label: "Oils & Olives" },
        { id: "rice", label: "Grains" },
        { id: "frozen", label: "Frozen Foods" },
        { id: "spices", label: "Spices & Herbs" },
      ];
    }
    return [{ id: "all", label: "All Products" }, ...fromDb];
  }, [apiCategories]);

  const visible = useMemo(() => {
    if (tab === "all") return categories;
    return categories.filter((c) => c.id === tab);
  }, [tab, categories]);

  return (
    <motion.section
      ref={ref}
      className="hp-products cream-section"
      id="products"
      initial={reduce ? false : "hidden"}
      animate={show ? "show" : "hidden"}
      variants={reduce ? undefined : sectionEntrance}
    >
      <motion.div className="section-content">
        <header className="hp-products-head">
          <motion.p className="hp-products-kicker" variants={reduce ? undefined : fadeDown}>
            <i className="fa-solid fa-leaf" aria-hidden="true" /> Our products
          </motion.p>
          <motion.h2 className="hp-products-title" variants={reduce ? undefined : fadeDown}>
            Quality You Can <span className="hp-grad">Taste.</span>
          </motion.h2>
        </header>

        <motion.div className="hp-tabs" variants={reduce ? undefined : fadeUp}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`hp-tab${tab === t.id ? " hp-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        <motion.div className="hp-products-grid" key={tab} variants={reduce ? undefined : fadeUp}>
          {visible.map((c) => (
            <ProductCategoryCard key={c.id} item={c} reduce={reduce} />
          ))}
        </motion.div>

        <motion.div className="hp-products-cta-wrap" variants={reduce ? undefined : fadeUp}>
          <Link to="/products" className="hp-products-cta">
            View full catalog
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
