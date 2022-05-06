import { StrictMode, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

const Landing = lazy(() => import(/* webpackChunkName: 'landing' */'./Landing.js'));
const Login = lazy(() => import(/* webpackChunkName: 'login' */'./Login.js'));

function Empty () {
  return <div>Loading...</div>;
}

const App = () => (
  <StrictMode>
    <Router>
      <Suspense fallback={<Empty />}>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </Router>
  </StrictMode>
);

export default App;
