export function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <nav className="category-tabs" aria-label="Categorias de produtos">
      <button
        type="button"
        className={!activeCategory ? "active" : ""}
        onClick={() => onSelect("")}
        aria-pressed={!activeCategory}
      >
        Todos
      </button>
      {categories
        .filter((category) => category.active)
        .sort((a, b) => a.order - b.order)
        .map((category) => (
          <button
            key={category.id}
            type="button"
            className={activeCategory === category.id ? "active" : ""}
            onClick={() => onSelect(category.id)}
            aria-pressed={activeCategory === category.id}
          >
            {category.name}
          </button>
        ))}
    </nav>
  );
}
