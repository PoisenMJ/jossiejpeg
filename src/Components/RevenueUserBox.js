import React from 'react';
import { ResponsiveContainer, Bar, BarChart, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { route_prefix } from '../../utility';

export default class RevenueUserBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chartData: '',
            users: ''
        }
        this.fetchTopTen();
    }

    fetchTopTen(){
        fetch(`${route_prefix}/admin/stats/top`).then(raw => raw.json()).then(data => {
            var users = Object.values(data).map((e) => Object.values(e)[0]);
            this.setState({ chartData: data, users: users })
        })
    }

    render(){
        let content, userList;
        if(this.state.users){
            content = this.state.users.map((user, index) => {
                console.log(user);
                return(
                    <Bar key={index} dataKey={"total"} fill="#000"/>
                )
            });
            userList = this.state.chartData.map((user, index) => {
                return(
                    <li key={user.name} className="list-group-item d-flex  align-items-center">
                        <span className="rounded-circle bg-black p-1 mx-2"></span>
                        <span className="text-muted">{user.name}</span>
                        <span className="admin-year-totals">${user.total}</span>
                    </li>
                )
            })
        }
        return(
            <div id="admin-statements-top-users">
                <div style={{display: 'grid', placeItems: 'center'}}>
                    <span className="text-center lead">Top Users</span>
                </div>
                <ResponsiveContainer height={200}>
                    <BarChart data={this.state.chartData}>
                        <XAxis dataKey="name" tick={false}/>
                        <YAxis/>
                        <Bar dataKey="total" fill="#000000"/>
                        <Tooltip/>
                    </BarChart>
                </ResponsiveContainer>
                <ul className="list-group list-group-flush">
                    {userList}
                </ul>
            </div>
        )
    }
}