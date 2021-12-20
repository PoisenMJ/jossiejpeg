import React from 'react';
import { Accordion } from 'react-bootstrap';
import { ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis} from 'recharts';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import { route_prefix } from '../../utility';
const months = [ "January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December" ];

function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
        console.log('totally custom!'),
    );

    return (
        <button
        type="button"
        className="btn btn-primary btn-block w-100"
        onClick={decoratedOnClick}
        >
            {children}
        </button>
    );
}                  

export default class RevenueMonthBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chartData: '',
            totals: {}
        }
        fetch(`${route_prefix}/admin/stats/${this.props.year}/${this.props.month}`).then(raw => raw.json())
        .then(data => {
            this.setState({ chartData: data.data, totals: data.totals });
        });
    }

    render(){
        return(
            <div className="revenue-month">
                {/* <Accordion defaultActiveKey="0"> */}
                <Accordion >
                    <Accordion.Item>
                        <CustomToggle>
                            {this.props.year} {months[this.props.month]}
                        </CustomToggle>
                        <Accordion.Body>
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={this.state.chartData}>
                                    <Line type="monotone" dataKey="subscriptions" dot={false} stroke="#0d6efd" />
                                    <Line type="monotone" dataKey="messages" dot={false} stroke="#dc3545" />
                                    <Line type="monotone" dataKey="posts" dot={false} stroke="#000000" />
                                    <Tooltip/>
                                    <XAxis dataKey="name" tick={false}/>
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
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        )
    }
}