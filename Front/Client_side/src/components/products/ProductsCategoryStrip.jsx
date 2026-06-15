import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/motionPresets";
import { useCategories } from "../../hooks/useCategories";
import { resolveCategoryParam } from "../../utils/categoryFilter";

const CATEGORY_ICONS = {
  grain: "fa-solid fa-wheat-awn",
  rice: "fa-solid fa-bowl-rice",
  pasta: "fa-solid fa-plate-wheat",
  oil: "fa-solid fa-bottle-droplet",
  olive: "fa-solid fa-jar",
  canned: "fa-solid fa-box",
  snack: "fa-solid fa-cookie-bite",
  beverage: "fa-solid fa-mug-hot",
  spice: "fa-solid fa-pepper-hot",
  frozen: "fa-solid fa-snowflake",
  default: "fa-solid fa-basket-shopping",
};

function iconForCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("dairy") || n.includes("milk") || n.includes("cheese")) return "fa-solid fa-cheese";
  if (n.includes("tea") || n.includes("coffee")) return CATEGORY_ICONS.beverage;
  if (n.includes("pickle") || n.includes("preserve") || n.includes("jam")) return "fa-solid fa-jar";
  if (n.includes("tahini") || n.includes("halva")) return "fa-solid fa-jar-wheat";
  if (n.includes("confection") || n.includes("snack")) return CATEGORY_ICONS.snack;
  if (n.includes("rice")) return CATEGORY_ICONS.rice;
  if (n.includes("grain") || n.includes("legume") || n.includes("pulse")) return CATEGORY_ICONS.grain;
  if (n.includes("pasta") || n.includes("noodle")) return CATEGORY_ICONS.pasta;
  if (n.includes("oil") || n.includes("fat") || n.includes("vinegar")) return CATEGORY_ICONS.oil;
  if (n.includes("olive")) return CATEGORY_ICONS.olive;
  if (n.includes("canned")) return CATEGORY_ICONS.canned;
  if (n.includes("beverage") || n.includes("drink")) return CATEGORY_ICONS.beverage;
  if (n.includes("spice") || n.includes("herb")) return CATEGORY_ICONS.spice;
  if (n.includes("frozen")) return CATEGORY_ICONS.frozen;
  return CATEGORY_ICONS.default;
}

function formatProductCount(count) {
  const n = Number(count) || 0;
  if (n > 0) return `${n}+ Products`;
  return "Products";
}

export function ProductsCategoryStrip({
  reduce,
  categories: externalCategories,
  categoriesLoading: externalLoading,
  activeCategory = "All",
  onCategorySelect,
  onCategoriesLoaded,
}) {
  const useExternal = externalLoading !== undefined;
  const internal = useCategories({ withCounts: !useExternal });
  const categories = useExternal ? (externalCategories ?? []) : internal.categories;
  const loading = useExternal ? Boolean(externalLoading) : internal.loading;
  const error = useExternal ? null : internal.error;
  const reload = internal.reload;

  const resolvedActive = resolveCategoryParam(activeCategory, categories) ?? activeCategory;

  const items = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      count: c.products_count ?? 0,
      icon: iconForCategory(c.name),
      imageUrl: c.image || null,
    }));
  }, [categories]);

  React.useEffect(() => {
    if (!loading) onCategoriesLoaded?.(categories);
  }, [categories, loading, onCategoriesLoaded]);

  if (loading) {
    return (
      <section className="pp-categories" id="pp-categories">
        <div className="pp-container">
          <h2 className="pp-section-title">Shop by Category</h2>
          <div className="pp-categories__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pp-cat-card pp-cat-card--skeleton" aria-hidden="true" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pp-categories" id="pp-categories">
        <div className="pp-container">
          <h2 className="pp-section-title">Shop by Category</h2>
          <p className="pp-categories__error" role="alert">
            {error}{" "}
            <button type="button" className="pp-categories__retry" onClick={reload}>
              Retry
            </button>
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="pp-categories" id="pp-categories">
        <div className="pp-container">
          <h2 className="pp-section-title">Shop by Category</h2>
          <p className="pp-categories__empty">No categories available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pp-categories" id="pp-categories">
      <div className="pp-container">
        <h2 className="pp-section-title">Shop by Category</h2>
        <motion.div
          className="pp-categories__grid"
          variants={reduce ? undefined : staggerContainer(0.06, 0.05)}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-40px" }}
        >
          {items.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              className={`pp-cat-card${String(resolvedActive) === String(cat.id) ? " pp-cat-card--active" : ""}`}
              variants={reduce ? undefined : fadeUp}
              onClick={() => onCategorySelect?.(String(cat.id))}
            >
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt="" className="pp-cat-card__bg" loading="lazy" />
              ) : (
                <span className="pp-cat-card__placeholder" aria-hidden="true">
                  <i className={cat.icon} />
                </span>
              )}
              <span className="pp-cat-card__overlay" aria-hidden="true" />
              <span className="pp-cat-card__content">
                <span className="pp-cat-card__name">{cat.name}</span>
                <span className="pp-cat-card__count">{formatProductCount(cat.count)}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
