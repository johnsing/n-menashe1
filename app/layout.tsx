import Header from "./Componnent/Header/Header";
import Footer from "./Componnent/Footer/Footer";
import "./globals.css";
import TabBar from "./Componnent/Header/TabBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="site-content">{children}</div>
        <TabBar />
        <Footer />
      </body>
    </html>
  );
}