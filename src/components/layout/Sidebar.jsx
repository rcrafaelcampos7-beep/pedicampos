import { Link } from "../../routes/router.jsx";

export function Sidebar({ brand, links, activePath, footer }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">{brand?.slice(0, 2).toUpperCase()}</span>
        <strong>{brand}</strong>
      </div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={activePath === link.to ? "active" : ""}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      {footer ? <div className="sidebar-footer">{footer}</div> : null}
    </aside>
  );
}
