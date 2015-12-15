'use strict';

import React, { Component, PropTypes } from 'react';
import { Tooltip, Overlay, Button, OverlayTrigger, Popover } from 'react-bootstrap';

class WcTooltip extends Component{
    
    constructor(props, context) {
        super(props, context);
        this.state = {
            targetvalue: this.props.targetvalue,
            tipvalue: this.props.tipvalue,
            placement: this.props.placement || 'right',
            trigger: this.props.trigger || ['hover', 'focus', 'click']
        };
    }
    
    render(){
        
        var tipvalue;
        if(typeof this.state.tipvalue !== "object"){
            let tipvalues = this.state.tipvalue || "";
            let tipvalueArray = tipvalues.split(/\n/);
            tipvalue = tipvalueArray.map(function(v, i){
                return <p key={i} style={{margin: 0}}>{v}</p>;
            });
        }else{
            tipvalue = this.state.tipvalue;
        }
        let tooltip = <Tooltip id="_t">{tipvalue}</Tooltip>;
        if(this.props.tipStyle == "pop"){
            let poptitle = this.props.poptitle || "内容";
            tooltip = <Popover id="_p" title={poptitle} style={{minWidth: 200, maxWidth: 800}}>{tipvalue}</Popover>;
        }
        let targetdiv = <span>{this.state.targetvalue}</span>;
        if(this.props.targetStyle === "a"){
            targetdiv = <a href="javascript:void(0)">{this.state.targetvalue}</a>;
        }
        if(this.props.targetStyle === "button"){
            targetdiv = <Button bsStyle="default">{this.state.targetvalue}</Button>;
        }
        return (
            <OverlayTrigger placement={this.state.placement} trigger={this.state.trigger} overlay={tooltip} rootClose>
                {targetdiv}
            </OverlayTrigger>
        )
    }
}

export default WcTooltip;