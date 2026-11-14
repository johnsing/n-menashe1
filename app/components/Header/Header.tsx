import HebrewDate from "./HebrewDate";

export default function Header() {
  return (
    <header className="nav">
      <span className="nav-brand">N-MENASHE</span>
      <HebrewDate />
    </header>
  );
}