'use strict';

import React, { PropTypes, Component } from 'react';
import { Panel, Input, Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'underscore';

export default class AutoComplete extends Component{
    constructor(props, context) {
        super(props, context);
        this.state = {
            datas: [],
            target: "",
            hover: "",
            itemValue: this.props.itemValue || "value",
            itemLabel: this.props.itemLabel || this.props.itemValue || "label",
            shortcut: this.props.shortcut,
            value:{},
            hoverIndex: 0,
            ulStyle:{},
            ulShowStyle: {border: "1px solid #ccc", padding: "0", maxHeight: 200, overflowX: "hidden", boxShadow: "0 5px 10px rgba(0,0,0,.2)", position: "absolute", width: this.props.width || "100%", backgroundColor: "#FFF", zIndex: 99},
            ulHideStyle: {display: "none"},
            liStyle: {borderBottom: "1px solid #ddd", listStyle: "none", padding: 3},
            liTypeStyle: {borderBottom: "2px solid #0dd", listStyle: "none", padding: 3},
            liOverStyle: {borderBottom: "1px solid #ddd",listStyle: "none", padding: 3, backgroundColor: "#d9edf7", cursor: "pointer"},
            liTypeOverStyle: {borderBottom: "2px solid #0dd",listStyle: "none", padding: 3, backgroundColor: "#d9edf7", cursor: "pointer"},
            spanStyle: {cursor: "pointer"},
            spanHightStyle: {color:"red", fontWeight: 600, cursor: "pointer"}
        };
    }
    handleChange(e){
        let inputValue = e.target.value;
        let datas = this.props.datas;
        let { itemValue, itemLabel, shortcut } = this.state;
        if(inputValue.trim() === ""){
            if(datas instanceof Array){
                let dataItems = datas.map(function(data){
                    if(typeof data === "string"){
                        let dataItem = {};
                        dataItem[itemValue] = data;
                        dataItem[itemLabel] = data;
                        return dataItem;
                    }else{
                        return data;
                    }
                });
                this.setState({target: inputValue, datas: dataItems, value: {l:inputValue, v: ""}, ulStyle: this.state.ulShowStyle});
            }else{
                this.setState({target: inputValue, datas: [], value: {l:inputValue, v: ""}, ulStyle: this.state.ulHideStyle});
            }
        }else{
            if(datas instanceof Array){
                this.initDataList(datas, inputValue, itemValue, itemLabel, shortcut);
            }else{
                this.getDataByAjax(datas, inputValue, itemValue, itemLabel, shortcut);
            }
        }
    }
    getDataByAjax(datas, inputValue, itemValue, itemLabel, shortcut){
        const self = this;
        $.ajax({
            url: datas.url,
            type: datas.method,
            data: {
                input: inputValue.trim(),
                maxLength: datas.length
            },
            dataType: "json",
            success: function(data){
                if(data.ok && data.obj){
                    var ajaxdatas = data.obj;
                    self.initDataList(ajaxdatas, inputValue, itemValue, itemLabel, shortcut);
                }
            }, 
            error(e){
                console.error(e);
            }
        })
    }
    initDataList(datas, inputValue, itemValue, itemLabel, shortcut){
        // 直接等于输入值的
        let tmpValueDatas = [];
        // 从第一个字符开始匹配的
        let tmpFirstDatas = [];
        // 非第一个字符开始匹配的
        let tmpNoFirstDatas = [];
        let inputLowerValue = inputValue.toLowerCase();
        for(let i in datas){
            let data = datas[i];
            let dataItem = {};
            let value = dataItem[itemValue] = typeof data === "string" ? data : data[itemValue];
            let label = dataItem[itemLabel] = typeof data === "string" ? data : data[itemLabel].toString();
            let shortcutkey = typeof data !== "string" && shortcut ? data[shortcut].toLowerCase() : null;
            value = typeof value === "string" ? value.toLowerCase() : value;
            label = typeof label === "string" ? label.toLowerCase() : label;
            if(value == inputLowerValue || (shortcutkey && shortcutkey.indexOf(inputLowerValue) === 0)){
                dataItem["type$res"] = 1;
                tmpValueDatas.push(dataItem);
            }else if(label.indexOf(inputLowerValue) === 0){
                dataItem["type$res"] = 2;
                tmpFirstDatas.push(dataItem);
            }else if(label.indexOf(inputLowerValue) > 0){
                dataItem["type$res"] = 3;
                tmpNoFirstDatas.push(dataItem);
            }
        }
        // 按顺序把数据集连接起来
        tmpValueDatas = tmpValueDatas.concat(tmpFirstDatas).concat(tmpNoFirstDatas);
        this.setState({target: inputValue, datas: tmpValueDatas, value: {l:inputValue, v: ""}, ulStyle: this.state.ulShowStyle});
    }
    handleKeyUp(e){
        let datas = this.state.datas;
        let { itemValue, itemLabel, hoverIndex, hover } = this.state;
        if(datas && datas.length > 0){
            if(e.keyCode == 13){
                this.setState({value: {l: datas[hoverIndex][itemLabel], v: hover}, datas:[], ulStyle: this.state.ulHideStyle});
                if(this.props.onSelect){this.props.onSelect({value:hover, label: datas[hoverIndex][itemLabel]})};
            }else{
                if((e.keyCode == 40 || e.keyCode == 38) && hover == ""){
                    hover = datas[hoverIndex][itemValue];
                }else if(e.keyCode == 40 && hoverIndex < datas.length -1){
                    hover = datas[++hoverIndex][itemValue];
                }else if(e.keyCode == 38 && hoverIndex > 0){
                    hover = datas[--hoverIndex][itemValue];
                }
                this.setState({hover: hover, hoverIndex: hoverIndex});
                if(this.props.onSelect){this.props.onSelect({value:hover, label: datas[hoverIndex][itemLabel]})};
            }
        }
    }
    handleLiClick(e){
        let datas = this.state.datas, targetValue = e.currentTarget.getAttribute("data");
        const { itemValue, itemLabel } = this.state;
        let targetLabel = "";
        for(let i in datas){
            if(targetValue == datas[i][itemValue]){
                targetLabel = datas[i][itemLabel]
                break;
            }
        }
        this.setState({value: {l: targetLabel, v: targetValue}, datas:[], ulStyle: this.state.ulHideStyle});
        if(this.props.onSelect){this.props.onSelect({value:targetValue, label: targetLabel})};
    }
    handleLiMouseOver(e){
        this.setState({hover: e.target.getAttribute("data")});
    }
    handleLiMouseOut(e){
        this.setState({hover: ""});
    }
    renderResList(datas, target, itemValue, itemLabel){
        const self = this;
        const { ulStyle, spanStyle, spanHightStyle } = this.state;
        const dataLength = datas.length;
        let uls = [];
        for(let i in datas){
            let data = datas[i];
            let value = data[itemValue];
            let label = data[itemLabel];
            let key = data["type$res"];
            let liStyle = value == self.state.hover ? self.state.liOverStyle : self.state.liStyle;
            if(i < datas.length - 1 && datas[parseInt(i) + 1]["type$res"] && key != datas[parseInt(i) + 1]["type$res"]){
                liStyle = value == self.state.hover ? self.state.liTypeOverStyle : self.state.liTypeStyle;
            }
            if(!key || key == 1){
                uls.push(<li data={value} key={value} style={liStyle} onClick={self.handleLiClick.bind(this)} onMouseOver={self.handleLiMouseOver.bind(this)} onMouseOut={self.handleLiMouseOut.bind(this)}>{label}</li>);
            } else if(key == 2) {
                let hightLabel = <span style={spanHightStyle}>{target}</span>;
                let commonLabel = <span style={spanStyle}>{label.substr(target.length)}</span>;
                uls.push(<li data={value} key={value} style={liStyle} onClick={self.handleLiClick.bind(this)} onMouseOver={self.handleLiMouseOver.bind(this)} onMouseOut={self.handleLiMouseOut.bind(this)}>{hightLabel}{commonLabel}</li>);
            } else if(key == 3) {
                let hightLabel = <span style={spanHightStyle}>{target}</span>;
                let index = label.indexOf(target);
                let firstLabel = <span style={spanStyle}>{label.substring(0, index)}</span>;
                let lastLabal = <span style={spanStyle}>{label.substr(index + target.length)}</span>;
                uls.push(<li data={value} key={value} style={liStyle} onClick={self.handleLiClick.bind(this)} onMouseOver={self.handleLiMouseOver.bind(this)} onMouseOut={self.handleLiMouseOut.bind(this)}>{firstLabel}{hightLabel}{lastLabal}</li>);
            }
        }
        return <ul style={ulStyle}>{uls}</ul>;
    }
    render(){
        const itemValue = this.state.itemValue, itemLabel = this.state.itemLabel;
        
        const lxs = this.props.lxs || 1;
        const wxs = this.props.wxs || 11;
        
        let uldiv = this.renderResList(this.state.datas, this.state.target, itemValue, itemLabel);
        return (
            <div>
                <Input type='text' ref='name' value={this.state.value.l} data={this.state.value.v} label={this.props.label} 
                    onChange={this.handleChange.bind(this)} 
                    onFocus={this.handleChange.bind(this)} 
                    onKeyUp={this.handleKeyUp.bind(this)} 
                    onBlur={this.handleBlur}
                    bsSize='small' labelClassName={"col-xs-" + lxs} wrapperClassName={"col-xs-" + wxs}>
                    {uldiv}
                </Input>
            </div>
        );
    }
}