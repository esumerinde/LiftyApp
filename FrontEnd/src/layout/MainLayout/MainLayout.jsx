import { Outlet } from "react-router-dom";
import TopHeader from "../TopHeader/TopHeader";
import BottomNav from "../BottomNav/BottomNav";
import "./MainLayout.css";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <TopHeader />

      <main className="main-content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
