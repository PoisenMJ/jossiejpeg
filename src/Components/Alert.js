import React from 'react';

const messageBarStyle = {
    "padding": "10px",
    "borderRadius": "3px",
    "backgroundColor": "#dc3545",
    "color": "white",
    "marginBottom": "15px",
    "display": "grid",
    "gridAutoFlow": "column",
    "transition": "0.5s",
}

const closeButtonStyle = {
    marginLeft: "15px",
    top: "0",
    color: "white",
    fontWeight: "bold",
    float: "right",
    fontSize: "22px",
    lineHeight: "20px",
    cursor: "pointer",
    justifySelf: "end"
}

export default function Message ({type,content,deleteFlash}){
    const style =  ((type === "green")||(type === "success")) ? {...messageBarStyle,"backgroundColor":"#adb5bd"}:messageBarStyle;
    return(<div style={ style } >
        {content}
        <span style={closeButtonStyle} onClick={deleteFlash}>&times;</span>
    </div>)
}