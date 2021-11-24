import React from 'react';
import { Form } from 'react-bootstrap';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const config = require('../../config.json');
const PREFIX = (config.DEVELOPMENT) ? config.DEVELOPMENT_ROUTE_PREFIX : '';

export default class RevenueBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            date: new Date(),
            chartData: [],
            totals: {},
            years: []
        };
        this.getNumberOfDataYears();
        this.fetchStats(2021);
    }

    onYearChange = (year) => {
        this.fetchStats(year);
    }

    getNumberOfDataYears(){
        fetch(`${PREFIX}/admin/stats/allyears`).then(raw => raw.json()).then(data => {
            this.setState({ years: data });
        })
    }

    fetchStats(year){
        fetch(`${PREFIX}/admin/stats/${year}`).then(raw => raw.json()).then(data => {
            this.setState({ chartData: data.data, totals: data.totals })
        });
    }

    render(){
        return(
            <div id="revenue-box">
                <div style={{display: 'grid', placeItems: 'center', marginBottom: '1rem'}}>
                    <span className="lead">Year Statistics</span>
                </div>
                <Form.Select aria-label="Year revenue" className="mb-2">
                    {this.state.years.map((year, index) => {
                        return(
                            <option key={year} value={year} onClick={() => this.onYearChange(year)}>{year}</option>
                        )
                    })}
                </Form.Select>
                <ResponsiveContainer height={200}>
                    <LineChart data={this.state.chartData}>
                        <Line type="monotone" dataKey="subscriptions" dot={false} stroke="#0d6efd" />
                        <Line type="monotone" dataKey="posts" dot={false} stroke="#dc3545" />
                        <Line type="monotone" dataKey="messages" dot={false} stroke="#000000" />
                        <Tooltip/>
                        {/* <Legend/> */}
                        <XAxis dataKey="name" tick={false}/>
                        {/* <YAxis /> */}
                    </LineChart>
                </ResponsiveContainer>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex  align-items-center">
                        <span className="rounded-circle bg-blue p-1 mx-2"></span>
                        <span className="text-muted">Subscriptions</span>
                        <span className="admin-year-totals">${this.state.totals.subscriptions}</span>
                    </li>
                    <li className="list-group-item d-flex  align-items-center">
                        <span className="rounded-circle bg-danger p-1 mx-2"></span>
                        <span className="text-muted">Messages</span>
                        <span className="admin-year-totals">${this.state.totals.messages}</span>
                    </li>
                    <li className="list-group-item d-flex  align-items-center">
                        <span className="rounded-circle bg-black p-1 mx-2"></span>
                        <span className="text-muted">Posts</span>
                        <span className="admin-year-totals">${this.state.totals.posts}</span>
                    </li> 
                </ul>
            </div>
        )
    }
}