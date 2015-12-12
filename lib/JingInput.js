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
        if(this.props.datas){
            this.setState({
                datas: this.props.datas
            });
        }else if(this.props.url){
            var method = this.props.method;
            var self = this;
            ajaxProxy({
                url: self.props.url,
                type: method ? method : "post",
                dataType: 'json',
                success(data){
                    if(data instanceof Array){
                        self.setState({
                            datas: data
                        });
                    }else{

                    }
                }
            });
        }
    }
    
    handleChange(e){
        if(this.props.onChange){
            this.props.onChange(e.target.value);
        }
    }
    
    render(){
        var self = this;
        var itemValue = self.props.itemValue || "value";
        var itemLabel = self.props.itemLabel || "label";
        var defaultOpt = self.props.defaultOpt;
        var option = [];
        if(!defaultOpt){
            option.push(<option key={"default"} value="">选择</option>);
        }
        var ops = this.state.datas.map(function(data){
            var value = data[itemValue];
            var label = data[itemLabel];
            return <option key={value} value={value}>{label}</option>
        });
        option = option.concat(ops);
        var lxs = this.props.lxs || 1;
        var wxs = this.props.wxs || 11;
        return (
            <Input type='select' ref={this.props.name || "name"} label={this.props.label} onChange={this.handleChange.bind(this)} bsSize='small' labelClassName={"col-xs-" + lxs} wrapperClassName={"col-xs-" + wxs}>
                {option}
            </Input>
        );
    }
}

export class CheckBoxGroup extends Component {
    
    constructor(props, context) {
        super(props, context);
        var itemLabel = this.props.itemLabel || "label";
        var itemValue = this.props.itemValue || "value";
        var datastate = this.resetDatas(this.props.datas, itemValue, itemLabel);
        
        this.state = {
            values: datastate.values,
            datas: datastate.datas,
            allchecked: datastate.allchecked,
            itemLabel: itemLabel,
            itemValue: itemValue,
            rowStyle: {
                marginLeft: 0,
                marginBottom: 0
            }
        }
    }
    
    componentWillReceiveProps(nextProps){
        var datastate = this.resetDatas(nextProps.datas);
        this.setState(datastate);
    }
    
    resetDatas(datas, itemValue, itemLabel){
        var iv = itemValue || this.state.itemValue, il = itemLabel || this.state.itemLabel, allchecked = true, values = [];
        var _datas = datas.map(function(d){
            if(typeof d === "string"){
                var _d = {};
                _d[iv] = d;
                _d[il] = d;
                allchecked &= false;
                return _d;
            }
            allchecked &= (d.checked || false);
            if(d.checked){values.push(d[iv])}
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
        var _datas = datas.map(function(d){
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
        var checkboxs = datas.map(function(d, i){
            return (<Col key={i} xs={cxs}>
                <Input inline type="checkbox" label={d[itemLabel]} checked={d.checked || false} disabled={d.disabled || false} key={i} onChange={function(e){self.handleChange(e, d[itemValue], self)}}/>
            </Col>);
        });
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
        
        let itemLabel = this.props.itemLabel || "label";
        let itemValue = this.props.itemValue || "value";
        let datastate = this.resetDatas(this.props.datas, itemValue, itemLabel);
        
        this.state = {
            datas: datastate.datas,
            value: datastate.value,
            itemLabel: itemLabel,
            itemValue: itemValue,
            rowStyle: {
                marginLeft: 0,
                marginBottom: 0
            }
        }
    }
    
    componentWillReceiveProps(nextProps){
        var datastate = this.resetDatas(nextProps.datas);
        this.setState(datastate);
    }
    
    resetDatas(datas, itemValue, itemLabel){
        var iv = itemValue || this.state.itemValue, il = itemLabel || this.state.itemLabel, value = null;
        var _datas = datas.map(function(d){
            if(typeof d === "string"){
                var _d = {};
                _d[iv] = d;
                _d[il] = d;
                return _d;
            }
            if(d.checked){value = d[iv]}
            return d;
        });
        return {datas: _datas, value: value};
    }
    
    handleSelect(e){
        let value = e.target.value;
        let itemValue = this.state.itemValue;
        let datas = this.state.datas;
        datas = datas.map(function(d){
            if(d[itemValue] == value){
                d.checked = true;
            }else{
                d.checked = false;
            }
            return d;
        });
        this.setState({datas: datas, value: value});
        if(this.props.onHandleCheck){
            this.props.onHandleCheck(value);
        }
    }
    
    renderRadios(datas, cxs, style){
        var self = this, itemValue = self.state.itemValue, itemLabel = self.state.itemLabel;
        var radios = datas.map(function(d, i){
                return (<Col key={i} xs={cxs}>
                    <Input key={i} type="radio" value={d[itemValue]} label={d[itemLabel]} checked={d.checked || false} disabled={d.disabled || false} onChange={self.handleSelect.bind(self)}/>
                </Col>)
            });
        return radios;
    }
    
    render (){
        const { rowStyle, datas, value } = this.state;
        const { radiostyle, bsSize, label, name } = this.props;
        
        let cxs = this.props.cxs || 1, lxs = this.props.lxs || 1, wxs = this.props.wxs || 11;
        // 渲染
        var radios = this.renderRadios(datas, cxs, radiostyle);
        return (
            <Input label={label} ref={name || "wcradio"} value={value} labelClassName={"col-xs-" + lxs} wrapperClassName={"col-xs-" + wxs} bsSize={bsSize || "small"}>
                <Row key={1} style={rowStyle}>
                {radios}
                </Row>
            </Input>
        )
    }
}

export class ButtonList extends Component{
    render(){
        let list = this.props.datas;
        let cols = list.map(function(b){
            return <Col xs={2}><Button justified bsStyle="info" onClick={b.handle}>{b.label}</Button></Col>
        });
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