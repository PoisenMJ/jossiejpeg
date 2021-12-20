import ReactDOM from "react-dom";
import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../sass/stylesheets/custom.scss";
import AdminMessages from "./Pages/admin/AdminMessages";
import Messages from './Pages/Messages';
import Home from './Pages/Home';
import AdminUpload from "./Pages/admin/AdminUpload";
import Payment from "./Pages/Payment";
import Gallery from "./Pages/Gallery";
import AdminStatements from "./Pages/admin/AdminStatements";
import Settings from "./Pages/Settings";
import './index.css';
import AdminModeration from "./Pages/admin/AdminModeration";
import { Flasher } from 'react-universal-flash';
import Alert from './Components/Alert';
import Login from "./Pages/Login";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/login" component={Login}/>
                <Route exact path="/payment/subscribe" component={Payment}/>
                <Route exact path="/home" component={Home}/>
                <Route exact path="/message" component={Messages}/>
                <Route exact path="/settings" component={Settings}/>
                <Route exact path="/gallery" component={Gallery}/>
                <Route exact path="/admin/" component={AdminUpload}/>
                <Route exact path="/admin/message" component={AdminMessages}></Route>
                <Route exact path="/admin/upload" component={AdminUpload}></Route>
                <Route exact path="/admin/statements" component={AdminStatements}/>
                <Route exact path="/admin/moderation" component={AdminModeration}/>
                <Route exact path="/" component={Login}/>
            </Switch>
            <Flasher position="bottom_center">
                <Alert/>
            </Flasher>
        </BrowserRouter>
    )
}

ReactDOM.render(<App/>, document.getElementById("root"));