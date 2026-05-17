import { Router, Route } from "@solidjs/router";
import Login from "./pages/login";
import Upload from "./pages/upload";
import Signup from "./pages/signup";
import Guest from "./pages/guest";
import Home from "./pages/home";

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/upload" component={Upload} />
      <Route path="/guest" component={Guest} />
    </Router>
  );
}

export default App;