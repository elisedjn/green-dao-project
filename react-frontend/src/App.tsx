import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import MemberPage from './Pages/MemberPage';

function App() {
  //Here we are using react-router-dom to set up the different pages of our app. The path is what will be in the url and the element in the React Component we want to display in it (they should all be stored in Pages folder)
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/member/:memberId' element={<MemberPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
