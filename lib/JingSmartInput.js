"use strict";

import React, { PropTypes, Component } from 'react';
import { Panel, Input, Row, Col } from 'react-bootstrap';
import _ from 'underscore';

export default class SmartInput extends Component{
    constructor(props, context) {
        super(props, context);
        this.state = {
            inputted: [],
            inputting: "",
            spanStyle: {backgroundColor: "#f0ad4e", color: "white",  margin:"0 1px", minWidth: 100, height: 30, MozBorderRadius: 2, WebkitBorderRadius: 2, borderRadius: 2, padding: "2px 1px 2px 3px"},
            closeStyle: {background: "-webkit-radial-gradient(30% 30%,#fff 5%,#23558f 95%)", margin:"2px 1px 1px 2px", width: 14, height: 14, MozBorderRadius: "50%", WebkitBorderRadius: "50%", borderRadius: "50%", cursor: "pointer", paddingLeft: 3, paddingRight: 4},
            divStyle: {verticalAlign: "middle", padding: "1px 3px 3px 2px", position: "absolute", top: 3}
        };
    }
    handleChange(e){
        let input = e.target.value.trim().replace(/[;；]/g,"");
        this.setState({inputting: input});
    }
    handleKeyUp(e){
        let input = e.target.value.trim();
        let inputted = this.state.inputted;
        if((e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 186) && input !== ""){
            inputted.push(input);
            this.setState({inputted: _.uniq(inputted), inputting: ""});
            this.resolver(inputted, this.props.resolver);
        }else if(e.keyCode === 8 && input === "" && inputted.length > 0){
            inputted.splice(inputted.length - 1, 1)
            this.setState({inputted: inputted});
            this.resolver(inputted, this.props.resolver);
        }else{
            this.setState({inputting: input});
        }
    }
    resolver(inputted, resolver){
        let out = {};
        for(let i in inputted){
            let value = inputted[i];
            // 1、匹配时间类型
            let dateResolvers = resolver.date;
            if(dateResolvers && dateResolvers.length > 0){
                let flag = false;
                for(let index in dateResolvers){
                    let dateResolver = dateResolvers[index];
                    let later = dateResolver.later;
                    let outparam = dateResolver.out;
                    if(!out[outparam]){
                        if(dateResolver.format && dateResolver.format.test(value)){
                            // 判断时间大小，进行数据交换
                            if(out[later] && value < out[later]){
                                let tmp = out[later];
                                out[later] = value;
                                out[outparam] = tmp;
                            }else{
                                out[outparam] = value;
                            }
                            flag = true;
                            break;
                        }
                    }
                }
                if(flag){continue;}
            }
            // 2、匹配多选类型
            let enumResolvers = resolver.enum;
            if(enumResolvers && enumResolvers.length > 0){
                let flag = false;
                for(let index in enumResolvers){
                    let enumResolver = enumResolvers[index];
                    let type = enumResolver.type;
                    let outparam = enumResolver.out;
                    let options = enumResolver.options;
                    // 字符数组做匹配
                    if((!type || type==="string") && _.indexOf(options, value) >= 0){
                        if(!out[outparam]){
                            out[outparam] = [];
                        }
                        out[outparam].push(value);
                        flag = true;
                        break;
                    }else if(type && type==="object"){
                        let aoptvalue = null;
                        for(let i in options){
                            let option = options[i];
                            if(option.label === value){
                                aoptvalue = option.value;
                                break;
                            }
                        }
                        if(aoptvalue){
                            if(!out[outparam]){
                                out[outparam] = [];
                            }
                            out[outparam].push(aoptvalue);
                            flag = true;
                            break;
                        }
                    }
                }
                if(flag){continue;}
            }
            // 3、匹配单选类型
            let uniqueResolvers = resolver.unique;
            if(uniqueResolvers && uniqueResolvers.length > 0){
                let flag = false;
                for(let index in uniqueResolvers){
                    let uniqueResolver = uniqueResolvers[index];
                    let type = uniqueResolver.type;
                    let outparam = uniqueResolver.out;
                    let options = uniqueResolver.options;
                    if((!type || type==="string") && _.indexOf(options, value) >= 0){
                        out[outparam] = value;
                        flag = true;
                        break;
                    }else if(type && type==="object"){
                        let eoptvalue = null;
                        for(let i in options){
                            let option = options[i];
                            if(option.label === value){
                                eoptvalue = option.value;
                                break;
                            }
                        }
                        if(eoptvalue){
                            out[outparam] = eoptvalue;
                            flag = true;
                            break;
                        }
                    }
                }
                if(flag){continue;}
            }
            // 4、匹配数字类型
            let numberResolvers = resolver.number;
            if(numberResolvers && numberResolvers.length > 0){
                let flag = false;
                for(let index in numberResolvers){
                    let numberResolver = numberResolvers[index];
                    let min = numberResolver.min;
                    let max = numberResolver.max;
                    if(/^\d+(\.\d+)?$/.test(value) && (parseFloat(value) > min && parseFloat(value) < max) ){
                        out[numberResolver.out] = value;
                        flag = true;
                        break;
                    }
                }
                if(flag){continue;}
            }
            // 5、匹配字符类型
            let stringResolvers = resolver.string;
            if(stringResolvers && stringResolvers.length > 0){
                let flag = false;
                for(let index in stringResolvers){
                    let stringResolver = stringResolvers[index];
                    if(stringResolver.format && stringResolver.format.test(value)){
                        out[stringResolver.out] = value;
                        flag = true;
                        break;
                    }
                }
                if(flag){continue;}
            }
            // 6、匹配默认项
            let defResolver = resolver.def;
            if(defResolver){
                out[defResolver.out] = value;
            }
        }
        this.props.onSearch(out);
    }
    handleColse(tag){
        let inputted = _.without(this.state.inputted, tag);
        this.setState({inputted: inputted});
        this.resolver(inputted, this.props.resolver);
    }
    renderTags(inputted){
        let colseTag = this.handleColse;
        const { spanStyle, divStyle, closeStyle } = this.state;
        let tags = inputted.map(function(i,j){
            let close = function(){colseTag(i);};
            return <span key={j} style={spanStyle}>{i}<span key={"c_" + j} style={closeStyle} onClick={close}>×</span></span>;
        });
        if(tags.length === 0 ){
            return <div style={{display: "none"}}></div>;
        }
        return <div style={divStyle}>{tags}</div>;
    }
    getOffsetWidth(str, fontSize){
        let span = document.getElementById("__getoffsetwidth");
        if (span == null) {
            span = document.createElement("span");
            span.id = "__getoffsetwidth";
            document.body.appendChild(span);
            span.style.visibility = "hidden";
            span.style.whiteSpace = "nowrap";
        }
        span.innerText = str;
        span.style.fontSize = typeof fontSize === "string" ? fontSize: fontSize + "px";
        return span.offsetWidth;
    }
    renderCursor(inputted){
        let offset = 0;
        for(let i in inputted){
            offset += this.getOffsetWidth(inputted[i]) + 24;
        }
        return offset === 0 ? 5 : offset + 2;
    }
    render(){
        let tags = this.renderTags(this.state.inputted);
        let cursorLeft = this.renderCursor(this.state.inputted);
        let cursorStyle = {paddingLeft: cursorLeft};
        const lxs = this.props.lxs || 1, wxs = this.props.wxs || 11;
        return (
            <div>
                <Input type='text' ref='name' value={this.state.inputting} label={this.props.label}
                    onChange={this.handleChange.bind(this)} 
                    onKeyUp={this.handleKeyUp.bind(this)}
                    style={cursorStyle}
                    bsSize='small' labelClassName={"col-xs-" + lxs} wrapperClassName={"col-xs-" + wxs}>
                    {tags}
                </Input>
            </div>
        );
    }
}