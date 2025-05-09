import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Dashboard from "./components/Dashboard";

import Overall from "./components/Overall";
import MainCommodity from "./components/MainCommodityLayout";

import Spice from "./components/SpiceLayout";
import Fruit from "./components/FruitLayout";
import Pulse from "./components/PulseLayout";
import OilSeed from "./components/OilSeedsLayout";
import Vegetable from "./components/VegetableLayout";
import RootCrop from "./components/RootCropLayout";
import BuildingMaterials from "./components/BuildingMaterilsLayout";
import GrainsAndCereals from "./components/GrainsAndCerealsLayout";
import UserAndNews from "./components/UserAndNewsLayout";
import CreatePost from "./components/ContentManagement/CreatePost";
import AddExchangeRate from "./components/ContentManagement/AddExchangeRate";
import Posting_form_admin from "./components/OfferManagement/CreateOffer";
import CreateProduct from "./components/productManagement/CreateProduct";
import CreateProperty from "./components/productManagement/CreateProperty";
import CreatePropertyValue from "./components/productManagement/CreatePropertyValue";
import PreViewPosts from "./components/ContentManagement/PreViewPosts";
import EditPost from "./components/ContentManagement/EditPost";
import Login from "./components/shared/Login";
import RequireAuth from "./components/shared/RequireAuth";
import AddAdmin from "./components/UserManagement/AddAdmin";
import RemoveAdmin from "./components/UserManagement/RemoveAdmin";
import ListOffer from "./components/OfferManagement/ListOffer";
import Users from "./components/UserManagement/Users";
import ProductPrice from "./components/productManagement/ProductPrice";
import ProductValueCalc from "./components/productManagement/ProductValueCalc";
import PostStatistics from "./components/ContentManagement/PostStatistics";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="login" element={<Login />} />

        {/* All other routes require you to be “admin” */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Overall />} />
          <Route path="Overall" element={<Overall />} />
          <Route path="mainCommodity" element={<MainCommodity />} />
          <Route path="Spice" element={<Spice />} />
          <Route path="Fruit" element={<Fruit />} />
          <Route path="Pulse" element={<Pulse />} />
          <Route path="OilSeed" element={<OilSeed />} />
          <Route path="Vegetable" element={<Vegetable />} />
          <Route path="RootCrop" element={<RootCrop />} />
          <Route path="BuildingMaterials" element={<BuildingMaterials />} />
          <Route path="GrainsAndCereals" element={<GrainsAndCereals />} />
          <Route path="UserAndNews" element={<UserAndNews />} />
          {/* your ankuaru sub‐routes */}
          <Route path="ankuaru/createPost" element={<CreatePost />} />
          <Route path="ankuaru/addExchangeRate" element={<AddExchangeRate />} />
          <Route path="ankuaru/preViewPosts" element={<PreViewPosts />} />
          <Route path="ankuaru/postOffer" element={<Posting_form_admin />} />
          <Route path="ankuaru/listOffer" element={<ListOffer />} />
          <Route path="ankuaru/createProduct" element={<CreateProduct />} />
          <Route path="ankuaru/createProperty" element={<CreateProperty />} />
          <Route path="ankuaru/users" element={<Users />} />
          <Route path="ankuaru/productPrice" element={<ProductPrice />} />
          <Route
            path="ankuaru/createPropertyValue"
            element={<CreatePropertyValue />}
          />
          <Route
            path="ankuaru/productValueCalc"
            element={<ProductValueCalc />}
          />
          <Route path="ankuaru/editPost/:id" element={<EditPost />} />
          <Route path="ankuaru/postStatistics" element={<PostStatistics />} />
          <Route path="ankuaru/addAdmin" element={<AddAdmin />} />
          <Route path="ankuaru/removeAdmin" element={<RemoveAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
