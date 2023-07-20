import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

/* Components */
import Navbar from '../src/components/layout/Navbar.js'
import Footer from '../src/components/layout/Footer.js'
import Container from '../src/components/layout/Container.js'
import Message from './components/layout/Message.js'
/* Pages */
import Login from './components/pages/Auth/Login'
import Register from './components/pages/Auth/Register'
import Home from './components/pages/Home'
import Profile from './components/pages/User/Profile'
import MyPets from './components/pages/Pet/MyPets.js'
import AddPet from './components/pages/Pet/AddPet.js'
import EditPet from './components/pages/Pet/EditPet.js'
import PetDetails from './components/pages/Pet/PetDetails.js'
import MyAdoptions from './components/pages/Pet/MyAdoptions.js'

/* contexts */
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <Router>
      <UserProvider>
        <Navbar />
        <Message />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/pet/mypets" element={<MyPets />} />
            <Route path="/pet/add" element={<AddPet />} />
            <Route path="/pet/edit/:id" element={<EditPet />} />
            <Route path="/pet/:id" element={<PetDetails />} />
            <Route path="/pet/myadoptions" element={<MyAdoptions />} />
          </Routes>
        </Container>
        <Footer />
      </UserProvider>
    </Router>
  );
}

export default App;
