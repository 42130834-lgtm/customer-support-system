import { NavLink } from "react-router-dom";

// links: [{ to, label }] aw [{ label, onClick }] la button (masalan Log out)
// right: links 3al yamin
export default function Nav({ links = [], right = [], sticky = false }) {
  const item = (l) =>
    l.to ? (
      <NavLink key={l.label} to={l.to} end className={({ isActive }) => (isActive ? "active" : "")}>
        {l.label}
      </NavLink>
    ) : (
      <button key={l.label} type="button" className="nav-btn" onClick={l.onClick}>
        {l.label}
      </button>
    );

  return (
    <nav className={"nav" + (sticky ? " sticky" : "")}>
      <div className="logo">Support Assistant</div>
      {links.map(item)}
      {right.length > 0 && <span className="spacer" />}
      {right.map(item)}
    </nav>
  );
}
