import ReactDOM from "react-dom";
import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../sass/stylesheets/custom.scss";
import AdminMessages from "./AdminMessages";
import Messages from './Messages';
import Home from './Home';
import AdminUpload from "./AdminUpload";
import Payment from "./Payment";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/message" component={Messages}/>
                <Route exact path="/admin/message" component={AdminMessages}></Route>
                <Route exact path="/admin/upload" component={AdminUpload}></Route>
                <Route exact path="/home" component={Home}/>
                <Route exact path="/payment" component={Payment}/>
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(<App/>, document.getElementById("root"));