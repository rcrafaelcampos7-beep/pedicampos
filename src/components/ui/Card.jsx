export function Card({ children, className = "", as: Component = "div", variant = "default", ...props }) {
  return (
    <Component className={`card card-${variant} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
