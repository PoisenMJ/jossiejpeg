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
import AdminStatements from "./Pages/admin/AdminStatements";
import Settings from "./Pages/Settings";
import './index.css';
import AdminModeration from "./Pages/admin/AdminModeration";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/payment" component={Payment}/>
                <Route exact path="/home" component={Home}/>
                <Route exact path="/message" component={Messages}/>
                <Route exact path="/settings" component={Settings}/>
                <Route exact path="/admin/" component={AdminUpload}/>
                <Route exact path="/admin/message" component={AdminMessages}></Route>
                <Route exact path="/admin/upload" component={AdminUpload}></Route>
                <Route exact path="/admin/statements" component={AdminStatements}/>
                <Route exact path="/admin/moderation" component={AdminModeration}/>
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(<App/>, document.getElementById("root"));