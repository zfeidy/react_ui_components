'use strict';

import React, { PropTypes, Component } from 'react';
import { Input, Row, Col } from 'react-bootstrap';

export class Selector extends Component{
    constructor(props, context) {
        super(props, context);
        this.state = {
            datas: []
        }
    }
    
    componentWillMount() {
        const { datas, url, method} = this.props;
        if(datas){
            this.setState({datas: datas});
        }else if(url){
            const self = this;
            ajaxProxy({
                url: url,
                type: method || "post",
                dataType: 'json',
                success(data){
                    if(data instanceof Array){
                        self.setState({
                            datas: data
                        });
                    }
                }
            });
        }
    }
    
    render(){
        const { datas} = this.state;
        const { itemValue, itemLabel, lxs, wxs, defaultOpt, name, label, bsSize, onChange} = this.props;
        let options = [];
        if(!defaultOpt){
            option.push(<option key={"default"} value="">选择</option>);
        }
        options = options.concat(datas.map(
            (item, index) => 
            <option key={index} value={item[itemValue || "value"]}>{item[itemLabel || "label"]}</option>
        ));
        return (
            <Input type='select' ref={name || "name"} 
                onChange={(e) => onChange && onChange(e.target.value)} 
                bsSize={bsSize || 'small'}
                label={label}
                labelClassName={"col-xs-" + (lxs || 1)} 
                wrapperClassName={"col-xs-" + (wxs || 11)}>
                {options}
            </Input>
        );
    }
}

export class CheckBoxGroup extends Component {
    
    constructor(props, context) {
        super(props, context);
        const { itemValue, itemLabel, datas} = this.props;
        const il = itemLabel || "label";
        const iv = itemValue || "value";
        var datastate = this.resetDatas(datas, iv, il);
        this.state = {
            values: datastate.values,
            datas: datastate.datas,
            allchecked: datastate.allchecked,
            itemLabel: il,
            itemValue: iv,
            rowStyle: {
                marginLeft: 0,
                marginBottom: 0
            }
        }
    }
    
    componentWillReceiveProps(nextProps){
        this.setState(this.resetDatas(nextProps.datas));
    }
    
    resetDatas(datas, itemValue, itemLabel){
        const iv = itemValue || this.state.itemValue, il = itemLabel || this.state.itemLabel;
        let allchecked = true, values = [];
        let _datas = datas.map((d) => {
            if(typeof d === "string"){
                let _d = {};
                _d[iv] = d;
                _d[il] = d;
                allchecked &= false;
                return _d;
            }
            allchecked &= (d.checked || false);
            if(d.checked){
                values.push(d[iv])
            }
            return d;
        });
        return { datas: _datas, allchecked: allchecked, values: values};
    }
    
    handleChange(e, value, self){
        var checked = e.target.checked, values = self.state.values, datas = self.state.datas, itemValue = self.state.itemValue;
        // 重新渲染数据
        var _datas = datas.map(function(d){
            if(d[itemValue] == value){
                d.checked = checked;
            }
            return d;
        });
        if(!checked){
            var _values = _.without(values, value);
            self.setState({allchecked: false, values: _values, datas: _datas});
        }else{
            values.push(value);
            if(values.length === datas.length){
                self.setState({allchecked: true, values: values, datas: _datas});
            }else{
                self.setState({allchecked: false, values: values, datas: _datas});
            }
        }
        if(self.props.onChange){
            self.props.onChange(value);
        }
    }
    
    handleAllChange(){
        var allchecked = this.refs.all.getChecked(), datas = this.state.datas, values = [], itemValue = this.state.itemValue;
        var _datas = datas.map((d) => {
            d.checked = allchecked;
            if(allchecked){
                values.push(d[itemValue]);
            }
            return d;
        });
        
        this.setState({allchecked: allchecked, datas: _datas, values: values});
        if(this.props.onAllChange){
            this.props.onAllChange(values);
        }
    }
    
    renderCheckboxs(datas, cxs){
        var self = this, itemValue = self.state.itemValue, itemLabel = self.state.itemLabel;
        var checkboxs = datas.map((d, i) => <Col key={i} xs={cxs}>
            <Input inline type="checkbox" label={d[itemLabel]} checked={d.checked || false} disabled={d.disabled || false} key={i} onChange={(e) => self.handleChange(e, d[itemValue], self)}/>
        </Col>);
        return checkboxs;
    }
    
