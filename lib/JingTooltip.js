'use strict';

import React, { Component, PropTypes } from 'react';
import { Tooltip, Overlay, Button, OverlayTrigger, Popover } from 'react-bootstrap';

class WcTooltip extends Component{
    
    constructor(props, context) {
        super(props, context);
        const {targetvalue, tipvalue, placement, trigger} = this.props;
        this.state = {
            targetvalue: targetvalue,
            tipvalue: tipvalue,
            placement: placement || 'right',
            trigger: trigger || ['hover', 'focus', 'click']
        };
    }
    
    render(){
        
        let tipvalue;
        if(typeof this.state.tipvalue !== "object"){
            let tipvalues = this.state.tipvalue || "";
            let tipvalueArray = tipvalues.split(/\n/);
            tipvalue = tipvalueArray.map((v, i) => <p key={i} style={{margin: 0}}>{v}</p>);
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