'use strict';

import React, { Component, PropTypes } from 'react';
import { Panel, Input, Row, Col } from 'react-bootstrap';


export default class DynKVInput extends Component {
    
    constructor(props, context) {
        super(props, context);
        this.state = {
            rowData:[],
            rowlength: 0
        }
    }
    
    handleAddIconClick(){
        const rows = this.state.rowData;
        const rowlength = this.state.rowlength + 1;
        this.setState({rowlength: rowlength});
    }
    
    handleSubIconClick(){
        const rows = this.state.rowData;
        const rowlength = this.state.rowlength;
        if(rowlength > 0 ){
            this.setState({rowlength: rowlength-1});
        }
    }
    
    praseKV(str){
        const strArray = str.replace(/["' ]/g,"").split(",");
        let obj = {};
        for(let i in strArray){
            let item = strArray[i].split(":");
            obj[item[0]] = item[1];
        }
        return obj;
    }
    
    handleValueChange(){
        let rowlength = this.state.rowlength;
        let type = this.props.type;
        let kvs = [];
        let kv = {};
        for(let i = 0 ; i< rowlength + 1; i++){
            let refs = this.refs["kvrow" + i].refs;
            let v = refs.v.getValue();
            if(v && v!== null && v.trim() !== ""){
                if(type == "object"){
                    let k = refs.k.getValue();
                    if(k && k!== null && k.trim() !== ""){
                        kv[k] = v;
                }else{
                        console.log("输入不能为空！");
                    }
                }else{
                    kvs.push(v);
                }
            }else{
                console.log("输入不能为空！");
            }
        }
        if(type == "object"){
            kvs.push(kv);
        }
        this.props.onKVInputChange(kvs);
    }
    
    render(){
        let rowdata = [];
        let type = this.props.type;
        let rowlength = this.state.rowlength;
        for(let i = 0; i < rowlength + 1; i++){
            let rowRef = "kvrow" + i;
            rowdata.push(<DynKVRow key={i} addClick={this.handleAddIconClick.bind(this)} subClick={this.handleSubIconClick.bind(this)} type={type} ref={rowRef} onChange={this.handleValueChange.bind(this)}/>);
        }
        return (
            <Input label={this.props.label} labelClassName="col-xs-1" wrapperClassName="col-xs-11 no-bottom"  bsSize="small">
                {rowdata}
            </Input>
        );
    }
}

class DynKVRow extends Component {
    handleChange(){
        this.props.onChange();
    }
    
    render(){
        let type = this.props.type;
        let col;
        if(type == "object"){
            col = (<div>
                    <Col xs={2}><Input key={"k"} type="text" className="form-control" ref="k" placeholder="键名" onChange={this.handleChange.bind(this)}/></Col>
                    <Col xs={4}><Input key={"v"} type="text" className="form-control" ref="v" placeholder="键值" onChange={this.handleChange.bind(this)}/></Col>
                </div>);
        }else{
            col = (<Col xs={3} ><Input key={"v"} type="text" className="form-control" ref="v" placeholder="取值" onChange={this.handleChange.bind(this)}/></Col>);
        }
        return (
            <Row style={{ marginLeft: 0 }}>
                {col}
                <Col xs={1}>
                    <Row>
                        <Col xs={6}>
                            <span onClick={this.props.addClick} style={{cursor: "pointer"}}><RIcon size="2rem" icon="circles-add"/></span>
                        </Col>
                        <Col xs={6}>
                            <span onClick={this.props.subClick} style={{cursor: "pointer"}}><RIcon size="2rem" icon="circles-sub"/></span>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

class RIcon extends Component {
    
    renderGraphic() {
        switch (this.props.icon) {
            case 'circles-add':
                return (
                    <g><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path><path d="M13 11v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3z"></path></g>
                );
            case 'circles-sub':
                return (
                    <g><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path><path d="M8 11v2h8v-2h-8z"></path></g>
                );
        }
    }
    
    render() {
        const { size } = this.props;
        const styles = {
            fill: "currentcolor",
            verticalAlign: "middle",
            width: size,
            height: size
        };
        return (
            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fit style={styles}>
                {this.renderGraphic()}
            </svg>
        );
    }
}