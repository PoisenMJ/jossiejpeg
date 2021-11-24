import React from 'react';
import AdminNavigation from './AdminNavigation';
import RevenueBox  from '../../Components/RevenueBox';
import RevenueMonthBox from '../../Components/RevenueMonthBox';
import RevenueUserBox from '../../Components/RevenueUserBox';

const num_months = 6;

export default class AdminStatements extends React.Component {
    constructor(props){
        super(props);
        var c = [];
        var startDate = new Date();
        c.push([startDate.getFullYear(), startDate.getMonth()]);
        for(var i = 0; i < num_months-1; i++){
            var newMonthIndex = (startDate.getMonth() - (i+1));
            var year = startDate.getFullYear();
            if(newMonthIndex < 0){
                newMonthIndex += 12;
                year -= 1;
            }
            var newDate = new Date(year, newMonthIndex);
            c.push([newDate.getFullYear(), newDate.getMonth()]);
        }
        console.log(c);
        this.state = { dates: c };
    }

    render(){
        return (
            <div id="parent">
                <AdminNavigation location="statements"/>
                <div id="admin-statements">
                    <div id="admin-statements-left">
                        <RevenueBox/>
                        <RevenueUserBox/>
                    </div>
                    <div id="admin-statements-months">
                        {this.state.dates.map((date, index) => {
                            return(<RevenueMonthBox index={index} year={date[0]} month={date[1]} key={date}/>)
                        })}
                    </div>
                </div>
            </div>
        );
    }
}