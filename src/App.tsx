import { Router, Route } from "@solidjs/router";
import Login from "./pages/login";
import Upload from "./pages/upload";
import Signup from "./pages/signup";

function App() {
  return (
    <Router>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/upload" component={Upload} />
      <Route path="/" component={() => <div>Navigate to /login, /signup, or /upload</div>} />
    </Router>
  );
}

export default App;