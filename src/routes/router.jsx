import { useEffect, useState } from "react";

export function normalizePath(pathname = window.location.pathname) {
  const clean = pathname.replace(/\/+$/, "");
  return clean || "/";
}

export function navigate(to) {
  const next = normalizePath(to);
  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function usePath() {
  const [path, setPath] = useState(() => normalizePath());

  useEffect(() => {
    const update = () => setPath(normalizePath());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return path;
}

export function Link({ to, children, className = "", ...props }) {
  function handleClick(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