    render(){
        var cxs = this.props.cxs || 1, lxs = this.props.lxs || 1, wxs = this.props.wxs || 11;
        var rowStyle = this.state.rowStyle, datas = this.state.datas, allchecked = this.state.allchecked;
        var checkboxs = this.renderCheckboxs(datas, cxs);
        return (
            <Input ref={ this.props.name || "wccheckbox"} value={this.state.values} label={this.props.label} labelClassName={"col-xs-" + lxs} wrapperClassName={"no-bottom col-xs-" + wxs}  bsSize="small">
                <Row style={rowStyle}>
                    <Col xs={cxs}>
                        <Input type="checkbox" ref="all" label="全部" value="all" checked={allchecked} inline onChange={this.handleAllChange.bind(this)}/>
                    </Col>
                    {checkboxs}
                </Row>
            </Input>
        )
    }
}

export class RadioGroup extends Component {
    
    constructor(props, context) {
        super(props, context);
        const { itemValue, itemLabel, datas} = this.props;
        let il = itemLabel || "label";
        let iv = itemValue || "value";
        let datastate = this.resetDatas(datas, iv, il);
        
        this.state = {
            datas: datastate.datas,
            value: datastate.value,
            itemLabel: il,
            itemValue: iv,
            rowStyle: {
                marginLeft: 0,
                marginBottom: 0
            }
        }
    }
    
    componentWillReceiveProps(nextProps){
        this.setState(this.resetDatas(nextProps.datas));
    }
    
    resetDatas(datas, itemValue, itemLabel){
        let value = null;
        const iv = itemValue || this.state.itemValue, il = itemLabel || this.state.itemLabel;
        const _datas = datas.map((d) => {
            if(typeof d === "string"){
                var _d = {};
                _d[iv] = _d[il] = d;
                return _d;
            }
            if(d.checked){
                value = d[iv];
            }
            return d;
        });
        return {datas: _datas, value: value};
    }
    
    handleSelect(e){
        let value = e.target.value;
        let { itemValue, datas } = this.state;
        datas = datas.map((d) => {
            if(d[itemValue] == value){
                d.checked = true;
            }else{
                d.checked = false;
            }
            return d;
        });
        this.setState({datas: datas, value: value});
        this.props.onHandleCheck &&  this.props.onHandleCheck(value);
    }
    
    renderRadios(datas, cxs, style){
        var self = this, itemValue = self.state.itemValue, itemLabel = self.state.itemLabel;
        var radios = datas.map((d, i) => 
            (<Col key={i} xs={cxs}>
                <Input type="radio" value={d[itemValue]} label={d[itemLabel]} 
                checked={d.checked || false} 
                disabled={d.disabled || false} 
                onChange={self.handleSelect.bind(self)}/>
            </Col>)
        );
        return radios;
    }
    
    render (){
        const { rowStyle, datas, value } = this.state;
        const { radiostyle, bsSize, label, name, cxs, lxs, wxs } = this.props;
        // 渲染
        var radios = this.renderRadios(datas, cxs || 1, radiostyle);
        return (
            <Input label={label} ref={name || "wcradio"} value={value} 
                labelClassName={"col-xs-" + (lxs || 1)} 
                wrapperClassName={"col-xs-" + (wxs || 11)} 
                bsSize={bsSize || "small"}>
                <Row key={1} style={rowStyle}>
                    {radios}
                </Row>
            </Input>
        )
    }
}

export class ButtonList extends Component{
    render(){
        let cols = this.props.datas.map(
            (bl, index) => 
            <Col key={index} xs={2}><Button justified bsStyle="info" onClick={bl.handle}>{bl.label}</Button></Col>
        );
        return (
            <Row style={{textAlign: "center"}}>{cols}</Row>
        );
    }
}

export class SplitLine extends Component{
    render(){
        let splitlineStyle = {
            margin : "10px 0",
            width: "100%",
            fontWeight: "bold",
            color: "grey",
            borderBottom: "1px solid #ddd"
        };
        return (
            this.props.title ? <div style={splitlineStyle}>{this.props.title}</div> : <div style={splitlineStyle}/>
        );
    }
}