export function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="category-tabs">
      <button
        type="button"
        className={!activeCategory ? "active" : ""}
        onClick={() => onSelect("")}
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
          >
            {category.name}
          </button>
        ))}
    </div>
  );
}
