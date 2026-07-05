import { Routes, Route } from "react-router-dom";
import Login from "../Pages/Login";
import AdminPage from "../Pages/AdminPage";
import Contador from "../Pages/Contador";
import Cozinheiro from "../Pages/Cozinheiro";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin-dashboard" element={<AdminPage />} />
            <Route path="/contador" element={<Contador />} />
            <Route path="/cozinheir" element={<Cozinheiro />} />
        </Routes>
    );
}

export default AppRoutes;