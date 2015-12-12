import React, { Component, PropTypes } from 'react';
import { Table } from 'react-bootstrap';

class InfoTable extends Component{
    render(){
        const title = this.props.title;
        const titleWidth = this.props.titleWidth || 30;
        const mode = this.props.mode || "h";
        
        let trs = [];
        let tds = [];
        
        let titleStyle = this.props.titleStyle || {
            fontWeight: "bold",
            color: "grey",
            fontSize: 14,
            verticalAlign: "middle",
            width: 30
        };
        const labelStyle = this.props.labelStyle || {
            fontWeight: "bold",
            fontSize: 12,
            color: "grey",
            paddingRight: 10,
            verticalAlign: "middle",
            textAlign: "right",
            minWidth: 80,
            width: 100,
            cursor: "pointer"
        };
        const contentStyle = this.props.contentStyle || {
            fontSize: 12,
            verticalAlign: "middle",
            minWidth: 80,
            cursor: "pointer"
        };
        const infoLabelStyle = this.props.labelStyle || {
            fontSize: 12,
            verticalAlign: "middle",
            minWidth: 80,
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center",
            color: "gray"
        };
        
        if(mode === "h" || mode === "horizontal"){
            const colsize = this.props.colsize || 6;
            const infos = this.props.infos;
            const rowsize = Math.ceil(infos.length / colsize);
            for(var index in infos){
                let item = infos[index];
                if(index == 0 && title){
                    tds.push(<td style={titleStyle} rowSpan={rowsize} width={titleWidth}>{title}</td>);
                }
                tds.push(<td  style={labelStyle}>{item.label}</td>);
                let link = item.link;
                let width = item.width || 300;
                if(link){
                    if(typeof link == "function"){
                        tds.push(<td style={contentStyle} width={width}><a href="javascript:void(0);" onClick={item.link} rel={item.value}>{item.value}</a></td>);
                    }else{
                        tds.push(<td style={contentStyle} width={width}><a href={link} target="_blank">{item.value}</a></td>);
                    }
                }else{
                    let filter = item.filter, render = item.render, keyValue = item.value;
                    if(filter){
                        keyValue = filter(keyValue);
                    }
                    if(render){
                        keyValue = render(keyValue);
                    }
                    tds.push(<td style={contentStyle} width={width}>{keyValue}</td>);
                }
                if((parseInt(index) + 1) % colsize === 0){
                    trs.push(<tr>{tds}</tr>);
                    tds = [];
                }
            }
            if(tds.length !== 0){
                let tdlength = colsize * 2 - tds.length;
                while(tdlength > 0){
                    tdlength--;
                    tds.push(<td></td>);
                }
                trs.push(<tr>{tds}</tr>);
                tds = null;
            }
        }else if (mode === "v" || mode === "vertical") {
            const { values, labels } = this.props;
            
            for(var index in labels){
                let item = labels[index];
                let width = item.width || 400;
                if(index == 0){
                    tds.push(<td style={titleStyle} rowSpan={values.length + 1} width={titleWidth}>{title}</td>);
                }
                tds.push(<td style={infoLabelStyle} width={width}>{item.label}</td>);
            }
            trs.push(<tr>{tds}</tr>);
            tds = [];
            for(let index in values){
                let value = values[index];
                for(let index in labels){
                    let label = labels[index];
                    let itemValue = value[label.key];
                    let link = label.link;
                    if(link){
                        if(typeof link == "function"){
                            tds.push(<td style={contentStyle}><a href="javascript:void(0);" onClick={link} rel={JSON.stringify(value)}>{itemValue}</a></td>);
                        }else{
                            let linkparams = label.linkparams || [];
                            let linkparamstr = "";
                            for(let i in linkparams){
                                linkparamstr += linkparams[i] + "=" + value[linkparams[i]] + "&";
                            }
                            linkparamstr = linkparamstr === "" ? link : link + "?" + linkparamstr;
                            tds.push(<td style={contentStyle}><a href={linkparamstr} target="_blank">{itemValue}</a></td>);
                        }
                    }else{
                        let filter = label.filter, render = label.render, keyValue = itemValue;
                        if(filter){
                            keyValue = filter(keyValue,value);
                        }
                        if(render){
                            keyValue = render(keyValue,value);
                        }
                        tds.push(<td style={contentStyle} width={width}>{keyValue}</td>);
                    }
                }
                trs.push(<tr>{tds}</tr>);
                tds = [];
            }
            tds = null;
        }
        return (
            <Table striped condensed hover bordered={this.props.bordered}>
                <tbody>
                {trs}
                </tbody>
            </Table>
        );
    }
}
export default InfoTable;