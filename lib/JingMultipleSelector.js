'use strict';

import React from 'react'; 
import { Row, Col, ButtonGroup, Button, Input } from 'react-bootstrap';

class MultiSelect extends React.Component {

    render() {
        const { items, itemValue, onSelect, itemLabel } = this.props;
        const itemOptions = items.map((item, index) => <option key={index} value={item[itemValue || 'value']}>{item[itemLabel || 'label']}</option>);
        return <Input type="select" multiple style={{minHeight: 140, overflowY: "auto"}} onClick={(e) => {onSelect(e.target.value)}} >
            {itemOptions}
        </Input>
    }
}

class MultiSelects extends React.Component {
    
    constructor(props, context) {
        super(props, context);
        const { source } = this.props;
        this.state = {
            source: source,
            target: [],
            lselected: {},
            rselected: {}
        };
    }
    
    handleLeftSelect(value){
        if(value !== ""){
            const { itemValue, itemLabel, targetHandler } = this.props;
            const { source, target } = this.state;
            const sourceItems = source.filter((item) => item[itemValue || "value"] != value);
            const targetItems = source.filter((item) => item[itemValue || "value"] == value);
            const newTarget = target.concat(targetItems);
            this.setState({source: sourceItems, target: newTarget});
            targetHandler(newTarget);
        }
    }
    
    handleRightSelect(value){
        if(value !== ""){
            const { itemValue, itemLabel, targetHandler } = this.props;
            const { source, target } = this.state;
            const targetItems = target.filter((item) => item[itemValue || "value"] != value);
            const sourceItems = target.filter((item) => item[itemValue || "value"] == value);
            this.setState({source: source.concat(sourceItems), target: targetItems});
            targetHandler(targetItems);
        }
    }
    
    handleLeftSingle(){
        const { source, target } = this.state;
        const { targetHandler } = this.props;
        if(source.length > 0){
            target.push(source.shift());
            this.setState({source: source, target: target});
            targetHandler(target);
        }
    }
    
    handleLeftMultiple(){
        const { source, target } = this.state;
        const { targetHandler } = this.props;
        if(source.length > 0){
            const newTarget = target.concat(source);
            this.setState({source: [], target: newTarget})
            targetHandler(newTarget);
        };
    }
    
    handleRightSingle(){
        const { source, target } = this.state;
        if(target.length > 0){
            const { targetHandler } = this.props;
            source.push(target.shift());
            this.setState({source: source, target: target});
            targetHandler(target);
        }
    }
    
    handleRightMultiple(){
        const { source, target } = this.state;
        const { targetHandler } = this.props;
        if(target.length > 0){
            this.setState({source: source.concat(target), target: []});
            targetHandler([]);
        };
    }

    render() {
        const { itemValue, itemLabel } = this.props;
        const { source, target } = this.state;
        let ldisabled, rdisabled;
        
        if(!source || source.length === 0){
            ldisabled = true;
        }else{
            ldisabled = false;
        }
        
        if(!target || target.length === 0){
            rdisabled = true;
        }else{
            rdisabled = false;
        }
        
        return <Row>
            <Col xs={2}>
                <MultiSelect items={source} itemValue={itemValue} itemLabel={itemLabel} onSelect={this.handleLeftSelect.bind(this)}/>
            </Col>
            <Col xs={1} style={{textAlign: "center", padding: 10}}>
                <ButtonGroup vertical>
                    <Button disabled={ldisabled} bsSize="small" onClick={this.handleLeftSingle.bind(this)}> {' >'} </Button>
                    <Button disabled={ldisabled} bsSize="small" onClick={this.handleLeftMultiple.bind(this)}> {'>>'} </Button>
                    <Button disabled={rdisabled} bsSize="small" onClick={this.handleRightSingle.bind(this)}> {'< '} </Button>
                    <Button disabled={rdisabled} bsSize="small" onClick={this.handleRightMultiple.bind(this)}> {'<<'} </Button>
                </ButtonGroup>
            </Col>
            <Col xs={2}>
                <MultiSelect items={target} itemValue={itemValue} itemLabel={itemLabel} onSelect={this.handleRightSelect.bind(this)}/>
            </Col>
        </Row>
    }
}

export default MultiSelects;